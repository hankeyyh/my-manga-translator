export const PRICING_FAQ_KEYS = [
    "credits",
    "expiry",
    "cancel",
    "refund",
    "languages",
] as const;

export type PricingFaqKey = (typeof PRICING_FAQ_KEYS)[number];
