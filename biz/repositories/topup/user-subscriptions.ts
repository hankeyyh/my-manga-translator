import { Tables, TablesUpdate } from "@/types/database";
import { Result } from "@/types/do/response";
import { UserSubscription } from "@/types/do/user-subscription";
import { SupabaseClient } from "@supabase/supabase-js";

function mapUserSubscriptionRow(
    row: Tables<"user_subscriptions">,
    price: number | null = null,
): UserSubscription {
    return {
        id: row.id,
        userId: row.user_id,
        planTier: row.plan_tier,
        billingCycle: row.billing_cycle,
        status: row.status,
        currentPeriodStartedAt: row.current_period_started_at,
        currentPeriodEndedAt: row.current_period_ended_at,
        topupConfigId: row.topup_config_id,
        stripeSubscriptionId: row.stripe_subscription_id,
        price,
    };
}

export type UpdateUserSubscriptionParam = {
    status?: string;
    planTier?: string;
    billingCycle?: string;
    currentPeriodStartedAt?: string;
    currentPeriodEndedAt?: string;
    topupConfigId?: string;
    stripeSubscriptionId?: string | null;
};

export class UserSubscriptionRepository {
    constructor(private supabase: SupabaseClient) { }

    /** 查询用户当前仍有效的订阅（status 为 active 或 canceled） */
    async getCurrentByUserId(userId: string): Promise<Result<UserSubscription | null>> {
        const { data, error } = await this.supabase
            .from("user_subscriptions")
            .select("*")
            .eq("user_id", userId)
            .in("status", ["active", "canceled"])
            .maybeSingle();

        if (error) {
            return { data: null, error };
        }
        if (!data) {
            return { data: null, error: null };
        }
        return { data: mapUserSubscriptionRow(data), error: null };
    }

    async update(
        subscriptionId: string,
        param: UpdateUserSubscriptionParam,
    ): Promise<Result<void>> {
        const updateData: TablesUpdate<"user_subscriptions"> = {};

        if (param.status !== undefined) {
            updateData.status = param.status;
        }
        if (param.planTier !== undefined) {
            updateData.plan_tier = param.planTier;
        }
        if (param.billingCycle !== undefined) {
            updateData.billing_cycle = param.billingCycle;
        }
        if (param.currentPeriodStartedAt !== undefined) {
            updateData.current_period_started_at = param.currentPeriodStartedAt;
        }
        if (param.currentPeriodEndedAt !== undefined) {
            updateData.current_period_ended_at = param.currentPeriodEndedAt;
        }
        if (param.topupConfigId !== undefined) {
            updateData.topup_config_id = param.topupConfigId;
        }
        if (param.stripeSubscriptionId !== undefined) {
            updateData.stripe_subscription_id = param.stripeSubscriptionId;
        }

        const { data, error } = await this.supabase
            .from("user_subscriptions")
            .update(updateData)
            .eq("id", subscriptionId)
            .select("id")
            .maybeSingle();

        if (error) {
            return { data: null, error };
        }
        if (!data) {
            return {
                data: null,
                error: new Error("Subscription not found or update not permitted"),
            };
        }
        return { data: null, error: null };
    }

    async expireSubscriptionCycle(stripeSubscriptionId: string): Promise<Result<boolean>> {
        const { data, error } = await this.supabase.rpc("expire_subscription_cycle", {
            p_stripe_subscription_id: stripeSubscriptionId,
        });
        if (error) {
            return { data: null, error };
        }
        return { data: data, error: null };
    }
}
