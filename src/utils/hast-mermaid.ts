import {createHash} from "node:crypto";
import {fileURLToPath} from "node:url";
import {createMermaidRenderer, type RenderResult} from "mermaid-isomorphic";
import {defineHastPlugin} from "satteri";

const DIAGRAM_INDEX_KEY = "hastMermaidDiagramIndex";
const renderer = createMermaidRenderer({
    launchOptions: {
        channel: "msedge",
        headless: true,
    },
});

const themes = ["default", "dark"] as const;
type MermaidTheme = (typeof themes)[number];

function isMermaidCodeBlock(className: unknown): boolean {
    if (Array.isArray(className)) {
        return className.includes("language-mermaid");
    }
    return typeof className === "string" && className.split(/\s+/).includes("language-mermaid");
}

function createDiagramPrefix(location: string, index: number, source: string): string {
    const digest = createHash("sha256")
        .update(location)
        .update("\0")
        .update(String(index))
        .update("\0")
        .update(source)
        .digest("hex")
        .slice(0, 12);

    return `mermaid-${digest}-${index}`;
}

function unwrapRenderResult(result: PromiseSettledResult<RenderResult>, theme: MermaidTheme): RenderResult {
    if (result.status === "fulfilled") {
        return result.value;
    }

    throw new Error(`Failed to render the ${theme} Mermaid diagram`, {cause: result.reason});
}

async function renderTheme(source: string, prefix: string, theme: MermaidTheme): Promise<RenderResult> {
    const [result] = await renderer([source], {
        prefix: `${prefix}-${theme}`,
        mermaidConfig: {
            deterministicIds: true,
            deterministicIDSeed: `${prefix}-${theme}`,
            secure: ["securityLevel", "theme", "themeVariables"],
            securityLevel: "strict",
            suppressErrorRendering: true,
            theme,
        },
    });

    if (!result) {
        throw new Error(`Mermaid returned no ${theme} render result`);
    }

    return unwrapRenderResult(result, theme);
}

export async function renderMermaidDiagram(source: string, prefix: string): Promise<string> {
    const [light, dark] = await Promise.all(
        themes.map((theme) => renderTheme(source, prefix, theme)),
    );

    return [
        '<div class="mermaid-diagram">',
        `  <div class="mermaid-diagram__theme mermaid-diagram__theme--light" style="--mermaid-width: ${light.width}px">${light.svg}</div>`,
        `  <div class="mermaid-diagram__theme mermaid-diagram__theme--dark" style="--mermaid-width: ${dark.width}px">${dark.svg}</div>`,
        "</div>",
    ].join("\n");
}

export const hastMermaid = defineHastPlugin({
    name: "hast-mermaid",
    before(_root, context) {
        context.data[DIAGRAM_INDEX_KEY] = 0;
    },
    element: {
        filter: ["code"],
        async visit(node, context) {
            if (!isMermaidCodeBlock(node.properties.className)) {
                return;
            }

            const parent = context.parent(node);
            if (parent?.type !== "element" || parent.tagName !== "pre") {
                return;
            }

            const index = Number(context.data[DIAGRAM_INDEX_KEY] ?? 0);
            context.data[DIAGRAM_INDEX_KEY] = index + 1;

            const source = context.textContent(node).replace(/\n$/, "");
            const location = context.fileURL?.href ?? "inline-markdown";
            const prefix = createDiagramPrefix(location, index, source);

            try {
                const html = await renderMermaidDiagram(source, prefix);
                context.replaceNode(parent, {type: "raw", value: html});
            } catch (error) {
                const file = context.fileURL ? fileURLToPath(context.fileURL) : "Markdown input";
                throw new Error(`Unable to render Mermaid diagram ${index + 1} in ${file}`, {cause: error});
            }
        },
    },
});
