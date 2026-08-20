import type { TopUpConfig } from "@/types/do/topup-config";

export function getPlanName(config: TopUpConfig) {
    const tier =
        config.transactionType === "subscription"
            ? config.planTier
            : config.packTier;
    if (tier === "basic") return "Basic";
    if (tier === "pro") return "Pro";
    if (tier === "ultra") return "Ultra";
    return tier ?? "Plan";
}

export function isFeatured(config: TopUpConfig) {
    const tier =
        config.transactionType === "subscription"
            ? config.planTier
            : config.packTier;
    return tier === "pro";
}

export function formatPrice(config: TopUpConfig) {
    const price = `$${config.price}`;
    if (config.transactionType !== "subscription") return price;
    if (config.billingCycle === "monthly") return `${price}/monthly`;
    if (config.billingCycle === "yearly") return `${price}/yearly`;
    return price;
}

export function formatCredits(config: TopUpConfig) {
    if (config.transactionType === "pay-to-use") {
        return `${config.creditsIncluded} credits`;
    }
    if (config.billingCycle === "monthly") {
        return `${config.creditsIncluded} credits / monthly`;
    }
    if (config.billingCycle === "yearly") {
        return `${config.creditsIncluded} credits / yearly`;
    }
    return `${config.creditsIncluded} credits`;
}
