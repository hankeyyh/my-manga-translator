export interface UserSubscription {
    id: string;
    userId: string;
    planTier: string;
    billingCycle: string;
    status: string;
    currentPeriodStartedAt: string;
    currentPeriodEndedAt: string;
    topupConfigId: string;
    stripeSubscriptionId: string | null;
    // 对应 topup_config.price，未匹配到配置时为 null
    price: number | null;
}
