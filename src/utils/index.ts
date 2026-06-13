import {siteConfig} from "../config.ts";
import type {CollectionEntry} from 'astro:content';

export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(fn: T, delay: number = 100) {
    let timeoutId: ReturnType<typeof setTimeout>;
    return function (...args: Parameters<T>) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            fn(...args);
        }, delay);
    };
}

export function getTitle(title: string) {
    return title + ' - ' + siteConfig.title
}

export function getDesc(desc: string) {
    return desc
}

/**
 * 统一排序：置顶优先，再按日期降序
 */
export function sortPosts(posts: CollectionEntry<'posts'>[]): CollectionEntry<'posts'>[] {
    return posts.sort((a, b) => {
        if (a.data.pinned !== b.data.pinned) return a.data.pinned ? -1 : 1;
        return b.data.pubDate.valueOf() - a.data.pubDate.valueOf();
    });
}
