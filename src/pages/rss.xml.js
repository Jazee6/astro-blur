import rss from '@astrojs/rss';
import {getCollection} from 'astro:content';
import {siteConfig} from "../config";
import {sortPosts} from "../utils";

export async function GET(context) {
    const posts = await getCollection('posts', ({data}) => {
        return import.meta.env.PROD ? data.isDraft !== true : true
    });
    // 与站点其他列表一致：置顶优先，再按日期降序
    sortPosts(posts);
    return rss({
        title: siteConfig.title,
        description: siteConfig.description,
        site: context.site,
        // RSS 条目只包含发布元数据、description 摘要与原文链接，不输出文章内容
        items: posts.map(({data, id}) => ({
            title: data.title,
            description: data.description,
            link: `/posts/${id}`,
            pubDate: data.pubDate,
        })),
    });
}
