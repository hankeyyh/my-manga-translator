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

export function getPriceSuffix(config: TopUpConfig, t: PricingT): string | null {
    if (config.transactionType !== "subscription") return null;
    if (config.billingCycle === "yearly") return t("priceYearlySuffix");
    if (config.billingCycle === "monthly") return t("priceMonthlySuffix");
    return null;
}

export function formatPrice(config: TopUpConfig, t: PricingT) {
    const amount = `$${config.price}`;
    const suffix = getPriceSuffix(config, t);
    return suffix ? `${amount} ${suffix}` : amount;
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

export type PlanPromoKind = "payToUse" | "monthly" | "yearly";

export function getPromoKind(config: TopUpConfig): PlanPromoKind {
    if (config.transactionType === "subscription" && config.billingCycle === "yearly") {
        return "yearly";
    }
    if (config.transactionType === "subscription") {
        return "monthly";
    }
    return "payToUse";
}

export function getPromoText(config: TopUpConfig, t: PricingT) {
    const kind = getPromoKind(config);
    if (kind === "yearly") return t("promoYearly");
    if (kind === "monthly") return t("promoMonthly");
    return t("promoPayToUse");
}

export function getPlanFeatures(config: TopUpConfig, t: PricingT): string[] {
    const kind = getPromoKind(config);
    const key =
        kind === "yearly"
            ? "featuresYearly"
            : kind === "monthly"
                ? "featuresMonthly"
                : "featuresPayToUse";
    const raw = t.raw(key);
    if (!Array.isArray(raw)) return [];
    return raw.filter((item): item is string => typeof item === "string");
}

/** 年付相对月付连买 12 个月的最低折扣百分比，无法计算时返回 null */
export function getYearlySavePercent(configs: TopUpConfig[]): number | null {
    const monthlyByTier = new Map<string, number>();
    const yearlyByTier = new Map<string, number>();
    for (const config of configs) {
        if (config.transactionType !== "subscription" || !config.planTier) {
            continue;
        }
        if (config.billingCycle === "monthly") {
            monthlyByTier.set(config.planTier, config.price);
        }
        if (config.billingCycle === "yearly") {
            yearlyByTier.set(config.planTier, config.price);
        }
    }
    let minPercent: number | null = null;
    for (const [tier, monthlyPrice] of monthlyByTier) {
        const yearlyPrice = yearlyByTier.get(tier);
        if (yearlyPrice == null || monthlyPrice <= 0) continue;
        const billedYearly = monthlyPrice * 12;
        if (billedYearly <= yearlyPrice) continue;
        const percent = Math.floor(((billedYearly - yearlyPrice) / billedYearly) * 100);
        if (percent <= 0) continue;
        minPercent =
            minPercent == null ? percent : Math.min(minPercent, percent);
    }
    return minPercent;
}
