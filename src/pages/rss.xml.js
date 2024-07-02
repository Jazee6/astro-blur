import rss from '@astrojs/rss';
import {getCollection} from 'astro:content';
import {siteConfig} from "../config";

export async function GET(context) {
    const posts = await getCollection('posts');
    return rss({
        title: siteConfig.title,
        description: siteConfig.description,
        site: context.site,
        items: posts.map(({data, slug}) => ({
            title: data.title,
            description: data.description,
            link: `/posts/${slug}`,
            pubDate: data.pubDate,
        })),
    });
}
