import { afterEach, describe, expect, test } from "@jest/globals";
import {
    buildBlogPosting,
    buildBreadcrumbList,
    buildFaqPage,
    buildHowTo,
    buildOrganization,
    buildSoftwareApplication,
    compactJsonLd,
    serializeJsonLd,
} from "./json-ld";
import { absoluteAssetUrl, getSiteUrl, toSchemaLanguage } from "./site-url";

const originalSiteUrl = process.env.SITE_URL;

afterEach(() => {
    process.env.SITE_URL = originalSiteUrl;
});

describe("toSchemaLanguage", () => {
    test("maps zh-cn and zh-tw to BCP 47", () => {
        expect(toSchemaLanguage("zh-cn")).toBe("zh-CN");
        expect(toSchemaLanguage("zh-tw")).toBe("zh-TW");
        expect(toSchemaLanguage("en")).toBe("en");
        expect(toSchemaLanguage("ja")).toBe("ja");
    });
});

describe("getSiteUrl", () => {
    test("strips trailing slash", () => {
        process.env.SITE_URL = "https://mangasense.xyz/";
        expect(getSiteUrl()).toBe("https://mangasense.xyz");
    });

    test("falls back to production host", () => {
        delete process.env.SITE_URL;
        expect(getSiteUrl()).toBe("https://mangasense.xyz");
    });
});

describe("absoluteAssetUrl", () => {
    test("joins site origin with a path", () => {
        process.env.SITE_URL = "https://mangasense.xyz";
        expect(absoluteAssetUrl("/hero_image.webp")).toBe(
            "https://mangasense.xyz/hero_image.webp",
        );
    });

    test("keeps already-absolute URLs", () => {
        expect(absoluteAssetUrl("https://cdn.example.com/cover.jpg")).toBe(
            "https://cdn.example.com/cover.jpg",
        );
    });
});

describe("serializeJsonLd", () => {
    test("wraps a graph and escapes script breakers", () => {
        const html = serializeJsonLd([
            { "@type": "WebSite", name: "Manga Sense</script>" },
        ]);
        expect(html).toContain('"@context":"https://schema.org"');
        expect(html).toContain('"@graph"');
        expect(html).not.toContain("</script>");
        expect(html).toContain("\\u003c/script>");
    });
});

describe("schema builders", () => {
    test("organization points at a stable @id", () => {
        process.env.SITE_URL = "https://mangasense.xyz";
        const org = buildOrganization("Manga Sense");
        expect(org["@type"]).toBe("Organization");
        expect(org["@id"]).toBe("https://mangasense.xyz/#organization");
        expect(org.email).toBe("support@mangasense.xyz");
        expect(org.sameAs).toEqual(["https://discord.gg/qwX9Ygrrg"]);
    });

    test("web application uses a free offer without invented ratings", () => {
        const app = buildSoftwareApplication({
            name: "Manga Sense",
            description: "Translate manga online",
            url: "https://mangasense.xyz",
            inLanguage: ["en", "zh-CN"],
            featureList: ["Upload manga"],
        });
        expect(app["@type"]).toBe("WebApplication");
        expect(app.offers).toEqual({
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
        });
        expect(app).not.toHaveProperty("aggregateRating");
    });

    test("faq page maps visible Q&A", () => {
        const page = buildFaqPage({
            url: "https://mangasense.xyz",
            faqs: [
                { question: "Can you translate Japanese manga?", answer: "Yes." },
            ],
        });
        expect(page?.["@type"]).toBe("FAQPage");
        expect(page?.mainEntity).toEqual([
            {
                "@type": "Question",
                name: "Can you translate Japanese manga?",
                acceptedAnswer: { "@type": "Answer", text: "Yes." },
            },
        ]);
    });

    test("how-to numbers steps", () => {
        const howTo = buildHowTo({
            name: "How it works",
            url: "https://mangasense.xyz",
            steps: [
                { name: "Upload", text: "Drop files" },
                { name: "Translate", text: "Pick a language" },
            ],
        });
        expect(howTo?.["@type"]).toBe("HowTo");
        const steps = howTo?.step as Array<{ position: number; name: string; }>;
        expect(steps.map((step) => step.position)).toEqual([1, 2]);
        expect(steps[0]?.name).toBe("Upload");
    });

    test("blog posting falls back to the organization as author", () => {
        process.env.SITE_URL = "https://mangasense.xyz";
        const post = buildBlogPosting({
            headline: "Tips",
            url: "https://mangasense.xyz/blogs/tips",
            locale: "zh-cn",
        });
        expect(post["@type"]).toBe("BlogPosting");
        expect(post.inLanguage).toBe("zh-CN");
        expect(post.author).toEqual({ "@id": "https://mangasense.xyz/#organization" });
        expect(post).not.toHaveProperty("image");
        expect(post).not.toHaveProperty("datePublished");
    });

    test("blog posting uses a person author when present", () => {
        const post = buildBlogPosting({
            headline: "Tips",
            url: "https://mangasense.xyz/blogs/tips",
            locale: "en",
            author: "Ada",
            image: "https://cdn.example.com/cover.jpg",
            datePublished: "2026-01-01T00:00:00.000Z",
        });
        expect(post.author).toEqual({ "@type": "Person", name: "Ada" });
        expect(post.image).toBe("https://cdn.example.com/cover.jpg");
        expect(post.datePublished).toBe("2026-01-01T00:00:00.000Z");
    });

    test("compactJsonLd drops empty nodes", () => {
        expect(compactJsonLd([buildFaqPage({ url: "/", faqs: [] }), { "@type": "WebPage" }])).toEqual([
            { "@type": "WebPage" },
        ]);
        expect(buildBreadcrumbList([])).toBeNull();
    });
});
