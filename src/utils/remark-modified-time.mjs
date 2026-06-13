import {execFileSync} from "child_process";

const cache = new Map();

export function remarkModifiedTime() {
    return function (_, file) {
        const filepath = file.history[0];
        if (cache.has(filepath)) {
            file.data.astro.frontmatter.lastModified = cache.get(filepath);
            return;
        }
        try {
            const result = execFileSync("git", ["log", "-1", "--pretty=format:%cI", "--", filepath]);
            const dateStr = result.toString().trim();
            const value = dateStr || new Date().toISOString();
            cache.set(filepath, value);
            file.data.astro.frontmatter.lastModified = value;
        } catch {
            const fallback = new Date().toISOString();
            cache.set(filepath, fallback);
            file.data.astro.frontmatter.lastModified = fallback;
        }
    };
}
