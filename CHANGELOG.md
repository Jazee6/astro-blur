# Changelog

本项目的所有显著变更都记录在此文件中。

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
