import fs from "node:fs";
import path from "node:path";

export const POSTS_DIR = "src/content/posts";

const SUPPORTED_EXTENSIONS = [".md", ".mdx"];

export class PostPathError extends Error {
}

/**
 * 解析并校验文章路径：
 * - 允许 posts 目录下的安全相对嵌套路径；
 * - 没有扩展名时补 `.md`，有扩展名时只接受 md/mdx；
 * - 拒绝绝对路径、空路径段、`.`/`..` 跳转以及任何逃逸出 posts 根目录的结果。
 */
export function resolvePostPath(input: string, root: string = POSTS_DIR): string {
    if (typeof input !== "string" || input.trim().length === 0) {
        throw new PostPathError("文章路径不能为空");
    }
    if (path.isAbsolute(input)) {
        throw new PostPathError(`文章路径必须是相对路径：${input}`);
    }

    const segments = input.split(/[\\/]/);
    for (const segment of segments) {
        if (segment === "") {
            throw new PostPathError(`文章路径包含空路径段：${input}`);
        }
        if (segment === "." || segment === "..") {
            throw new PostPathError(`文章路径不允许使用 “.” 或 “..” 跳转：${input}`);
        }
    }

    const fileName = segments[segments.length - 1];
    const extension = path.extname(fileName).toLowerCase();
    if (extension && !SUPPORTED_EXTENSIONS.includes(extension)) {
        throw new PostPathError(`不支持的文章扩展名 “${extension}”，仅支持 ${SUPPORTED_EXTENSIONS.join("/")}`);
    }
    // 归一化为小写扩展名：内容加载器的 glob 模式 **/*.{md,mdx} 区分大小写，
    // 保留大写扩展名（如 hello.MD）创建的文件会被静默忽略
    segments[segments.length - 1] = extension
        ? fileName.replace(/\.[^.]+$/, extension)
        : `${fileName}.md`;

    const rootPath = path.resolve(root);
    const fullPath = path.resolve(rootPath, segments.join("/"));
    if (fullPath !== rootPath && !fullPath.startsWith(rootPath + path.sep)) {
        throw new PostPathError(`文章路径越过了 posts 根目录：${input}`);
    }
    return fullPath;
}

function getDateString(): string {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
}

/**
 * 创建文章（含父目录）；目标已存在时抛出 PostPathError，绝不覆盖。
 */
export function createPost(input: string, root: string = POSTS_DIR): string {
    const fullPath = resolvePostPath(input, root);
    if (fs.existsSync(fullPath)) {
        throw new PostPathError(`文章已存在：${fullPath}`);
    }
    const title = path.basename(fullPath).replace(/\.(md|mdx)$/i, "");
    const yamlTitle = JSON.stringify(title)
    const content = `---
title: ${yamlTitle}
description: ${yamlTitle}
pubDate: ${getDateString()}
tags: []
---
`
    fs.mkdirSync(path.dirname(fullPath), {recursive: true});
    fs.writeFileSync(fullPath, content);
    return fullPath;
}

/**
 * CLI 入口。仅由 scripts/new-post.js 显式调用，导入本模块不产生副作用。
 */
export function runCli(argv: string[] = process.argv.slice(2)): void {
    if (argv.length === 0) {
        console.error(`Error: No filename argument provided
Usage: bun run new <filename>
  bun run new hello-world
  bun run new notes/2026/hello    # 安全的相对嵌套路径，自动创建目录，缺省扩展名补 .md`)
        process.exit(1);
    }

    try {
        const created = createPost(argv[0]);
        console.log(`Post ${created} created`);
    } catch (error) {
        if (error instanceof PostPathError) {
            console.error(`Error: ${error.message}`)
            process.exit(1);
        }
        throw error;
    }
}
