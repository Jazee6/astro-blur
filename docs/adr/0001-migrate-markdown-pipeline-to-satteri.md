# Markdown 渲染管线迁移到 Sätteri

升级 Astro v7 时，项目原有的两个自写 remark/rehype 插件（git 提交时间注入 lastModified、图片 lazy/zoomable 标记）面临两个选择：留在文档支持的 `unified()` 旧管线，或移植为 Sätteri 的 MDAST/HAST 插件。我们选择移植到 Sätteri（Astro v7 的默认管线），拥抱新架构并去掉 `@astrojs/markdown-remark` 依赖；代价是插件绑定 Sätteri 插件 API，无法直接复用 remark/rehype 生态的现成插件。

## Considered Options

- **移植到 Sätteri（已选）**：官方 modified-time / external-links recipe 提供了直接对应的移植路径，自写插件仅约 40 行，回归面可控。
- **留在 `unified()` 旧管线**：零改动，但始终背着一个文档明确标记为"保留逃生舱"的旧处理器，未来仍需迁移。

## Consequences

- `lastModified` 语义保持不变：取自 `git log -1 --pretty=%cI`，而非官方 recipe 使用的文件系统 mtime（clone/checkout 会把所有文件的 mtime 重置为同一时刻）。
- 今后引入 Markdown 处理能力时，优先寻找 Sätteri 插件生态，而非 remark/rehype 插件。
