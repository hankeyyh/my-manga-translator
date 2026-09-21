import { getLocale, getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/json-ld";
import {
    buildBreadcrumbList,
    buildFaqPage,
    buildWebPage,
    compactJsonLd,
} from "@/biz/seo/json-ld";
import { absoluteUrl, asAppLocale } from "@/biz/seo/site";
import { FAQ_KEYS } from "../../../_components/faq-keys";

export async function FaqJsonLd() {
    const appLocale = asAppLocale(await getLocale());
    const t = await getTranslations("faq");
    const tCommon = await getTranslations("common");
    const homeUrl = absoluteUrl(appLocale, "/");
    const pageUrl = absoluteUrl(appLocale, "/faq");
    const faqs = FAQ_KEYS.map((key) => ({
        question: t(`items.${key}.question`),
        answer: t(`items.${key}.answer`),
    }));

    return (
        <JsonLd
            data={compactJsonLd([
                buildWebPage({
                    name: t("pageTitle"),
                    url: pageUrl,
                    locale: appLocale,
                    description: t("pageDescription"),
                }),
                buildBreadcrumbList([
                    { name: tCommon("home"), url: homeUrl },
                    { name: t("title"), url: pageUrl },
                ]),
                buildFaqPage({ url: pageUrl, faqs }),
            ])}
        />
    );
}
