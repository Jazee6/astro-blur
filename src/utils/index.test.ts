import {describe, expect, test} from "bun:test";
import {serializeJsonLd} from "./index";

describe("serializeJsonLd", () => {
    test("转义 < 防止提前闭合 script 标签，且仍是合法 JSON", () => {
        const data = {headline: "</script><script>alert(1)</script>"};
        const json = serializeJsonLd(data);
        expect(json).not.toContain("<");
        expect(JSON.parse(json)).toEqual(data);
    });
});
