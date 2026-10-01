import {describe, expect, test} from "bun:test";
import type {CollectionEntry} from 'astro:content';
import {getTimeline, serializeJsonLd, sortPosts} from "./index";

function makePost(id: string, pubDate: string, pinned = false) {
    return {id, data: {title: id, description: "", pubDate: new Date(pubDate), tags: [], pinned}} as CollectionEntry<'posts'>;
}

describe("serializeJsonLd", () => {
    test("转义 < 防止提前闭合 script 标签，且仍是合法 JSON", () => {
        const data = {headline: "</script><script>alert(1)</script>"};
        const json = serializeJsonLd(data);
        expect(json).not.toContain("<");
        expect(JSON.parse(json)).toEqual(data);
    });
});

describe("getTimeline", () => {
    test("按发布日期升序，置顶不影响位置，同日按 id 排序，且不修改原数组", () => {
        const posts = sortPosts([
            makePost("b", "2025-01-01"),
            makePost("pinned-old", "2020-01-01", true),
            makePost("a", "2025-01-01"),
            makePost("newest", "2026-01-01"),
        ]);
        const before = posts.map(post => post.id);
        expect(getTimeline(posts).map(post => post.id)).toEqual(["pinned-old", "a", "b", "newest"]);
        expect(posts.map(post => post.id)).toEqual(before);
    });
});
