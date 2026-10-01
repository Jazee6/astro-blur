import {execFileSync} from "node:child_process";
import {fileURLToPath} from "node:url";
import {defineMdastPlugin} from "satteri";

const cache = new Map<string, string>();

/**
 * Sets `lastModified` in the Astro frontmatter to the time of the last
 * commit that touched the file (git log -1 --pretty=%cI).
 * Falls back to "now" for uncommitted files or when git is unavailable.
 */
export const mdastModifiedTime = defineMdastPlugin({
    name: "mdast-modified-time",
    before(_root, context) {
        if (!context.fileURL || !context.data.astro) return;
        const filepath = fileURLToPath(context.fileURL);
        if (cache.has(filepath)) {
            context.data.astro.frontmatter.lastModified = cache.get(filepath)!;
            return;
        }
        let value = new Date().toISOString();
        try {
            const result = execFileSync("git", ["log", "-1", "--pretty=format:%cI", "--", filepath]);
            const dateStr = result.toString().trim();
            if (dateStr) value = dateStr;
        } catch {
            // keep fallback value
        }
        cache.set(filepath, value);
        context.data.astro.frontmatter.lastModified = value;
    },
});
