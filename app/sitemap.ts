import type { MetadataRoute } from "next";
import { BlogService } from "@/biz/services/blog/blog-service";
import { createServiceRoleClient } from "@/biz/utils/supabase/admin";
import { getPathname } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { LEGAL_SLUGS } from "@/types/do/legal-doc";

const SITE_URL = process.env.SITE_URL ?? "https://mangasense.xyz";

type AppHref = Parameters<typeof getPathname>[0]["href"];

function absoluteUrl(locale: AppLocale, href: AppHref): string {
    return `${SITE_URL}${getPathname({ locale, href })}`;
}

function languageAlternates(href: AppHref): NonNullable<MetadataRoute.Sitemap[number]["alternates"]>["languages"] {
    const languages: Record<string, string> = {
        "x-default": absoluteUrl(routing.defaultLocale, href),
    };
    for (const locale of routing.locales) {
        languages[locale] = absoluteUrl(locale, href);
    }
    return languages;
}

function localizedEntries(
    href: AppHref,
    extra?: Omit<MetadataRoute.Sitemap[number], "url" | "alternates">,
): MetadataRoute.Sitemap {
    return routing.locales.map((locale) => ({
        url: absoluteUrl(locale, href),
        alternates: { languages: languageAlternates(href) },
        ...extra,
    }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const entries: MetadataRoute.Sitemap = [
        ...localizedEntries("/", { changeFrequency: "weekly", priority: 1 }),
        ...localizedEntries("/blogs", { changeFrequency: "weekly", priority: 0.8 }),
        ...LEGAL_SLUGS.flatMap((slug) =>
            localizedEntries(`/legal/${slug}`, { changeFrequency: "yearly", priority: 0.4 }),
        ),
    ];

    try {
        const result = await BlogService.fromSupabase(createServiceRoleClient()).listPublishedPosts();
        if (result.error) {
            console.error(`sitemap, listPublishedPosts fail, error: ${result.error.message}`);
        }
        for (const post of result.data ?? []) {
            entries.push(
                ...localizedEntries(`/blogs/${post.slug}`, {
                    lastModified: post.publishedAt ?? undefined,
                    changeFrequency: "monthly",
                    priority: 0.6,
                }),
            );
        }
    } catch (error) {
        console.error("sitemap, listPublishedPosts throw", error);
    }

    return entries;
}
