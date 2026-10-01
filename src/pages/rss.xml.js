import rss from '@astrojs/rss';
import {siteConfig} from "../config";
import {getPublishedPosts} from "../utils/posts";

export async function GET(context) {
    // 与站点其他列表一致：置顶优先，再按日期降序
    const posts = await getPublishedPosts();
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
