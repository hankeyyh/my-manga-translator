/**
 * Nextjs 约定路由 /robots.txt。robots.ts 需要放到app目录下
 */
import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/biz/seo/site-url";
import { routing } from "@/i18n/routing";

function localized(path: string): string[] {
    return routing.locales.map((locale) =>
        locale === routing.defaultLocale ? path : `/${locale}${path}`,
    );
}

export default function robots(): MetadataRoute.Robots {
    const siteUrl = getSiteUrl();
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: [
                "/api/",
                ...localized("/auth"),
                ...localized("/home"),
                ...localized("/payment"),
            ],
        },
        sitemap: `${siteUrl}/sitemap.xml`,
        host: siteUrl,
    };
}
