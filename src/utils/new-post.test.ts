import {afterEach, describe, expect, test} from "bun:test";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {createPost, PostPathError, resolvePostPath} from "./new-post";

const root = fs.mkdtempSync(path.join(os.tmpdir(), "astro-blur-new-post-"));

afterEach(() => {
    fs.rmSync(root, {recursive: true, force: true});
    fs.mkdirSync(root, {recursive: true});
});

describe("resolvePostPath", () => {
    test("补全缺省的 .md 扩展名", () => {
        expect(resolvePostPath("hello", root)).toBe(path.join(root, "hello.md"));
    });

    test("保留 .md 与 .mdx 扩展名", () => {
        expect(resolvePostPath("hello.md", root)).toBe(path.join(root, "hello.md"));
        expect(resolvePostPath("hello.mdx", root)).toBe(path.join(root, "hello.mdx"));
        // 大写扩展名归一化为小写，保证内容加载器能识别
        expect(resolvePostPath("hello.MD", root)).toBe(path.join(root, "hello.md"));
        expect(resolvePostPath("hello.MdX", root)).toBe(path.join(root, "hello.mdx"));
    });

    test("支持安全的相对嵌套路径", () => {
        expect(resolvePostPath("notes/2026/hello", root)).toBe(path.join(root, "notes/2026/hello.md"));
        expect(resolvePostPath("notes/2026/hello.mdx", root)).toBe(path.join(root, "notes/2026/hello.mdx"));
    });

    test("拒绝绝对路径", () => {
        expect(() => resolvePostPath("/etc/passwd", root)).toThrow(PostPathError);
        expect(() => resolvePostPath(path.join(root, "hello"), root)).toThrow(PostPathError);
    });

    test("拒绝空路径与空白路径", () => {
        expect(() => resolvePostPath("", root)).toThrow(PostPathError);
        expect(() => resolvePostPath("   ", root)).toThrow(PostPathError);
    });

    test("拒绝空路径段（连续分隔符或尾部分隔符）", () => {
        expect(() => resolvePostPath("a//b", root)).toThrow(PostPathError);
        expect(() => resolvePostPath("a/", root)).toThrow(PostPathError);
        expect(() => resolvePostPath("a\\b", root)).not.toThrow();
    });

    test("拒绝点段与父级跳转", () => {
        expect(() => resolvePostPath(".", root)).toThrow(PostPathError);
        expect(() => resolvePostPath("..", root)).toThrow(PostPathError);
        expect(() => resolvePostPath("a/../b", root)).toThrow(PostPathError);
        expect(() => resolvePostPath("a/./b", root)).toThrow(PostPathError);
    });

    test("拒绝不支持的扩展名", () => {
        expect(() => resolvePostPath("hello.txt", root)).toThrow(PostPathError);
        expect(() => resolvePostPath("notes/hello.html", root)).toThrow(PostPathError);
    });
});

describe("createPost", () => {
    test("安全创建嵌套目录并写入文章", () => {
        const created = createPost("notes/2026/hello", root);
        expect(created).toBe(path.join(root, "notes/2026/hello.md"));
        expect(fs.existsSync(created)).toBe(true);
        expect(fs.readFileSync(created, "utf-8")).toContain('title: "hello"');
    });

    test("转义可能破坏 YAML 的标题字符", () => {
        const created = createPost("notes/title: draft", root);
        const content = fs.readFileSync(created, "utf-8");
        expect(content).toContain('title: "title: draft"');
        expect(content).toContain('description: "title: draft"');
    });

    test("从不覆盖已有文章", () => {
        createPost("hello", root);
        expect(() => createPost("hello", root)).toThrow(PostPathError);
        expect(() => createPost("hello.md", root)).toThrow(PostPathError);
    });

    test("非法路径不产生任何文件", () => {
        expect(() => createPost("../escape", root)).toThrow(PostPathError);
        expect(fs.readdirSync(root)).toHaveLength(0);
    });
});
