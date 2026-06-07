import type {CollectionEntry} from 'astro:content';

/**
 * 获取所有去重标签（按数量降序排序）
 */
export function getAllTags(posts: CollectionEntry<'posts'>[]): string[] {
    const counts = getTagCounts(posts);
    const tagSet = new Set<string>();
    for (const post of posts) {
        for (const tag of post.data.tags) {
            tagSet.add(tag.toLowerCase());
        }
    }
    return Array.from(tagSet).sort((a, b) => (counts.get(b) || 0) - (counts.get(a) || 0));
}

/**
 * 获取每个标签的文章数
 */
export function getTagCounts(posts: CollectionEntry<'posts'>[]): Map<string, number> {
    const counts = new Map<string, number>();
    for (const post of posts) {
        for (const tag of post.data.tags) {
            const key = tag.toLowerCase();
            counts.set(key, (counts.get(key) || 0) + 1);
        }
    }
    return counts;
}

/**
 * 按标签过滤文章（按日期降序）
 */
export function filterPostsByTag(posts: CollectionEntry<'posts'>[], tag: string): CollectionEntry<'posts'>[] {
    const normalized = tag.toLowerCase();
    return posts
        .filter(post => post.data.tags.some(t => t.toLowerCase() === normalized))
        .sort((a, b) => {
            if (a.data.pinned !== b.data.pinned) return a.data.pinned ? -1 : 1;
            return b.data.pubDate.valueOf() - a.data.pubDate.valueOf();
        });
}
