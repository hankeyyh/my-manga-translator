import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

const SITE_URL = process.env.SITE_URL ?? "https://mangasense.xyz";

function localized(path: string): string[] {
    return routing.locales.map((locale) =>
        locale === routing.defaultLocale ? path : `/${locale}${path}`,
    );
}

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: [
                "/api/",
                "/design",
                ...localized("/auth"),
                ...localized("/home"),
                ...localized("/payment"),
            ],
        },
        sitemap: `${SITE_URL}/sitemap.xml`,
        host: SITE_URL,
    };
}
