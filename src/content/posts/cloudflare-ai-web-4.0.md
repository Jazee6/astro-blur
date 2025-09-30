---
title: Cloudflare AI Web 4.0
description: Cloudflare AI Web 4.0正式推出
pubDate: 2025-9-30
---

![banner](https://blog-cdn.jaze.top/2025/09/71724a1cf8d68bb6701a938ff9cc38a9)

Cloudflare AI Web 4.0 正式发布。这是一次从底层到体验的「完全重构」：项目从 Nuxt 迁移到 Next.js 15，配合全新的 AI SDK
流式能力与本地优先的数据存储，让部署更简单、体验更顺滑、扩展更轻松。

- Demo：https://ai.jaze.top
- 源码：https://github.com/Jazee6/cloudflare-ai-web

## 特性

- 技术栈全面升级：Next.js 15 + React 19 + shadcn/ui + Biome。
- 聊天体验重做：流式输出、Reasoning 折叠可视化、模型一键切换、停止/重试控制。
- 本地优先：会话与消息使用 IndexedDB 存储，隐私友好、离线可读。
- 开箱即用的 Serverless API 与轻量鉴权（APP_PASSWORD）。
- Vercel 一键部署 & 官方 Docker 镜像。

## 核心功能与亮点

### 更强的流式聊天体验

- 基于 AI SDK（ai / @ai-sdk/react）实现流式消息与 UI 同步。
- 内置 Reasoning 流提取（extractReasoningMiddleware），推理片段以 <think> 标签传输，在前端以「Reasoning」折叠区展示（支持边流边看、加载指示）。
- 支持停止/重试控制、提交状态提示（Generating…）、智能滚动与回到底部浮标。
- 为控制上下文长度，仅发送最近 10 条消息参与推理。

### 现代化 UI/UX

- 采用 Shadcn UI 与 Tailwind v4，内置 Sidebar 布局、明暗主题（next-themes）。
- 动效增强：TextEffect、TextShimmer、ViewTransition（React 19 实验特性）。
- 用封装Remark的StreamDown库渲染消息，支持代码高亮、数学公式（KaTeX）、Mermaid 图表。

## Roadmap

- 图像生成工作台页面。
- 工具调用与多模态能力增强。
- Gemini AI Gateway支持。

（由GPT-5辅助生成）