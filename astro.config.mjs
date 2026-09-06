import {defineConfig} from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import icon from "astro-icon";
import {satteri} from '@astrojs/markdown-satteri';
import {mdastModifiedTime} from "./src/utils/mdast-modified-time";
import {hastImage} from "./src/utils/hast-image";
import {hastMermaid} from "./src/utils/hast-mermaid";
import {siteConfig} from "./src/config";

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
    site: siteConfig.site,
    integrations: [mdx(), sitemap(), icon()],
    markdown: {
        syntaxHighlight: {
            type: "shiki",
            excludeLangs: ["mermaid"],
        },
        shikiConfig: {
            themes: {
                light: 'github-light',
                dark: 'github-dark'
            }
        },
        processor: satteri({
            mdastPlugins: [mdastModifiedTime],
            hastPlugins: [hastImage, hastMermaid],
        }),
    },
    devToolbar: {
        enabled: false
    },
    vite: {
        plugins: [tailwindcss()]
    },
});
