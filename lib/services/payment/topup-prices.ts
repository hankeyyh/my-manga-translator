/**
 * 订阅档位与 Stripe Price ID 映射（环境变量配置，服务端解析）
 * STRIPE_PRICE_BASIC_MONTHLY / YEARLY
 * STRIPE_PRICE_PRO_MONTHLY / YEARLY
 * STRIPE_PRICE_ULTRA_MONTHLY / YEARLY
 */

export type SubscriptionTier = "basic" | "pro" | "ultra";
export type BillingCycle = "monthly" | "yearly";

const TIERS: SubscriptionTier[] = ["basic", "pro", "ultra"];
const BILLINGS: BillingCycle[] = ["monthly", "yearly"];

export function isSubscriptionTier(value: unknown): value is SubscriptionTier {
    return typeof value === "string" && TIERS.includes(value as SubscriptionTier);
}

export function isBillingCycle(value: unknown): value is BillingCycle {
    return typeof value === "string" && BILLINGS.includes(value as BillingCycle);
}

export function resolveSubscriptionPriceId(tier: SubscriptionTier, billing: BillingCycle): string | undefined {
    const map: Record<SubscriptionTier, Record<BillingCycle, string | undefined>> = {
        basic: {
            monthly: process.env.STRIPE_PRICE_BASIC_MONTHLY,
            yearly: process.env.STRIPE_PRICE_BASIC_YEARLY,
        },
        pro: {
            monthly: process.env.STRIPE_PRICE_PRO_MONTHLY,
            yearly: process.env.STRIPE_PRICE_PRO_YEARLY,
        },
        ultra: {
            monthly: process.env.STRIPE_PRICE_ULTRA_MONTHLY,
            yearly: process.env.STRIPE_PRICE_ULTRA_YEARLY,
        },
    };
    const id = map[tier][billing];
    const trimmed = id?.trim();
    return trimmed || undefined;
}
