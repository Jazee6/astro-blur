import {describe, expect, test} from "bun:test";
import type {CollectionEntry} from 'astro:content';
import {filterPostsByTag, getAllTags, normalizeTag} from "./tags";

function makePost(id: string, pubDate: string, tags: string[], pinned = false) {
    return {
        id,
        data: {title: id, description: "", pubDate: new Date(pubDate), tags, pinned},
    } as CollectionEntry<'posts'>;
}

describe("normalizeTag", () => {
    test("大小写不敏感，去除首尾空白", () => {
        expect(normalizeTag("Markdown")).toBe("markdown");
        expect(normalizeTag("  Markdown ")).toBe("markdown");
        expect(normalizeTag("机器学习")).toBe("机器学习");
    });
});

describe("getAllTags", () => {
    test("合并大小写不同的标签，展示首次（最新文章）出现的拼写", () => {
        const posts = [
            makePost("old", "2024-01-01", ["Markdown", "Example"]),
            makePost("new", "2026-01-01", ["markdown", "Example"]),
        ];
        const tags = getAllTags(posts);
        const markdown = tags.find(tag => tag.id === "markdown")!;
        expect(markdown.label).toBe("markdown");
        expect(markdown.count).toBe(2);
        expect(tags.find(tag => tag.id === "example")!.count).toBe(2);
        expect(tags).toHaveLength(2);
    });

    test("按数量降序排序，计数相同时按 id 排序保证稳定", () => {
        const posts = [
            makePost("a", "2026-01-01", ["Alpha", "Beta"]),
            makePost("b", "2025-01-01", ["alpha"]),
        ];
        const tags = getAllTags(posts);
        expect(tags.map(tag => tag.id)).toEqual(["alpha", "beta"]);
    });
});

describe("filterPostsByTag", () => {
    test("按规范化标识过滤并排序（置顶优先，日期降序）", () => {
        const posts = [
            makePost("older", "2024-01-01", ["Astro"]),
            makePost("newer", "2026-01-01", ["ASTRO"]),
            makePost("pinned", "2025-01-01", ["astro"], true),
            makePost("other", "2026-06-01", ["Other"]),
        ];
        expect(filterPostsByTag(posts, "AsTrO").map(post => post.id)).toEqual(["pinned", "newer", "older"]);
    });
});
