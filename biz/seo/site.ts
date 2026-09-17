import { hasLocale } from "next-intl";
import { getPathname } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { getSiteUrl, toSchemaLanguage } from "./site-url";

export type AppHref = Parameters<typeof getPathname>[0]["href"];

export function asAppLocale(locale: string): AppLocale {
    return hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
}

export function schemaLanguages(): string[] {
    return routing.locales.map(toSchemaLanguage);
}

export function absoluteUrl(locale: AppLocale, href: AppHref): string {
    return `${getSiteUrl()}${getPathname({ locale, href })}`;
}
