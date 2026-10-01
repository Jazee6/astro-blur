# Changelog

本项目的所有显著变更都记录在此文件中。

## [2.0.0] - 2026-10-01

全面检查与优化：修复不合法的 HTML 与交互缺陷，精简重复代码，独立页面支持嵌套，主题模式支持跟随系统。

### 迁移指南

- `src/config.ts`：`page_size` 改名为 `pageSize`，`twikoo_uri` 改名为 `twikooUri`。
- 独立页面路由由 `[slug]` 改为 `[...slug]`：若有页面与主题保留路径重叠（如 `links.md`、纯数字的 `2.md`），构建会失败并指出文件，需要重命名。
- 旧版本在首次访问时就会写入 `light` / `dark`，因此老读者会保留当时的配色，点击主题按钮切到「跟随系统」即可；新读者默认跟随系统。
- 移除了 `tailwindcss-animate`：如在自定义代码中用到 `animate-in` / `fade-in` 等类，请改用 `animate-fade-in` 或自行定义动画。

### Added

- 主题模式支持「跟随系统 / 浅色 / 深色」三态，单按钮循环切换；跟随系统时实时响应系统配色变化，只有手动切换后才持久化。
- 小屏（<md）文章在标题下方显示默认收起的目录。
- 独立页面支持子目录嵌套；frontmatter 新增可选 `description`（缺省使用标题）与 `comments`（默认 false）。
- 独立页面路径与保留路径（文章、标签、友链、项目、订阅源、站点地图、首页分页等）重叠时构建失败，不再静默丢弃。
- Mermaid 渲染依次尝试 Edge、Chrome 与 Playwright 自带的 Chromium，不再强制要求 Edge。

### Changed

- 上一篇/下一篇改为沿文章时间线导航：「上一篇」为更早发布的文章，置顶不再影响导航顺序。
- 配置键统一为驼峰命名：`pageSize`、`twikooUri`。
- 草稿过滤与排序收敛到 `getPublishedPosts()`；图片缩放脚本收敛为 `ImageZoom` 组件；布局组件直接透传 BaseLayout 属性。
- lastModified 插件改为每篇文档只执行一次。
- 以 Tailwind 主题动画 `animate-fade-in` 替代 `tailwindcss-animate` 插件。
- 间距统一使用 flex/grid `gap`，不再使用 `space-x/y-*`。

### Fixed

- 移动端菜单的导航链接不再嵌套在 `<button>` 内；TOC 列表不再把 `<div>` 作为 `<ul>` 的直接子元素；主题初始化脚本移入 `<head>`。
- 在评论框等文本域或可编辑区域输入 `/` 不再误打开搜索；快捷键打开搜索时不再把 `/` 输入到搜索框。
- 手动选择的主题与浏览器 `theme-color` 保持一致。
- JSON-LD 转义 `<`，标题中的 `</script>` 不会提前结束脚本。
- 分页当前页标注 `aria-current`，社交图标链接补充可访问名称。
- 标签拒绝 `.` 与 `..`，避免生成越级的标签路径。
- 桌面目录滚动渐变与卡片背景色一致。

### Removed

- 移除未使用的 `menu-item` 样式工具类与 `tailwindcss-animate` 依赖。

## [1.0.0] - 2026-09-06

首个正式发布：主题定位为公开、可复用的 Astro 博客模板，演示内容与资源全部中性化。

### Added

- 为新建文章路径规则（嵌套目录、扩展名补全、越界拒绝、不覆盖）与标签规范化（大小写不敏感身份、首次拼写、计数与排序）新增 Bun 测试回归覆盖；`bun run new` 重构为可导入的纯函数模块，导入不再产生 CLI 副作用。
- 文档头新增 Web App Manifest 链接，manifest 作为中性产品资产指向本地 `public/identity.svg`。
- 头部搜索/主题按钮与搜索输入补充可访问标签，关键脚本增加空值守卫。

### Changed

- 升级依赖组合：astro 7.3.1、@astrojs/markdown-satteri 0.4.0、@astrojs/mdx 8.0.0、@astrojs/sitemap 3.7.4、@iconify-json/material-symbols 1.2.90、Tailwind CSS 4.3.3（vite 插件与 typography 0.5.20）、astro-icon 1.2.0；统一使用 caret 语义化版本范围，以 bun.lock 作为可复现锁定；pagefind 与 Tailwind 插件归入 dependencies，仅用于校验的 @astrojs/check 与 TypeScript 归入 devDependencies；移除直接的 mermaid 依赖（仅 mermaid-isomorphic 需要，保留其必需的 playwright peer）。
- 演示身份中性化：站点配置、manifest、友链、项目与示例内容不再包含个人身份信息，头像/图标/PWA 图标统一为本地字母渐变 SVG（`public/identity.svg`），示例文章图片改为本地资源；保留指向实际上游仓库的链接。
- RSS 条目仅输出发布元数据、description 摘要与原文链接，不再包含原始 Markdown 全文，MD 与 MDX 一致处理；条目顺序与站点其他列表一致（置顶优先，再按日期降序）。
- Twikoo 评论改为可选：默认不启用；启用时从 jsDelivr 以固定版本 1.7.19（带 SRI 与 crossorigin）加载官方 UMD 构建，加载或初始化失败时以「评论暂不可用」替代永久骨架并记录实际错误。
- 标签改为大小写不敏感身份：展示保留首次出现时的拼写，URL 使用规范化标识，避免 Markdown/markdown 这类重复。
- `bun run new` 支持安全的相对嵌套路径（自动创建目录、必要时补 .md、扩展名归一化为小写以匹配内容加载器、拒绝绝对路径/空段/点段跳转/越界/不支持的扩展名、绝不覆盖），用法提示更新为 Bun。
- 搜索结果改用 DOM API 构建，URL 与标题不再拼接进 HTML 字符串，保留 Pagefind 生成的高亮摘要。
- 重写中英文 README：准确描述搜索范围（文章/页面/友链/项目）、标签规则、分页与 manifest，以「纯 Astro 组件、无 React/Vue 运行时」替代误导性的「100% 原生」，并记录 Bun 命令、安全嵌套新建文章用法、配置、可选 Twikoo、Edge 要求与中性默认值。

### Fixed

- Header 不再依赖 BaseLayout 内联脚本的全局词法 `theme` 变量，主题状态经由 documentElement class/localStorage 显式传递，保留首帧无闪烁初始化，存储不可用时回退系统偏好。
- 友链页保留 links.json 声明顺序，移除构建期随机打乱。
- 合并重复的 `astro:content` 导入，移除文章标题 h1 上的无效 id。

### Removed

- 移除未实现的 `twikoo_visitors` 访问量徽章。
- 移除 About 页默认 CC BY-NC 内容许可声明。
- 移除 `getDesc` 恒等函数及调用点。
- 删除内部工作流文档 `AGENTS.md` 与 `docs/agents/**`（保留 `CONTEXT.md` 与 `docs/adr/**`）。

## [0.9.2] - 2026-09-06

### Added

- Markdown/MDX 新增 Mermaid 图支持：构建期生成亮色与暗色 SVG，随站点主题即时切换，无效图表会阻止构建。
- 示例文章新增带可访问标题和描述的 Mermaid 流程图。
- 使用 Bun 测试覆盖 Mermaid 双主题渲染、错误处理、唯一 ID 与可访问元数据。

### Changed

- 中英文 README 的快速开始命令统一改用 Bun，并注明 Mermaid 构建所需的 Microsoft Edge。

## [0.9.1] - 2026-08-22

### Changed

- 目录（TOC）从超宽屏右侧叠加层改为左侧栏样式：文章页复用 `MainLayout` 的左侧 aside 渲染目录卡片，替代原有的个人资料卡片，覆盖 ≥md 所有断点；保留激活区间指示条、区间自动滚动与上下渐变提示。
- 页面顶部间距由 `mt-20` 调整为 `mt-18`。

### Fixed

- 亮色主题下代码块背景色与白色卡片混同，现改用 `back` 底色区分。
- 文章内容列增加 `min-w-0`，修复目录移入侧栏后文章区域溢出问题。

### Removed

- 移除窄屏吸顶条「当前标题」语义（详见 `CONTEXT.md`）。

## [0.9.0] - 2026-08-21

### Added

- 新增 `Toc.astro` 目录组件：超宽屏（≥1824px）在文章右侧渲染 sticky 目录，带激活区间指示条、区间自动滚动与上下渐变提示（详见 `CONTEXT.md` 中的「激活区间」定义）。
- 移动端头部菜单改为点击式下拉，支持 `aria-expanded`、点击外部关闭与 Esc 关闭。

### Changed

- Markdown 渲染管线迁移到 Sätteri（Astro v7 默认管线）：`remarkModifiedTime` 与 `RehypeImage` 移植为 `mdast-modified-time.ts` / `hast-image.ts`，`lastModified` 语义不变（取自最后一次触及文件的 git 提交时间）。见 ADR-0001。
- 升级依赖：astro 6.4.4 → 7.2.4、@astrojs/mdx 6.0.2 → 7.0.7 等；移除 `@astrojs/markdown-remark` 与 `@astrojs/tailwind`。

### Fixed

- 带 hash 到达文章页时，图片加载导致布局变化后定位漂移，现在 `load` 后重新对齐一次。
- 头部移动端菜单由 hover 触发改为点击触发，修复触屏设备难以唤起的问题。
