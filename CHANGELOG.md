# Changelog

本项目的所有显著变更都记录在此文件中。

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
