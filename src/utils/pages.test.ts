import {describe, expect, test} from "bun:test";
import {getReservedPathConflict} from "./pages";

describe("getReservedPathConflict", () => {
    test("普通与嵌套页面路径不冲突", () => {
        expect(getReservedPathConflict("about")).toBeNull();
        expect(getReservedPathConflict("docs/guide")).toBeNull();
        expect(getReservedPathConflict("2026-plan")).toBeNull();
    });

    test("与主题保留路径冲突（含嵌套与大小写）", () => {
        expect(getReservedPathConflict("links")).not.toBeNull();
        expect(getReservedPathConflict("tags/custom")).not.toBeNull();
        expect(getReservedPathConflict("Posts")).not.toBeNull();
        expect(getReservedPathConflict("rss.xml")).not.toBeNull();
    });

    test("纯数字首段与首页分页冲突", () => {
        expect(getReservedPathConflict("2")).not.toBeNull();
        expect(getReservedPathConflict("10/notes")).not.toBeNull();
    });

    test("与站点地图冲突", () => {
        expect(getReservedPathConflict("sitemap-index.xml")).not.toBeNull();
        expect(getReservedPathConflict("sitemap-0.xml")).not.toBeNull();
        expect(getReservedPathConflict("sitemap-guide")).toBeNull();
    });
});
