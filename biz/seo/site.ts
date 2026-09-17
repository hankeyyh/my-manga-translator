import { getPathname } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { getSiteUrl, toSchemaLanguage } from "./site-url";

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
