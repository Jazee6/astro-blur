import {getCollection} from 'astro:content';
import type {CollectionEntry} from 'astro:content';
import {sortPosts} from "./index";

/**
 * 已发布文章（列表顺序：置顶优先，再按日期降序）。
 * 开发环境包含草稿，生产构建排除 isDraft 文章。
 */
export async function getPublishedPosts(): Promise<CollectionEntry<'posts'>[]> {
    const posts = await getCollection('posts', ({data}) => import.meta.env.DEV || data.isDraft !== true);
    return sortPosts(posts);
}
