import {describe, expect, test} from "bun:test";
import {markdownToHtml} from "satteri";
import {hastMermaid} from "./hast-mermaid";

const accessibleDiagram = `flowchart LR
  accTitle: 内容发布流程
  accDescr: Markdown 文章构建为静态页面
  A[Markdown] --> B[静态页面]`;

describe("hastMermaid", () => {
    test("replaces Mermaid source blocks with accessible light and dark diagrams", async () => {
        const markdown = [
            "```mermaid",
            accessibleDiagram,
            "```",
            "",
            "```mermaid",
            accessibleDiagram,
            "```",
        ].join("\n");

        const {html} = await markdownToHtml(markdown, {
            fileURL: new URL("file:///content/example.md"),
            hastPlugins: [hastMermaid],
        });

        expect(html.match(/class="mermaid-diagram"/g)).toHaveLength(2);
        expect(html.match(/mermaid-diagram__theme--light/g)).toHaveLength(2);
        expect(html.match(/mermaid-diagram__theme--dark/g)).toHaveLength(2);
        expect(html.match(/<title/g)).toHaveLength(4);
        expect(html.match(/<desc/g)).toHaveLength(4);
        expect(html).not.toContain("language-mermaid");

        const svgIds = [...html.matchAll(/<svg id="([^"]+)"/g)].map((match) => match[1]);
        expect(svgIds).toHaveLength(4);
        expect(new Set(svgIds).size).toBe(4);
    }, 30_000);

    test("fails compilation for invalid Mermaid source", async () => {
        const compile = markdownToHtml("```mermaid\nnot a valid diagram\n```", {
            fileURL: new URL("file:///content/invalid.md"),
            hastPlugins: [hastMermaid],
        });

        await expect(compile).rejects.toThrow("Unable to render Mermaid diagram 1 in /content/invalid.md");
    }, 30_000);
});
