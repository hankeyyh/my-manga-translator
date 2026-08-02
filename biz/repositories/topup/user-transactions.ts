import { Tables, TablesInsert, TablesUpdate } from "@/types/database";
import { Result } from "@/types/do/response";
import { UserTransaction } from "@/types/do/user-transaction";
import { SupabaseClient } from "@supabase/supabase-js";

export interface CreatePayToUseTransactionParam {
    userId: string,
    rechargeAmount: number,
    credits: number,
    transactionStatus: string,
    packTier: string,
    topupConfigId: string,
}

export interface CreateSubscribeTransactionParam {
    userId: string,
    subscriptionStartedAt: string,
    subscriptionEndedAt: string,
    rechargeAmount: number,
    credits: number,
    transactionStatus: string,
    planTier: string,
    billingCycle: string,
    topupConfigId: string,
}

export interface UpdateTransactionParam {
    userId?: string,
    subscriptionStartedAt?: string,
    subscriptionEndedAt?: string,
    rechargeAmount?: number,
    credits?: number,
    transactionType?: string,
    transactionStatus?: string,
    planTier?: string,
    billingCycle?: string,
    packTier?: string,
    stripeSessionId?: string,
    succeededAt?: string,
    failedAt?: string,
    canceledAt?: string,
    topupConfigId?: string,
}

export function mapUserTransactionRowToUserTransaction(row: Tables<'user_transactions'>): UserTransaction {
    return {
        id: row.id,
        userId: row.user_id,
        createdAt: row.created_at,
        billingCycle: row.billing_cycle,
        planTier: row.plan_tier,
        packTier: row.pack_tier,
        credits: row.credits,
        rechargeAmount: row.recharge_amount,
        subscriptionEndedAt: row.subscription_ended_at,
        subscriptionStartedAt: row.subscription_started_at,
        transactionStatus: row.transaction_status,
        transactionType: row.transaction_type,
        topupConfigId: row.topup_config_id,
    };
}

export class UserTransactionsRepository {
    constructor(private supabase: SupabaseClient) {

    }

    async createPayToUseTransaction(param: CreatePayToUseTransactionParam): Promise<Result<UserTransaction>> {
        const insertData: TablesInsert<"user_transactions"> = {
            user_id: param.userId,
            recharge_amount: param.rechargeAmount,
            credits: param.credits,
            transaction_status: param.transactionStatus,
            transaction_type: "pay-to-use",
            pack_tier: param.packTier,
            topup_config_id: param.topupConfigId,
        };

        const { data, error } = await this.supabase.from("user_transactions")
            .insert(insertData)
            .select()
            .single();
        if (error) {
            return { data: null, error: error };
        }
        return { data: mapUserTransactionRowToUserTransaction(data), error: null };
    }

    async createSubscribeTransaction(param: CreateSubscribeTransactionParam) {
        const insertData: TablesInsert<"user_transactions"> = {
            user_id: param.userId,
            plan_tier: param.planTier,
            billing_cycle: param.billingCycle,
            recharge_amount: param.rechargeAmount,
            subscription_started_at: param.subscriptionStartedAt,
            subscription_ended_at: param.subscriptionEndedAt,
            credits: param.credits,
            transaction_status: param.transactionStatus,
            transaction_type: "subscription",
            topup_config_id: param.topupConfigId,
        };

        const { data, error } = await this.supabase.from("user_transactions")
            .insert(insertData)
            .select()
            .single();
        if (error) {
            return { data: null, error: error };
        }
        return { data: mapUserTransactionRowToUserTransaction(data), error: null };
    }

    async updateUserTransaction(transactionId: string, param: UpdateTransactionParam): Promise<Result<void>> {
        const updateData: TablesUpdate<"user_transactions"> = {};

        if (param.userId !== undefined) {
            updateData.user_id = param.userId;
        }
        if (param.subscriptionStartedAt !== undefined) {
            updateData.subscription_started_at = param.subscriptionStartedAt;
        }
        if (param.subscriptionEndedAt !== undefined) {
            updateData.subscription_ended_at = param.subscriptionEndedAt;
        }
        if (param.rechargeAmount !== undefined) {
            updateData.recharge_amount = param.rechargeAmount;
        }
        if (param.credits !== undefined) {
            updateData.credits = param.credits;
        }
        if (param.transactionType !== undefined) {
            updateData.transaction_type = param.transactionType;
        }
        if (param.transactionStatus !== undefined) {
            updateData.transaction_status = param.transactionStatus;
        }
        if (param.planTier !== undefined) {
            updateData.plan_tier = param.planTier;
        }
        if (param.billingCycle !== undefined) {
            updateData.billing_cycle = param.billingCycle;
        }
        if (param.packTier !== undefined) {
            updateData.pack_tier = param.packTier;
        }
        if (param.stripeSessionId !== undefined) {
            updateData.stripe_session_id = param.stripeSessionId;
        }
        if (param.succeededAt !== undefined) {
            updateData.succeeded_at = param.succeededAt;
        }
        if (param.failedAt !== undefined) {
            updateData.failed_at = param.failedAt;
        }
        if (param.canceledAt !== undefined) {
            updateData.canceled_at = param.canceledAt;
        }
        if (param.topupConfigId !== undefined) {
            updateData.topup_config_id = param.topupConfigId;
        }

        const updateResult = await this.supabase.from("user_transactions")
            .update(updateData)
            .eq("id", transactionId);

        if (updateResult.error) {
            return { data: null, error: updateResult.error };
        }
        return { data: null, error: null };
    }

    async succeedTransaction(transactionId: string): Promise<Result<boolean>> {
        const result = await this.supabase.rpc("succeed_transaction", {
            p_transaction_id: transactionId
        });
        if (result.error) {
            return { data: null, error: result.error };
        }
        return { data: result.data, error: null };
    }

    async listByUserId(
        userId: string,
        options: {
            cursor?: { createdAt: string; id: string };
            limit: number;
        },
    ): Promise<Result<UserTransaction[]>> {
        let query = this.supabase
            .from("user_transactions")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .order("id", { ascending: false })
            .limit(options.limit);

        if (options.cursor) {
            const createdAt = options.cursor.createdAt;
            const id = options.cursor.id;
            // (created_at, id) < (cursor) under DESC order → strictly older
            query = query.or(
                `created_at.lt."${createdAt}",and(created_at.eq."${createdAt}",id.lt.${id})`,
            );
        }

        const { data, error } = await query;
        if (error) {
            return { data: null, error };
        }
        return {
            data: (data ?? []).map(mapUserTransactionRowToUserTransaction),
            error: null,
        };
    }
}