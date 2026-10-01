# Astro Blur

一个静态 Astro 博客主题：文章、页面、友链、项目与站内搜索开箱即用，评论可选。

中文 | [English](./README.en.md)

![Theme Preview](https://blog-cdn.jaze.top/2024/07/6e7813e44dad9a35be6c42b2c2e4eb53.webp)

## 特性

- ✅ 纯 Astro 组件实现，无 React/Vue 运行时，纯静态生成
- ✅ 站内搜索（Pagefind）：索引文章、独立页面、友链与项目，不索引首页、分页与标签聚合页
- ✅ 标签：大小写不敏感的聚合身份，展示首次出现的拼写，URL 使用规范化标识，附文章列表分页
- ✅ 可选 Twikoo 评论（默认关闭）
- ✅ SEO 友好 — OpenGraph / Sitemap / RSS（仅输出摘要与原文链接）/ Web App Manifest
- ✅ 响应式布局 / 代码高亮 / Mermaid 图表 / 文章目录（小屏折叠显示）
- ✅ 主题模式：跟随系统 / 浅色 / 深色（无闪烁，跟随系统时实时响应系统配色）
- ✅ 克制的过渡动效：页面切换与主题切换整页淡化、弹出层开合过渡（渐进增强，尊重「减少动态效果」设置）
- ✅ 中性演示内容与本地资源，开箱即可替换成你自己的站点

## 环境要求

- [Bun](https://bun.sh)（包管理与脚本运行）
- Chromium 内核浏览器（仅当文章包含 Mermaid 图表时构建需要，见下方说明）

## 快速开始

```shell
# 下载模板
npx degit Jazee6/astro-blur#main my-blog

# 进入项目
cd my-blog

# 安装依赖
bun install

# 启动项目
bun run dev

# 新建文章（见下方说明）
bun run new hello-world

# 构建（包含类型检查）并本地预览
bun run build
bun run preview
```

## 新建文章

`bun run new` 接受 posts 目录下安全的相对嵌套路径：

```shell
bun run new hello-world            # 创建 src/content/posts/hello-world.md
bun run new notes/2026/hello       # 自动创建目录，创建 src/content/posts/notes/2026/hello.md
bun run new notes/hello.mdx        # 保留 .md / .mdx 扩展名
```

## 配置

站点信息、导航、社交链接与分页大小集中在 `src/config.ts`：

## 独立页面

`src/content/pages/` 下的每个 Markdown/MDX 文件生成一个独立页面，路径即 URL，支持子目录
（如 `pages/docs/guide.md` → `/docs/guide`）：

```yaml
---
title: About
description: 关于本站   # 可选，缺省使用 title
comments: true         # 可选，默认 false；需同时配置 twikooUri
---
```

页面路径不能与主题保留路径重叠（`posts`、`tags`、`links`、`projects`、`rss.xml`、`robots.txt`、
`404`、`pagefind`、站点地图以及纯数字的首页分页路径），重叠时构建失败并指出对应文件。

## 评论（可选）

默认不启用评论。在 `src/config.ts` 中设置 `twikooUri` 为你的 [Twikoo](https://twikoo.js.org/)
部署地址即可启用：脚本从 jsDelivr 以固定版本 1.7.19 加载（带 SRI 校验）

## Mermaid 图表

文章中的 Mermaid 源代码块会在构建期渲染为亮色与暗色两份 SVG，随站点主题即时切换，
无需客户端脚本。渲染需要一个 Chromium 内核浏览器，构建时依次尝试本机的 Microsoft Edge、Google Chrome
与 Playwright 自带的 Chromium（可通过 `bunx playwright install chromium` 安装）；都不可用时构建失败并给出提示。
无效的图表同样会阻止构建。

## 目录结构

```
src/
├── content/
│   ├── posts/      # 文章（支持子目录与 .md / .mdx）
│   ├── pages/      # 独立页面
│   └── data/       # 友链与项目数据
└── config.ts       # 站点配置
```

## 谁在使用 Astro Blur?

- [Hi! Jazee](https://jaze.top)

欢迎提交 PR 添加你的站点
