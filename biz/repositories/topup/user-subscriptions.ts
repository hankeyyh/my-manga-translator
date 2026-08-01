import { Tables } from "@/types/database";
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
        price,
    };
}

export class UserSubscriptionRepository {
    constructor(private supabase: SupabaseClient) { }

    async getByUserId(userId: string): Promise<Result<UserSubscription | null>> {
        const { data, error } = await this.supabase
            .from("user_subscriptions")
            .select("*")
            .eq("user_id", userId)
            .maybeSingle();

        if (error) {
            return { data: null, error };
        }
        if (!data) {
            return { data: null, error: null };
        }
        return { data: mapUserSubscriptionRow(data), error: null };
    }
}
