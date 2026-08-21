import {defineConfig} from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import icon from "astro-icon";
import {satteri} from '@astrojs/markdown-satteri';
import {mdastModifiedTime} from "./src/utils/mdast-modified-time";
import {hastImage} from "./src/utils/hast-image";
import {siteConfig} from "./src/config";

import tailwindcss from '@tailwindcss/vite';

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
        processor: satteri({
            mdastPlugins: [mdastModifiedTime],
            hastPlugins: [hastImage],
        }),
    },
    devToolbar: {
        enabled: false
    },
    vite: {
        plugins: [tailwindcss()]
    },
});
