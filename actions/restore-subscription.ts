"use server";

import { UserRepository } from "@/biz/repositories/auth/user-repository";
import { BillingService } from "@/biz/services/billing/billing-service";
import { PaymentService } from "@/biz/services/payment/payment-service";
import { createStripeClient } from "@/biz/utils/stripe/server";
import { createServerClient } from "@/biz/utils/supabase/server";
import { Response } from "@/types/action/response";
import {
    CHECK_PARAM_ERROR_CODE,
    EXCEPTION_CODE,
    SUCCESS_CODE,
    UNAUTHORIZED_ERROR_CODE,
} from "@/types/dto/response";

/**
 * 恢复订阅：Stripe 撤销周期末取消，并更新本地 status=active。
 */
export async function restoreSubscription(): Promise<Response<null>> {
    try {
        // 获取用户订阅
        const supabase = await createServerClient();
        const billingService = BillingService.fromSupabase(supabase);
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
                message: "No subscription to restore",
                data: null,
            };
        }
        if (currentSubscription.status !== "canceled") {
            return {
                code: CHECK_PARAM_ERROR_CODE,
                message: "Subscription is not pending cancellation",
                data: null,
            };
        }

        // 恢复stripe订阅
        const paymentService = new PaymentService(
            createStripeClient(),
            new UserRepository(supabase),
        );
        const restoreResult = await paymentService.restoreSubscription(
            currentSubscription.stripeSubscriptionId,
        );
        if (restoreResult.code !== SUCCESS_CODE) {
            return {
                code: restoreResult.code,
                message: restoreResult.error?.message ?? "Failed to restore subscription",
                data: null,
            };
        }

        // 恢复业务订阅
        const updateResult = await billingService.restoreUserSubscription(
            currentSubscription.id,
        );
        if (updateResult.code !== SUCCESS_CODE) {
            return {
                code: updateResult.code,
                message: updateResult.error?.message ?? "Failed to update subscription status",
                data: null,
            };
        }

        return {
            code: SUCCESS_CODE,
            message: "",
            data: null,
        };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown Error";
        console.error(`restoreSubscription unexpected error: ${errorMessage}`);
        return {
            code: EXCEPTION_CODE,
            message: "Internal Server Error",
            data: null,
        };
    }
}
