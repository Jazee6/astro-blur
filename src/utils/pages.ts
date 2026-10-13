/**
 * 主题自身占用的顶层路径段；独立页面不得使用
 */
const RESERVED_SEGMENTS = new Set([
    "posts",
    "tags",
    "links",
    "projects",
    "rss.xml",
    "robots.txt",
    "404",
    "pagefind",
    "_astro",
]);

/**
 * 返回独立页面路径与保留路径冲突的原因；无冲突时返回 null。
 * 纯数字的首段与首页分页（/2、/3 …）冲突，sitemap-index.xml / sitemap-N.xml 与站点地图冲突。
 */
export function getReservedPathConflict(pageId: string): string | null {
    const first = pageId.split("/")[0].toLowerCase();
    if (RESERVED_SEGMENTS.has(first)) {
        return `"/${first}" is reserved by the theme`;
    }
    if (/^\d+$/.test(first)) {
        return `the numeric path "/${first}" collides with home page pagination`;
    }
    if (/^sitemap-(index|\d+)\.xml$/.test(first)) {
        return `"/${first}" collides with the sitemap`;
    }
    return null;
}
