import {createHash} from "node:crypto";
import {fileURLToPath} from "node:url";
import {createMermaidRenderer, type MermaidRenderer, type RenderResult} from "mermaid-isomorphic";
import {chromium, type LaunchOptions} from "playwright";
import {defineHastPlugin} from "satteri";

const DIAGRAM_INDEX_KEY = "hastMermaidDiagramIndex";

/**
 * 依次尝试本机 Edge、Chrome 与 Playwright 自带的 Chromium，使用第一个能启动的浏览器。
 */
const BROWSER_CANDIDATES: {name: string; launchOptions: LaunchOptions}[] = [
    {name: "Microsoft Edge", launchOptions: {channel: "msedge", headless: true}},
    {name: "Google Chrome", launchOptions: {channel: "chrome", headless: true}},
    {name: "Playwright Chromium", launchOptions: {headless: true}},
];

async function findLaunchOptions(): Promise<LaunchOptions> {
    const failures: string[] = [];
    for (const {name, launchOptions} of BROWSER_CANDIDATES) {
        try {
            const browser = await chromium.launch(launchOptions);
            await browser.close();
            return launchOptions;
        } catch (error) {
            failures.push(`${name}: ${error instanceof Error ? error.message.split("\n")[0] : String(error)}`);
        }
    }
    throw new Error([
        "Mermaid 渲染需要一个 Chromium 内核浏览器：请安装 Microsoft Edge 或 Google Chrome，",
        "或运行 `bunx playwright install chromium`。",
        ...failures,
    ].join("\n"));
}

// 只在首次遇到 Mermaid 源代码块时探测浏览器，没有图表的站点构建不需要浏览器
let rendererPromise: Promise<MermaidRenderer> | undefined;

function getRenderer(): Promise<MermaidRenderer> {
    rendererPromise ??= findLaunchOptions().then(launchOptions => createMermaidRenderer({launchOptions}));
    return rendererPromise;
}

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
    const renderer = await getRenderer();
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
