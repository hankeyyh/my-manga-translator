import { afterEach, describe, expect, test } from "@jest/globals";
import { buildOpenGraph, buildPageMetadata, languageAlternateUrls, pageAlternates } from "./site";
import { jest } from "@jest/globals";

jest.mock("@/i18n/navigation", () => ({
    getPathname: ({ locale, href }: { locale: string; href: string; }) => {
        const path = href === "/" ? "" : href;
        return locale === "en" ? path : `/${locale}${path}`;
    },
}));

jest.mock("@/i18n/routing", () => ({
    routing: {
        locales: ["en", "zh-cn", "zh-tw", "ja"],
        defaultLocale: "en",
    },
}));

const originalSiteUrl = process.env.SITE_URL;

afterEach(() => {
    process.env.SITE_URL = originalSiteUrl;
});

describe("pageAlternates", () => {
    test("english home is self-canonical without a locale prefix", () => {
        process.env.SITE_URL = "https://mangasense.xyz";
        const alternates = pageAlternates("en", "/");

        expect(alternates.canonical).toBe("https://mangasense.xyz");
        expect(alternates.languages["x-default"]).toBe("https://mangasense.xyz");
        expect(alternates.languages.en).toBe("https://mangasense.xyz");
        expect(alternates.languages["zh-CN"]).toBe("https://mangasense.xyz/zh-cn");
        expect(alternates.languages["zh-TW"]).toBe("https://mangasense.xyz/zh-tw");
    });

    test("localized blog post canonicalizes to itself and lists siblings", () => {
        process.env.SITE_URL = "https://mangasense.xyz";
        const alternates = pageAlternates("zh-cn", "/blogs/ocr-tips");

        expect(alternates.canonical).toBe("https://mangasense.xyz/zh-cn/blogs/ocr-tips");
        expect(alternates.languages["x-default"]).toBe("https://mangasense.xyz/blogs/ocr-tips");
        expect(alternates.languages.en).toBe("https://mangasense.xyz/blogs/ocr-tips");
        expect(alternates.languages["zh-CN"]).toBe("https://mangasense.xyz/zh-cn/blogs/ocr-tips");
        expect(alternates.languages.ja).toBe("https://mangasense.xyz/ja/blogs/ocr-tips");
    });
});

describe("languageAlternateUrls", () => {
    test("uses BCP 47 keys and as-needed paths", () => {
        process.env.SITE_URL = "https://mangasense.xyz";
        const languages = languageAlternateUrls("/legal/privacy");

        expect(languages["x-default"]).toBe("https://mangasense.xyz/legal/privacy");
        expect(languages["zh-CN"]).toBe("https://mangasense.xyz/zh-cn/legal/privacy");
        expect(languages).not.toHaveProperty("zh-cn");
    });
});

describe("buildOpenGraph", () => {
    test("emits absolute og fields for the English home", () => {
        process.env.SITE_URL = "https://mangasense.xyz";
        const og = buildOpenGraph({
            locale: "en",
            href: "/",
            title: "AI Manga Translator | MangaSense",
            description: "Translate manga online",
        });

        expect(og).toEqual({
            type: "website",
            locale: "en_US",
            url: "https://mangasense.xyz",
            siteName: "MangaSense",
            title: "AI Manga Translator | MangaSense",
            description: "Translate manga online",
            images: [
                {
                    url: "https://mangasense.xyz/hero_img_og.webp",
                    alt: "AI Manga Translator | MangaSense",
                },
            ],
        });
    });

    test("uses article type, localized url, and a custom image", () => {
        process.env.SITE_URL = "https://mangasense.xyz";
        const og = buildOpenGraph({
            locale: "zh-cn",
            href: "/blogs/ocr-tips",
            title: "OCR tips | MangaSense",
            description: "How manga OCR works",
            type: "article",
            imageUrl: "https://cdn.example.com/cover.jpg",
        });

        expect(og.type).toBe("article");
        expect(og.locale).toBe("zh_CN");
        expect(og.url).toBe("https://mangasense.xyz/zh-cn/blogs/ocr-tips");
        expect(og.images[0]?.url).toBe("https://cdn.example.com/cover.jpg");
    });
});

describe("buildPageMetadata", () => {
    test("attaches openGraph next to canonical alternates", () => {
        process.env.SITE_URL = "https://mangasense.xyz";
        const metadata = buildPageMetadata({
            locale: "en",
            href: "/",
            title: "Home",
            description: "Desc",
        });

        expect(metadata.alternates.canonical).toBe("https://mangasense.xyz");
        expect(metadata.openGraph.url).toBe("https://mangasense.xyz");
        expect(metadata.openGraph.title).toBe("Home");
    });
});
