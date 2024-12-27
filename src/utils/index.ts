import {siteConfig} from "../config.ts";

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
