import {defineConfig} from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import icon from "astro-icon";
import {remarkModifiedTime} from "./src/utils/remark-modified-time";
import {siteConfig} from "./src/config";

import tailwindcss from '@tailwindcss/vite';
import RehypeImage from "./src/utils/rehype-image.tsx";

// https://astro.build/config
export default defineConfig({
    site: siteConfig.site,
    integrations: [mdx(), sitemap(), icon()],
    markdown: {
        shikiConfig: {
            themes: {
                light: 'github-light',
                dark: 'github-dark'
            }
        },
        remarkPlugins: [remarkModifiedTime],
        rehypePlugins: [RehypeImage],
    },
    devToolbar: {
        enabled: false
    },
    vite: {
        plugins: [tailwindcss()]
    },
});
