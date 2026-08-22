import type { TopUpConfig } from "@/types/do/topup-config";
import type { useTranslations } from "next-intl";

type PricingT = ReturnType<typeof useTranslations<"pricing">>;

export function getPlanName(config: TopUpConfig, t: PricingT) {
    const tier =
        config.transactionType === "subscription"
            ? config.planTier
            : config.packTier;
    if (tier === "basic") return "Basic";
    if (tier === "pro") return "Pro";
    if (tier === "ultra") return "Ultra";
    return tier ?? t("planFallback");
}

export function isFeatured(config: TopUpConfig) {
    const tier =
        config.transactionType === "subscription"
            ? config.planTier
            : config.packTier;
    return tier === "pro";
}

export function formatPrice(config: TopUpConfig, t: PricingT) {
    if (config.transactionType !== "subscription") return `$${config.price}`;
    if (config.billingCycle === "monthly") return t("priceMonthly", { price: config.price });
    if (config.billingCycle === "yearly") return t("priceYearly", { price: config.price });
    return `$${config.price}`;
}

export function formatCredits(config: TopUpConfig, t: PricingT) {
    if (config.transactionType === "pay-to-use") {
        return t("creditsPayToUse", { count: config.creditsIncluded });
    }
    if (config.billingCycle === "monthly") {
        return t("creditsMonthly", { count: config.creditsIncluded });
    }
    if (config.billingCycle === "yearly") {
        return t("creditsYearly", { count: config.creditsIncluded });
    }
    return t("creditsPayToUse", { count: config.creditsIncluded });
}
