import rss from '@astrojs/rss';
import {getCollection} from 'astro:content';
import {siteConfig} from "../config";

export async function GET(context) {
    const posts = await getCollection('posts', ({data}) => {
        return import.meta.env.PROD ? data.isDraft !== true : true
    });
    return rss({
        title: siteConfig.title,
        description: siteConfig.description,
        site: context.site,
        items: posts.map(({data, id, body}) => ({
            title: data.title,
            description: data.description,
            link: `/posts/${id}`,
            pubDate: data.pubDate,
            content: body,
        })),
    });
}
