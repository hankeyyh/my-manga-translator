/**
 * Nextjs 约定路由 /sitemap.xml。sitemap.ts 需要放到app目录下
 */
import type { MetadataRoute } from "next";
import { BlogService } from "@/biz/services/blog/blog-service";
import { createServiceRoleClient } from "@/biz/utils/supabase/admin";
import { absoluteUrl, languageAlternateUrls, type AppHref } from "@/biz/seo/site";
import { routing } from "@/i18n/routing";
import { LEGAL_SLUGS } from "@/types/do/legal-doc";

function localizedEntries(
    href: AppHref,
    extra?: Omit<MetadataRoute.Sitemap[number], "url" | "alternates">,
): MetadataRoute.Sitemap {
    return routing.locales.map((locale) => ({
        url: absoluteUrl(locale, href),
        alternates: { languages: languageAlternateUrls(href) },
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
