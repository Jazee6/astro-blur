# Astro Blur

基于 Astro 的静态博客主题，开箱支持文章、独立页面、友链、项目与站内搜索。

[English](./README.md) | 中文

![Theme Preview](https://blog-cdn.vuiki.com/2024/07/6e7813e44dad9a35be6c42b2c2e4eb53.webp)

## 特性

- **纯静态 Astro** — 无 React/Vue 运行时，内置中性演示内容与本地资源。
- **站内搜索** — 集成 [Pagefind](https://pagefind.app/)，索引文章、独立页面、友链与项目。
- **阅读体验** — 响应式布局、代码高亮、构建期 Mermaid 图与可折叠目录。
- **标签与 SEO** — 大小写不敏感的分页标签、OpenGraph、Sitemap、摘要 RSS 与 Web App Manifest。
- **主题模式与动效** — 无闪烁的跟随系统 / 浅色 / 深色模式，搭配克制且尊重「减少动态效果」的过渡。
- **双语界面** — 支持英文与中文界面（`en` / `zh`），支持为单篇文章声明文章语言。
- **可选评论** — 支持 [Twikoo](https://twikoo.js.org/)，默认关闭。

## 快速开始

环境要求：[Bun](https://bun.sh)（仅当文章包含 Mermaid 源代码块时，构建还需 Chromium 内核浏览器）。

```shell
npx degit Jazee6/astro-blur#main my-blog
cd my-blog
bun install
bun run dev
```

常用命令：

| 命令 | 说明 |
| --- | --- |
| `bun run dev` | 启动开发服务器 |
| `bun run new <path>` | 在 `src/content/posts/` 下新建文章 |
| `bun run build` | 类型检查、静态构建并生成 Pagefind 索引 |
| `bun run preview` | 本地预览构建产物 |

## 目录结构

```text
src/
├── content/
│   ├── posts/      # 文章（支持子目录与 .md / .mdx）
│   ├── pages/      # 独立页面
│   └── data/       # 友链与项目数据
└── config.ts       # 站点配置
```

## 使用指南

### 配置与评论

在 `src/config.ts` 中配置站点信息、导航、社交链接、分页大小、站点语言与评论：

- **站点语言**：通过 `language` 设置（默认 `en`，支持 `en` 与 `zh` / `zh-CN`，其余回退为英文；中文站点请改为 `zh`）。
- **评论**：默认关闭。将 `twikooUri` 设为你的 [Twikoo](https://twikoo.js.org/) 部署地址即可启用（通过 jsDelivr 加载固定版本 1.7.19，带 SRI 校验）。

### 新建与编写文章

`bun run new` 支持嵌套路径，并保留 `.md` / `.mdx` 扩展名：

```shell
bun run new hello-world         # src/content/posts/hello-world.md
bun run new notes/2026/hello    # src/content/posts/notes/2026/hello.md
bun run new notes/hello.mdx     # src/content/posts/notes/hello.mdx
```

如果单篇文章使用与站点语言不同的语言，可在 frontmatter 中声明文章语言：

```yaml
---
title: Hello
lang: en   # 可选，缺省为站点语言
---
```

> `lang` 仅标注文章自身内容，周边界面保持站点语言。若在非中日文站点中混有中日文文章，可在根目录创建 `pagefind.yml` 并添加 `force_language: zh`（或 `ja`）以支持句中分词搜索。

### 独立页面

`src/content/pages/` 下的 Markdown/MDX 文件直接映射为 URL，支持子目录（如 `pages/docs/guide.md` → `/docs/guide`）：

```yaml
---
title: About
description: 关于本站   # 可选，缺省使用 title
comments: true         # 可选，默认 false（需配置 twikooUri）
---
```

路径不可与保留路径冲突（`posts`、`tags`、`links`、`projects`、`rss.xml`、`robots.txt`、`404`、`pagefind`、站点地图及纯数字首页分页），冲突时会中断构建。

### Mermaid 图

文章中的 Mermaid 源代码块在构建期预渲染为亮/暗两套 SVG，无需客户端脚本。构建时依次查找本机 Edge、Chrome 与 Playwright Chromium（`bunx playwright install chromium`）；缺少浏览器或图表语法无效时构建会失败。

## 谁在使用 Astro Blur？

- [Hi! Jazee](https://vuiki.com)

欢迎提交 PR 添加你的站点。
