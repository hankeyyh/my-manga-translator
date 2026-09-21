import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { PageBreadcrumb } from "@/components/page-breadcrumb";
import { BillingService } from "@/biz/services/billing/billing-service";
import { CreditService } from "@/biz/services/credit/credit-service";
import { createServerClient } from "@/biz/utils/supabase/server";
import { buildPageMetadata } from "@/biz/seo/site";
import { ClientPricingSection } from "../_components/client-pricing-section";
import { PricingGuide } from "./_components/pricing-guide";
import { PricingJsonLd } from "./_components/seo/pricing-json-ld";

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getLocale();
    const t = await getTranslations("meta");
    return buildPageMetadata({
        locale,
        href: "/pricing",
        title: t("pricingTitle"),
        description: t("pricingDescription"),
    });
}

export const revalidate = 60;

export default async function Page() {
    const t = await getTranslations("pricing");
    const tCommon = await getTranslations("common");
    const supabase = await createServerClient();
    const [topupConfigResult, subscriptionResult] = await Promise.all([
        CreditService.fromSupabase(supabase).getAllTopUpConfig(),
        BillingService.fromSupabase(supabase).getUserSubscription(),
    ]);
    const configs = topupConfigResult.data ?? [];

    return (
        <div className="bg-cc-surface-white">
            <PricingJsonLd configs={configs} />
            <div className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 sm:pt-16">
                <PageBreadcrumb
                    items={[
                        { label: tCommon("home"), href: "/" },
                        { label: t("title") },
                    ]}
                />
                <header className="mx-auto max-w-3xl text-center">
                    <h1 className="font-headline text-3xl font-extrabold tracking-tight text-cc-text-primary sm:text-5xl">
                        {t("pageTitle")}
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-cc-text-secondary">
                        {t("pageDescription")}
                    </p>
                </header>
            </div>
            {configs.length > 0 ? (
                <ClientPricingSection
                    topUpConfigs={configs}
                    currentSubscription={subscriptionResult.data}
                    showHeading={false}
                />
            ) : null}
            <PricingGuide />
        </div>
    );
}
