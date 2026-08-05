"use server";

import { UserRepository } from "@/biz/repositories/auth/user-repository";
import { BillingService } from "@/biz/services/billing/billing-service";
import {
    CreditService,
    TRANSACTION_TYPE_SUBSCRIPTION_CHANGE,
} from "@/biz/services/credit/credit-service";
import {
    PaymentService,
} from "@/biz/services/payment/payment-service";
import { type ChangeSubscriptionData } from "@/types/dto/user-subscription";
import { createServerClient } from "@/biz/utils/supabase/server";
import { Response } from "@/types/action/response";
import {
    CHECK_PARAM_ERROR_CODE,
    EXCEPTION_CODE,
    SUCCESS_CODE,
    UNAUTHORIZED_ERROR_CODE,
} from "@/types/dto/response";
import { createStripeClient } from "@/biz/utils/stripe/server";


export async function changeSubscription({ topupConfigId }: { topupConfigId: string; }): Promise<Response<ChangeSubscriptionData>> {
    let pendingTransactionId: string | undefined;
    let creditService: CreditService | undefined;

    try {
        if (!topupConfigId) {
            return {
                code: CHECK_PARAM_ERROR_CODE,
                message: "topupConfigId is required",
                data: null,
            };
        }

        const supabase = await createServerClient();
        const userRepo = new UserRepository(supabase);
        const billingService = BillingService.fromSupabase(supabase);
        creditService = CreditService.fromSupabase(supabase);
        const paymentService = new PaymentService(
            createStripeClient(),
            userRepo,
        );

        // 获取用户当前订阅
        const subscriptionResult = await billingService.getUserSubscription();
        if (subscriptionResult.code === UNAUTHORIZED_ERROR_CODE) {
            return { code: UNAUTHORIZED_ERROR_CODE, message: "UnAuthorized", data: null };
        }
        if (subscriptionResult.code !== SUCCESS_CODE) {
            return {
                code: subscriptionResult.code,
                message: subscriptionResult.error?.message ?? "Internal Server Error",
                data: null,
            };
        }
        const currentSubscription = subscriptionResult.data;
        if (!currentSubscription?.stripeSubscriptionId) {
            return {
                code: CHECK_PARAM_ERROR_CODE,
                message: "No active subscription to change",
                data: null,
            };
        }
        if (currentSubscription.topupConfigId === topupConfigId) {
            return {
                code: CHECK_PARAM_ERROR_CODE,
                message: "Already on this plan",
                data: null,
            };
        }

        // 获取充值套餐配置
        const planResult = await creditService.getTopUpConfig(topupConfigId);
        if (planResult.code !== SUCCESS_CODE || !planResult.data) {
            return {
                code: planResult.code,
                message: planResult.error?.message ?? "Param Error",
                data: null,
            };
        }
        const topupConfig = planResult.data;
        if (topupConfig.transactionType !== "subscription") {
            return {
                code: CHECK_PARAM_ERROR_CODE,
                message: "topupConfigId must be a subscription plan",
                data: null,
            };
        }
        if (!topupConfig.planTier || !topupConfig.billingCycle) {
            return {
                code: CHECK_PARAM_ERROR_CODE,
                message: "Invalid subscription topup config",
                data: null,
            };
        }

        // 创建交易记录
        const userId = currentSubscription.userId;
        const userTransResult = await creditService.startUserTransaction(
            userId,
            topupConfig,
            TRANSACTION_TYPE_SUBSCRIPTION_CHANGE,
        );
        if (userTransResult.error) {
            return {
                code: userTransResult.code,
                message: userTransResult.error.message,
                data: null,
            };
        }
        const userTransaction = userTransResult.data!;
        pendingTransactionId = userTransaction.id;

        // stripe 修改订阅
        const changeResult = await paymentService.changeSubscription(
            userId,
            userTransaction.id,
            currentSubscription.stripeSubscriptionId,
            topupConfig.stripePriceId,
        );
        if (changeResult.code !== SUCCESS_CODE || !changeResult.data) {
            await creditService.failUserTransaction(userTransaction.id);
            pendingTransactionId = undefined;
            return {
                code: changeResult.code,
                message: changeResult.error?.message ?? "Failed to change subscription",
                data: null,
            };
        }

        pendingTransactionId = undefined;
        // 本地套餐 / 积分等业务落地由 webhook 处理
        return {
            code: SUCCESS_CODE,
            message: "",
            data: changeResult.data,
        };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown Error";
        console.error(`ChangeSubscription unexpected error: ${errorMessage}`);
        if (pendingTransactionId && creditService) {
            await creditService.failUserTransaction(pendingTransactionId).catch(console.error);
        }
        return { code: EXCEPTION_CODE, message: "Internal Server Error", data: null };
    }
}
