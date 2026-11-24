# Astro Blur

A static blog theme built with Astro — posts, standalone pages, friend links, projects, and site search out of the box.

English | [中文](./README.zh.md)

![Theme Preview](https://blog-cdn.vuiki.com/2024/07/6e7813e44dad9a35be6c42b2c2e4eb53.webp)

## Features

- **Pure Astro & Static** — Zero React/Vue runtime; ships with neutral demo content and local assets.
- **Site Search** — [Pagefind](https://pagefind.app/) indexes posts, standalone pages, friend links, and projects.
- **Reading Experience** — Responsive layout, syntax highlighting, build-time Mermaid diagrams, and collapsible TOC.
- **Tags & SEO** — Case-insensitive paginated tags, OpenGraph, Sitemap, summary-only RSS, and Web App Manifest.
- **Theme Mode & Motion** — Flash-free system / light / dark modes with restrained, reduced-motion-aware transitions.
- **Bilingual UI** — English and Chinese interface (`en` / `zh`) with per-post language support.
- **Optional Comments** — [Twikoo](https://twikoo.js.org/) support, disabled by default.

## Quick Start

Requires [Bun](https://bun.sh) (plus a Chromium-based browser only when building posts with Mermaid diagrams).

```shell
npx degit Jazee6/astro-blur#main my-blog
cd my-blog
bun install
bun run dev
```

Common scripts:

| Command | Description |
| --- | --- |
| `bun run dev` | Start dev server |
| `bun run new <path>` | Create a post under `src/content/posts/` |
| `bun run build` | Type-check, build, and generate Pagefind index |
| `bun run preview` | Preview the production build locally |

## Project Structure

```text
src/
├── content/
│   ├── posts/      # Posts (nested directories and .md / .mdx supported)
│   ├── pages/      # Standalone pages
│   └── data/       # Friend links and projects
└── config.ts       # Site configuration
```

## Guide

### Configuration & Comments

Edit `src/config.ts` to configure site metadata, navigation, social links, pagination, site language, and comments.

- **Site language**: Set `language` (`en` by default; supports `en` and `zh` / `zh-CN`, others fall back to `en`).
- **Comments**: Disabled by default. Set `twikooUri` to your [Twikoo](https://twikoo.js.org/) endpoint to enable (loaded from jsDelivr v1.7.19 with SRI).

### Writing Posts

`bun run new` supports nested paths and preserves `.md` / `.mdx` extensions:

```shell
bun run new hello-world         # src/content/posts/hello-world.md
bun run new notes/2026/hello    # src/content/posts/notes/2026/hello.md
bun run new notes/hello.mdx     # src/content/posts/notes/hello.mdx
```

For a post written in a different language than the site, set `lang` in frontmatter:

```yaml
---
title: 你好
lang: zh   # optional, defaults to site language
---
```

> Only post content is marked with `lang`; the surrounding UI stays in the site language. If your site mixes CJK posts with another site language, add `force_language: zh` (or `ja`) to a root `pagefind.yml` for in-sentence search.

### Standalone Pages

Markdown/MDX files under `src/content/pages/` map directly to URLs, including subdirectories (`pages/docs/guide.md` → `/docs/guide`):

```yaml
---
title: About
description: About this site   # optional, defaults to title
comments: true                 # optional, defaults to false (requires twikooUri)
---
```

Paths must not collide with reserved paths (`posts`, `tags`, `links`, `projects`, `rss.xml`, `robots.txt`, `404`, `pagefind`, sitemap, or numeric homepage pagination) — conflicts fail the build.

### Mermaid Diagrams

Mermaid code blocks render at build time into separate light and dark SVGs (zero client-side JS). The build looks for Edge, Chrome, or Playwright Chromium (`bunx playwright install chromium`), and fails on missing browsers or invalid diagrams.

## Showcase

- [Hi! Jazee](https://vuiki.com)

PRs are welcome to add your site.
