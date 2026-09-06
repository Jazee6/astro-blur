import type {CollectionEntry} from 'astro:content';
import {sortPosts} from "./index";

/**
 * 标签的规范化身份：大小写不敏感，作为聚合键与 URL 标识。
 */
export function normalizeTag(tag: string): string {
    return tag.trim().toLowerCase();
}

export interface TagEntry {
    /** 规范化标识，用作 URL id */
    id: string;
    /** 首次出现（按置顶、日期降序的文章顺序）时的原始拼写，仅用于展示 */
    label: string;
    count: number;
}

/**
 * 获取所有去重标签及其计数（按数量降序排序，同数按 id 排序保证稳定）
 */
export function getAllTags(posts: CollectionEntry<'posts'>[]): TagEntry[] {
    const byId = new Map<string, TagEntry>();
    for (const post of sortPosts([...posts])) {
        for (const tag of post.data.tags) {
            const id = normalizeTag(tag);
            const existing = byId.get(id);
            if (existing) {
                existing.count++;
            } else {
                byId.set(id, {id, label: tag, count: 1});
            }
        }
    }
    return Array.from(byId.values()).sort((a, b) => b.count - a.count || a.id.localeCompare(b.id));
}

/**
 * 按标签过滤文章（置顶优先，按日期降序）
 */
export function filterPostsByTag(posts: CollectionEntry<'posts'>[], tag: string): CollectionEntry<'posts'>[] {
    const id = normalizeTag(tag);
    return sortPosts(posts.filter(post => post.data.tags.some(t => normalizeTag(t) === id)));
}
