# Astro Blur

A static blog theme built with Astro: posts, pages, friend links, projects and site search out of the box, with optional comments.

English | [中文](./README.zh.md)

![Theme Preview](https://blog-cdn.jaze.top/2024/07/6e7813e44dad9a35be6c42b2c2e4eb53.webp)

## Features

- ✅ Pure Astro components, no React/Vue runtime, fully static generation
- ✅ Site search (Pagefind): indexes posts, standalone pages, links and projects — not the homepage, pagination or tag aggregation pages
- ✅ Tags: case-insensitive identities, displaying the spelling of the first occurrence, with a normalized URL id and paginated post lists
- ✅ Optional Twikoo comments (disabled by default)
- ✅ SEO friendly — OpenGraph / Sitemap / RSS (summary and original link only) / Web App Manifest
- ✅ Responsive layout / code highlight / Mermaid diagrams / table of contents (collapsible on small screens)
- ✅ Theme mode: system / light / dark (no flash; system mode follows OS changes live)
- ✅ Restrained motion: cross-fade on page and theme changes, open/close transitions for popovers (progressive enhancement; respects reduced-motion)
- ✅ UI in English or Chinese, with a per-post language for posts written in another language
- ✅ Neutral demo content and local assets, ready to be replaced with your own site

## Requirements

- [Bun](https://bun.sh) (package management and scripts)
- A Chromium-based browser (only needed to build posts containing Mermaid diagrams, see below)

## Quick Start

```shell
# Download template
npx degit Jazee6/astro-blur#main my-blog

# Enter project
cd my-blog

# Install dependencies
bun install

# Start project
bun run dev

# Create a new post (see below)
bun run new hello-world

# Build (with type checking) and preview locally
bun run build
bun run preview
```

## Creating a Post

`bun run new` accepts safe relative nested paths under the posts directory:

```shell
bun run new hello-world            # Creates src/content/posts/hello-world.md
bun run new notes/2026/hello       # Creates the directories and src/content/posts/notes/2026/hello.md
bun run new notes/hello.mdx        # Preserves the .md / .mdx extension
```

## Configuration

Site information, navigation, social links, and pagination size are configured in `src/config.ts`.

## Languages

`language` in `src/config.ts` sets the site language (`en` by default). It is used for `<html lang>`, dates and the UI text, which is available in English (`en`) and Chinese (`zh`, including tags such as `zh-CN`); other languages fall back to English.

A post written in another language can declare it in its frontmatter:

```yaml
---
title: 你好
lang: zh   # optional, defaults to the site language
---
```

Only the post's own text (title, description, body, table of contents entries and search results) is marked with that language; the surrounding UI stays in the site language.

Pagefind builds its search index in the language of `<html lang>`. If the site mixes Chinese or Japanese posts into a site in another language, add a `pagefind.yml` with `force_language: zh` (or `ja`) at the project root, so that words inside sentences can be found; English is still matched by prefix but loses stemming.

## Standalone Pages

Each Markdown/MDX file under `src/content/pages/` becomes a standalone page whose path is its URL; subdirectories are supported (`pages/docs/guide.md` → `/docs/guide`):

```yaml
---
title: About
description: About this site   # optional, defaults to title
comments: true                 # optional, defaults to false; requires twikooUri
---
```

Page paths must not overlap theme-reserved paths (`posts`, `tags`, `links`, `projects`, `rss.xml`, `robots.txt`, `404`, `pagefind`, the sitemap, or numeric homepage pagination paths); the build fails and names the offending file.

## Comments (Optional)

Comments are disabled by default. Set `twikooUri` in `src/config.ts` to your
[Twikoo](https://twikoo.js.org/) deployment URL to enable them. The script is loaded from jsDelivr at the fixed version 1.7.19 with SRI verification.

## Mermaid Diagrams

Mermaid source blocks in posts are rendered into separate light and dark SVGs at build time and switch with the site theme without client-side scripts. Rendering needs a Chromium-based browser: the build tries the locally installed Microsoft Edge, then Google Chrome, then Playwright's bundled Chromium (install it with `bunx playwright install chromium`), and fails with a hint if none can launch. Invalid diagrams also fail the build.

## Project Structure

```
src/
├── content/
│   ├── posts/      # Posts (nested directories and .md / .mdx are supported)
│   ├── pages/      # Standalone pages
│   └── data/       # Friend links and project data
└── config.ts       # Site configuration
```

## Who is using Astro Blur?

- [Hi! Jazee](https://jaze.top)

Welcome to submit PR to add your site
