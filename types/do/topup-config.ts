// 充值计划配置
export interface TopUpConfig {
    id: string,
    // pay_to_use or subscription
    transactionType: string,
    // 订阅档位 basic, pro, ultra
    planTier: string | null,
    // 订阅付款周期 monthly, yearly
    billingCycle: string | null,
    price: number,
    creditsIncluded: number,
    // 单次积分包档位 basic, pro, ultra
    packTier: string | null,
    // stripe
    stripePriceId: string,
}