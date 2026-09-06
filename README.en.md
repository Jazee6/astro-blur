# Astro Blur

A static blog theme built with Astro: posts, pages, friend links, projects and site search out of the box, with optional comments.

[中文](./README.md) | English

![Theme Preview](https://blog-cdn.jaze.top/2024/07/6e7813e44dad9a35be6c42b2c2e4eb53.webp)

## Features

- ✅ Pure Astro components, no React/Vue runtime, fully static generation
- ✅ Site search (Pagefind): indexes posts, standalone pages, links and projects — not the homepage, pagination or tag aggregation pages
- ✅ Tags: case-insensitive identities, displaying the spelling of the first occurrence, with a normalized URL id and paginated post lists
- ✅ Optional Twikoo comments (disabled by default)
- ✅ SEO friendly — OpenGraph / Sitemap / RSS (summary and original link only) / Web App Manifest
- ✅ Responsive layout / code highlight / Mermaid diagrams / light-dark theme switch (no flash)
- ✅ Neutral demo content and local assets, ready to be replaced with your own site

## Requirements

- [Bun](https://bun.sh) (package management and scripts)
- Microsoft Edge (required to build Mermaid diagrams, see below)

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

## Comments (Optional)

Comments are disabled by default. Set `twikoo_uri` in `src/config.ts` to your
[Twikoo](https://twikoo.js.org/) deployment URL to enable them. The script is loaded from jsDelivr at the fixed version 1.7.19 with SRI verification.

## Mermaid Diagrams

Mermaid source blocks in posts are rendered into separate light and dark SVGs at build time and switch with the site theme without client-side scripts. Rendering requires Microsoft Edge installed locally as the browser engine for mermaid-isomorphic. The build fails if Edge is unavailable or a diagram is invalid.

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
