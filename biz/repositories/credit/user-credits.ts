import { handleRpcResult } from "@/biz/utils/db";
import { Result } from "@/types/do/response";
import { SupabaseClient } from "@supabase/supabase-js";

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
        return handleRpcResult(result);
    }

    // 翻译重试，冻结用户积分
    async freezeImageCreditsForRetry(userId: string, taskId: string, imageIds: string[], retryCnt: number): Promise<Result<void>> {
        const result = await this.supabase.rpc("freeze_image_credits_for_retry", {
            p_user_id: userId,
            p_task_id: taskId,
            p_image_ids: imageIds,
            p_retry_cnt: retryCnt,
        });
        return handleRpcResult(result);
    }

    // 核销积分
    async captureImageCredits(userId: string, taskId: string, imageId: string, consumeCredits: number): Promise<Result<void>> {
        const result = await this.supabase.rpc("capture_image_credits", {
            p_user_id: userId,
            p_task_id: taskId,
            p_image_id: imageId,
            p_consume_credits: consumeCredits,
        });
        return handleRpcResult(result);
    }

    // 批量核销积分
    async batchCaptureImageCredits(userId: string, imageIds: string[]): Promise<Result<void>> {
        const result = await this.supabase.rpc("batch_capture_image_credits", {
            p_user_id: userId,
            p_image_ids: imageIds,
        });
        return handleRpcResult(result);
    }

    // 退回积分
    async refundImageCredits(userId: string, taskId: string, imageId: string, refundCredits: number): Promise<Result<void>> {
        const result = await this.supabase.rpc("refund_image_credits", {
            p_user_id: userId,
            p_task_id: taskId,
            p_image_id: imageId,
            p_refund_credits: refundCredits,
        });
        return handleRpcResult(result);
    }

    // 批量退回积分
    async batchRefundImageCredits(userId: string, imageIds: string[]): Promise<Result<void>> {
        const result = await this.supabase.rpc("batch_refund_image_credits", {
            p_user_id: userId,
            p_image_ids: imageIds,
        });
        return handleRpcResult(result);
    }
}
