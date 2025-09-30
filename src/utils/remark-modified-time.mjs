import {statSync} from "fs";

export function remarkModifiedTime() {
    return function (_, file) {
        const filepath = file.history[0];
        const result = statSync(filepath);
        file.data.astro.frontmatter.lastModified = result.mtime.toISOString();
    };
}
