import { getLocale, getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/json-ld";
import {
    buildBreadcrumbList,
    buildCollectionPage,
    compactJsonLd,
} from "@/biz/seo/json-ld";
import { absoluteUrl, asAppLocale } from "@/biz/seo/site";

export async function BlogIndexJsonLd() {
    const appLocale = asAppLocale(await getLocale());
    const t = await getTranslations("blog");
    const tCommon = await getTranslations("common");
    const homeUrl = absoluteUrl(appLocale, "/");
    const blogsUrl = absoluteUrl(appLocale, "/blogs");

    return (
        <JsonLd
            data={compactJsonLd([
                buildCollectionPage({ name: t("title"), url: blogsUrl }),
                buildBreadcrumbList([
                    { name: tCommon("home"), url: homeUrl },
                    { name: t("title"), url: blogsUrl },
                ]),
            ])}
        />
    );
}
