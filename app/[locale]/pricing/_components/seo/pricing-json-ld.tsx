import { getLocale, getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/json-ld";
import {
    buildBreadcrumbList,
    buildFaqPage,
    buildOfferCatalog,
    buildWebPage,
    compactJsonLd,
} from "@/biz/seo/json-ld";
import { absoluteUrl, asAppLocale } from "@/biz/seo/site";
import type { TopUpConfig } from "@/types/do/topup-config";
import {
    formatCredits,
    getOfferDisplayName,
} from "@/app/[locale]/_components/plan-display";
import { PRICING_FAQ_KEYS } from "../pricing-faq-keys";

function offerBillingCycle(value: string | null): "monthly" | "yearly" | null {
    if (value === "monthly" || value === "yearly") return value;
    return null;
}

type Props = {
    configs: TopUpConfig[];
};

export async function PricingJsonLd({ configs }: Props) {
    const appLocale = asAppLocale(await getLocale());
    const t = await getTranslations("pricing");
    const tCommon = await getTranslations("common");
    const homeUrl = absoluteUrl(appLocale, "/");
    const pageUrl = absoluteUrl(appLocale, "/pricing");

    const faqs = PRICING_FAQ_KEYS.map((key) => ({
        question: t(`faq.${key}.question`),
        answer: t(`faq.${key}.answer`),
    }));

    const offers = [...configs]
        .sort((a, b) => a.price - b.price)
        .map((config) => {
            return {
                name: getOfferDisplayName(config, t),
                description: formatCredits(config, t),
                price: config.price,
                url: pageUrl,
                billingCycle: offerBillingCycle(config.billingCycle),
            };
        });

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
                buildOfferCatalog({
                    name: t("pageTitle"),
                    url: pageUrl,
                    description: t("pageDescription"),
                    offers,
                }),
                buildFaqPage({ url: pageUrl, faqs }),
            ])}
        />
    );
}
