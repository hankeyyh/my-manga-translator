import { Result } from "@/types/do/common";
import { SupabaseClient } from "@supabase/supabase-js";

// 积分余额不足
const CREDIT_BALANCE_NOT_ENOUGH = "U0001";
// 已冻结积分不足，无法核销
const CREDIT_FROZEN_NOT_ENOUGH = "U0002";
// 已冻结积分不足，无法退回
const CREDIT_FROZEN_NOT_ENOUGH_TO_REFUND = "U0003";

export const CREDIT_BALANCE_NOT_ENOUGH_NAME = "CreditBalanceNotEnoughError";
export const CREDIT_FROZEN_NOT_ENOUGH_TO_CAPTURE_NAME = "CreditFrozenNotEnoughToCaptureError";
export const CREDIT_FROZEN_NOT_ENOUGH_TO_REFUND_NAME = "CreditFrozenNotEnoughToRefundError";

export class UserCreditsRepository {
    constructor(private supabase: SupabaseClient) {

    }

    // 冻结用户积分
    async freezeTaskCredits(userId: string, taskId: string, credits: number): Promise<Result<void>> {
        const result = await this.supabase.rpc("freeze_task_credits", {
            p_user_id: userId,
            p_task_id: taskId,
            p_credits: credits,
        });
        if (result.error) {
            if (result.error.code === CREDIT_BALANCE_NOT_ENOUGH) {
                const err = new Error("not enough credit");
                err.name = CREDIT_BALANCE_NOT_ENOUGH_NAME;
                return { data: null, error: err };
            }
            return { data: null, error: result.error };
        }
        return { data: null, error: null };
    }

    // 核销积分
    async captureImageCredits(userId: string, taskId: string, imageId: string, consumeCredits: number): Promise<Result<void>> {
        const result = await this.supabase.rpc("capture_image_credits", {
            p_user_id: userId,
            p_task_id: taskId,
            p_image_id: imageId,
            p_consume_credits: consumeCredits,
        });
        if (result.error) {
            if (result.error.code === CREDIT_FROZEN_NOT_ENOUGH) {
                const err = new Error("not enough frozen credit");
                err.name = CREDIT_FROZEN_NOT_ENOUGH_TO_CAPTURE_NAME;
                return { data: null, error: err };
            }
            return { data: null, error: result.error };
        }
        return { data: null, error: null };
    }

    // 退回积分
    async refundImageCredits(userId: string, taskId: string, imageId: string, refundCredits: number): Promise<Result<void>> {
        const result = await this.supabase.rpc("refund_image_credits", {
            p_user_id: userId,
            p_task_id: taskId,
            p_image_id: imageId,
            p_refund_credits: refundCredits,
        });
        if (result.error) {
            if (result.error.code === CREDIT_FROZEN_NOT_ENOUGH_TO_REFUND) {
                const err = new Error("not enough frozen credit to refund");
                err.name = CREDIT_FROZEN_NOT_ENOUGH_TO_REFUND_NAME;
                return { data: null, error: err };
            }
            return { data: null, error: result.error };
        }
        return { data: null, error: null };
    }
}