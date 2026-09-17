import { getLocale, getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/json-ld";
import {
    buildBreadcrumbList,
    buildWebPage,
    compactJsonLd,
} from "@/biz/seo/json-ld";
import { absoluteUrl, asAppLocale } from "@/biz/seo/site";
import type { LegalSlug } from "@/types/do/legal-doc";

type Props = {
    slug: LegalSlug;
    title: string;
};

export async function LegalDocumentJsonLd({ slug, title }: Props) {
    const appLocale = asAppLocale(await getLocale());
    const tCommon = await getTranslations("common");
    const homeUrl = absoluteUrl(appLocale, "/");
    const pageUrl = absoluteUrl(appLocale, `/legal/${slug}`);

    return (
        <JsonLd
            data={compactJsonLd([
                buildWebPage({
                    type: slug === "about" ? "AboutPage" : "WebPage",
                    name: title,
                    url: pageUrl,
                    locale: appLocale,
                }),
                buildBreadcrumbList([
                    { name: tCommon("brand"), url: homeUrl },
                    { name: title, url: pageUrl },
                ]),
            ])}
        />
    );
}
