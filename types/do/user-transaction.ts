export interface UserTransaction {
    id: string;
    userId: string;
    billingCycle: string | null;
    planTier: string | null;
    packTier: string | null;
    credits: number | null;
    rechargeAmount: number;
    subscriptionEndedAt: string | null;
    subscriptionStartedAt: string | null;
    transactionStatus: string;
    transactionType: string;
}