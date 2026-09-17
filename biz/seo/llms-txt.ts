import { LEGAL_SLUGS } from "@/types/do/legal-doc";
import { routing } from "@/i18n/routing";
import { BRAND_EMAIL, DISCORD_URL, getSiteUrl } from "./site-url";

const LEGAL_TITLES: Record<(typeof LEGAL_SLUGS)[number], string> = {
    about: "About",
    privacy: "Privacy Policy",
    terms: "Terms of Use",
    refund: "Refund Policy",
    dmca: "DMCA",
};

function siteUrl(path = "/"): string {
    const origin = getSiteUrl();
    if (path === "/") return origin;
    return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

function listItem(title: string, url: string, note?: string | null): string {
    const trimmed = note?.trim();
    return trimmed ? `- [${title}](${url}): ${trimmed}` : `- [${title}](${url})`;
}

/**
 * llmstxt.org v2: H1, optional blockquote, prose, then H2 file lists.
 */
export function buildLlmsTxt(): string {
    const localeList = routing.locales
        .filter((locale) => locale !== routing.defaultLocale)
        .map((locale) => `/${locale}`)
        .join(", ");

    return [
        "# Manga Sense",
        "",
        "> Manga Sense is an online AI manga translator. Upload manga or manhwa pages; it detects speech-bubble text, translates it, and redraws the result onto the original artwork while preserving layout and font style.",
        "",
        "Manga Sense is a web app, not a publisher, and is not affiliated with any manga publisher. Typical source languages are Japanese, Korean, and Chinese. Output covers 20+ languages. Uploads accept JPG, PNG, WebP, GIF, AVIF, HEIC, PDF, EPUB, CBZ, and ZIP (images up to 50MB, documents up to 200MB).",
        "",
        `Translation is credit-based: Fast mode costs 1 credit per page, Quality mode costs 3. Pay-per-use credits never expire; subscription credits refresh each billing cycle. Uploaded content is used only to run the translation. The default English site has no locale prefix; other UI languages live under a prefix (for example ${localeList}). Contact: ${BRAND_EMAIL}. Community: ${DISCORD_URL}.`,
        "",
        "## Pages",
        "",
        listItem("Home", siteUrl("/"), "Product overview and the online translator"),
        listItem("Translator", siteUrl("/#tool"), "Upload pages, choose a target language, and run a translation"),
        listItem("How it works", siteUrl("/#how"), "Upload, choose a language, preview and download"),
        listItem("Pricing", siteUrl("/#pricing"), "Pay per use and monthly or yearly subscriptions"),
        listItem("FAQ", siteUrl("/#faq"), "Languages, formats, credits, privacy, and refunds"),
        "",
        "## Legal",
        "",
        ...LEGAL_SLUGS.map((slug) => listItem(LEGAL_TITLES[slug], siteUrl(`/legal/${slug}`))),
        "",
    ].join("\n");
}
