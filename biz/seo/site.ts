import { getPathname } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import {
    BRAND_NAME,
    HERO_IMAGE_PATH,
    absoluteAssetUrl,
    getSiteUrl,
    toOpenGraphLocale,
    toSchemaLanguage,
} from "./site-url";

export type AppHref = Parameters<typeof getPathname>[0]["href"];

export type PageAlternates = {
    canonical: string;
    languages: Record<string, string>;
};

export function asAppLocale(locale: string): AppLocale {
    return routing.locales.includes(locale as AppLocale) ? locale as AppLocale : routing.defaultLocale;
}

export function schemaLanguages(): string[] {
    return routing.locales.map(toSchemaLanguage);
}

export function absoluteUrl(locale: AppLocale, href: AppHref): string {
    return `${getSiteUrl()}${getPathname({ locale, href })}`;
}

/** hreflang map for this path: each locale plus x-default (English, no prefix). */
export function languageAlternateUrls(href: AppHref): Record<string, string> {
    const languages: Record<string, string> = {
        "x-default": absoluteUrl(routing.defaultLocale, href),
    };
    for (const locale of routing.locales) {
        languages[toSchemaLanguage(locale)] = absoluteUrl(locale, href);
    }
    return languages;
}

/** Self-referencing canonical for the current locale, plus language alternates. */
export function pageAlternates(locale: string, href: AppHref): PageAlternates {
    const appLocale = asAppLocale(locale);
    return {
        canonical: absoluteUrl(appLocale, href),
        languages: languageAlternateUrls(href),
    };
}

export type PageOpenGraph = {
    type: "website" | "article";
    locale: string;
    url: string;
    siteName: string;
    title: string;
    description: string;
    images: Array<{ url: string; alt: string; }>;
};

export function buildOpenGraph(input: {
    locale: string;
    href: AppHref;
    title: string;
    description: string;
    type?: "website" | "article";
    imageUrl?: string;
}): PageOpenGraph {
    const appLocale = asAppLocale(input.locale);
    return {
        type: input.type ?? "website",
        locale: toOpenGraphLocale(appLocale),
        url: absoluteUrl(appLocale, input.href),
        siteName: BRAND_NAME,
        title: input.title,
        description: input.description,
        images: [
            {
                url: input.imageUrl
                    ? absoluteAssetUrl(input.imageUrl)
                    : absoluteAssetUrl(HERO_IMAGE_PATH),
                alt: input.title,
            },
        ],
    };
}

export type PageMetadata = {
    title: string;
    description: string;
    alternates: PageAlternates;
    openGraph: PageOpenGraph;
};

export function buildPageMetadata(input: {
    locale: string;
    href: AppHref;
    title: string;
    description: string;
    type?: "website" | "article";
    imageUrl?: string;
}): PageMetadata {
    return {
        title: input.title,
        description: input.description,
        alternates: pageAlternates(input.locale, input.href),
        openGraph: buildOpenGraph(input),
    };
}
