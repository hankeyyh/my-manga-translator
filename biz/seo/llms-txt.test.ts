import { afterEach, describe, expect, test } from "@jest/globals";
import { buildLlmsTxt } from "./llms-txt";
import { jest } from "@jest/globals";

jest.mock("@/i18n/routing", () => ({
    routing: {
        locales: ["en", "zh-cn", "ja"],
        defaultLocale: "en",
    },
}));

const originalSiteUrl = process.env.SITE_URL;

afterEach(() => {
    process.env.SITE_URL = originalSiteUrl;
});

describe("buildLlmsTxt", () => {
    test("follows llmstxt.org: H1, blockquote, then H2 file lists", () => {
        process.env.SITE_URL = "https://mangasense.xyz";
        const text = buildLlmsTxt();

        expect(text.startsWith("# MangaSense\n")).toBe(true);
        expect(text).toContain("\n> MangaSense is an online AI manga translator.");
        expect(text).toContain("## Pages");
        expect(text).toContain("## Legal");
        expect(text).not.toContain("## Optional");
        expect(text).not.toContain("## Blog posts");
        expect(text).not.toContain("/blogs");
    });

    test("points agents at public English URLs and contact", () => {
        process.env.SITE_URL = "https://mangasense.xyz";
        const text = buildLlmsTxt();

        expect(text).toContain("- [Home](https://mangasense.xyz): Product overview and the online translator");
        expect(text).toContain("- [Translator](https://mangasense.xyz/#tool):");
        expect(text).toContain("- [Pricing](https://mangasense.xyz/pricing):");
        expect(text).toContain("- [FAQ](https://mangasense.xyz/faq):");
        expect(text).toContain("- [Privacy Policy](https://mangasense.xyz/legal/privacy)");
        expect(text).toContain("support@mangasense.xyz");
        expect(text).toContain("https://discord.gg/qwX9Ygrrg");
        expect(text).toContain("/zh-cn, /ja");
    });

    test("honors SITE_URL for public links", () => {
        process.env.SITE_URL = "https://preview.example";
        const text = buildLlmsTxt();

        expect(text).toContain("- [Home](https://preview.example): Product overview and the online translator");
        expect(text).toContain("- [Privacy Policy](https://preview.example/legal/privacy)");
    });
});
