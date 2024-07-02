import {getCollection} from "astro:content";
import {siteConfig} from "../config.ts";

export async function getIndexPosts() {
    const posts = await getCollection('posts', ({data}) => {
        return import.meta.env.PROD ? data.isDraft !== true : true
    })
    return posts.sort(
        (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
    )
}

export async function getSlugPosts() {
    return await getCollection('posts', ({data}) => {
        return import.meta.env.PROD ? data.isDraft !== true : true
    })
}

export function debounce(fn: Function, delay: number = 100) {
    let timeoutId: NodeJS.Timeout;
    return function (...args: any[]) {
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
    return desc + ' - ' + siteConfig.description
}
