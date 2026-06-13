import type {CollectionEntry} from 'astro:content';

/**
 * 一次遍历获取所有去重标签及其计数（按数量降序排序）
 */
export function getAllTags(posts: CollectionEntry<'posts'>[]): { tags: string[], counts: Map<string, number> } {
    const counts = new Map<string, number>();
    for (const post of posts) {
        for (const tag of post.data.tags) {
            const key = tag.toLowerCase();
            counts.set(key, (counts.get(key) || 0) + 1);
        }
    }
    const tags = Array.from(counts.keys()).sort((a, b) => (counts.get(b) || 0) - (counts.get(a) || 0));
    return {tags, counts};
}

/**
 * 按标签过滤文章（置顶优先，按日期降序）
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
