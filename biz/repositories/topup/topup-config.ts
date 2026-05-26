import { Tables } from "@/types/database";
import { Result } from "@/types/do/common";
import { TopUpConfig } from "@/types/do/topup-config";
import { SupabaseClient } from "@supabase/supabase-js";

function mapTopUpConfigRowToTopUpConfig(row: Tables<'topup_config'>): TopUpConfig {
    return {
        id: row.id,
        transactionType: row.transaction_type,
        planTier: row.plan_tier,
        billingCycle: row.billing_cycle,
        packTier: row.pack_tier,
        price: row.price,
        creditsIncluded: row.credits_included,
        stripePriceId: row.stripe_price_id,
    };
}

export class TopUpConfigRepository {
    constructor(private supabase: SupabaseClient) { }

    async getTopUpConfig(id: string): Promise<Result<TopUpConfig>> {
        const { data, error } = await this.supabase.from("topup_config")
            .select("*")
            .eq("id", id)
            .eq("is_active", true)
            .single();
        if (error) {
            return { data: null, error: error };
        }
        if (!data) {
            return { data: null, error: new Error("topup_config not found") };
        }
        return { data: mapTopUpConfigRowToTopUpConfig(data), error: null };
    }

    async getAllTopUpConfig(): Promise<Result<TopUpConfig[]>> {
        const { data, error } = await this.supabase.from("topup_config")
            .select("*")
            .eq("is_active", true);
        if (error) {
            return { data: null, error: error };
        }
        if (!data || data.length === 0) {
            return { data: [], error: null };
        }
        return { data: data.map((val: Tables<'topup_config'>) => mapTopUpConfigRowToTopUpConfig(val)), error: null };
    }
}