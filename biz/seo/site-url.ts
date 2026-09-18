export const BRAND_NAME = "MangaSense";
export const BRAND_EMAIL = "support@mangasense.xyz";
export const DISCORD_URL = "https://discord.gg/qwX9Ygrrg";
export const HERO_IMAGE_PATH = "/hero_image.webp";
export const OG_IMAGE_PATH = "/hero_img_og.webp";

const DEFAULT_SITE_URL = "https://mangasense.xyz";

export function getSiteUrl(): string {
    return (process.env.SITE_URL ?? DEFAULT_SITE_URL).replace(/\/$/, "");
}

export function organizationId(): string {
    return `${getSiteUrl()}/#organization`;
}

export function websiteId(): string {
    return `${getSiteUrl()}/#website`;
}

export function softwareId(): string {
    return `${getSiteUrl()}/#software`;
}

/** Schema.org / BCP 47 language tags for this app's locale codes. */
export function toSchemaLanguage(locale: string): string {
    if (locale === "zh-cn") return "zh-CN";
    if (locale === "zh-tw") return "zh-TW";
    return locale;
}

/** Open Graph `og:locale` tags (language_TERRITORY). */
export function toOpenGraphLocale(locale: string): string {
    if (locale === "en") return "en_US";
    if (locale === "zh-cn") return "zh_CN";
    if (locale === "zh-tw") return "zh_TW";
    return locale.replace(/-/g, "_");
}

export function absoluteAssetUrl(path: string): string {
    if (/^https?:\/\//i.test(path)) return path;
    const normalized = path.startsWith("/") ? path : `/${path}`;
    return `${getSiteUrl()}${normalized}`;
}
