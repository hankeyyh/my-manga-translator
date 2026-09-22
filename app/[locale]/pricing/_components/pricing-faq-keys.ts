import { FAQ_KEYS } from "../../_components/faq-keys";

/** 价格页只展示首页 FAQ 里与计费、语言相关的条目，文案以首页为准。 */
export const PRICING_FAQ_KEYS = [
    "credits",
    "expiry",
    "cancel",
    "refund",
    "languages",
] as const satisfies readonly (typeof FAQ_KEYS)[number][];
