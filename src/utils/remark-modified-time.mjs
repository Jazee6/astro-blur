import {execSync} from "child_process";

export function remarkModifiedTime() {
    return function (_, file) {
        const filepath = file.history[0];
        try {
            const result = execSync(`git log -1 --pretty="format:%cI" -- "${filepath}"`);
            const dateStr = result.toString().trim();
            file.data.astro.frontmatter.lastModified = dateStr || new Date().toISOString();
        } catch {
            file.data.astro.frontmatter.lastModified = new Date().toISOString();
        }
    };
}
