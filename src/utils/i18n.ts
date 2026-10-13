import {siteConfig} from "../config.ts";

const en = {
    menu: "Menu",
    search: "Search",
    searchPlaceholder: "Search...",
    themeToggle: "Switch theme mode",
    // 按钮在 system → light → dark 之间循环，每种模式对应一整句，不拼接片段
    themeButton: {
        system: "Theme: system. Switch to light",
        light: "Theme: light. Switch to dark",
        dark: "Theme: dark. Switch to system",
    },
    toc: "Contents",
    previousPost: "← Previous",
    nextPost: "Next →",
    previousPage: "Previous page",
    nextPage: "Next page",
    commentsLoading: "Loading comments",
    commentsUnavailable: "Comments are unavailable",
    pageNotFound: "Page Not Found",
    links: "Links",
    linksDescription: "Friend links",
    projects: "Projects",
    tags: "Tags",
    tagsDescription: "All tags",
    noTags: "No tags yet.",
    allTags: "← All Tags",
    tagTitle: (tag: string) => `Tag: ${tag}`,
    tagDescription: (tag: string) => `Posts tagged with "${tag}"`,
};

type Messages = typeof en;

const zh: Messages = {
    menu: "菜单",
    search: "搜索",
    searchPlaceholder: "搜索...",
    themeToggle: "切换主题模式",
    themeButton: {
        system: "主题：跟随系统，点击切换为浅色",
        light: "主题：浅色，点击切换为深色",
        dark: "主题：深色，点击切换为跟随系统",
    },
    toc: "目录",
    previousPost: "← 上一篇",
    nextPost: "下一篇 →",
    previousPage: "上一页",
    nextPage: "下一页",
    commentsLoading: "评论加载中",
    commentsUnavailable: "评论暂不可用",
    pageNotFound: "页面不存在",
    links: "友链",
    linksDescription: "友情链接",
    projects: "项目",
    tags: "标签",
    tagsDescription: "全部标签",
    noTags: "还没有标签。",
    allTags: "← 全部标签",
    tagTitle: (tag: string) => `标签：${tag}`,
    tagDescription: (tag: string) => `标签为「${tag}」的文章`,
};

const messages: Record<string, Messages> = {en, zh};

/**
 * 站点语言对应的界面文案：按主语言子标签匹配（zh-CN → zh），不支持的语言回退为英文
 */
export const t: Messages = messages[siteConfig.language.toLowerCase().split("-")[0]] ?? en;

/**
 * 内容的 lang 属性：与站点语言相同时省略，交由 <html lang> 继承
 */
export function contentLang(lang: string | undefined): string | undefined {
    return lang && lang !== siteConfig.language ? lang : undefined;
}
