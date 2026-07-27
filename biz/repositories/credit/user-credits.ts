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

    // 批量核销积分
    async batchCaptureImageCredits(userId: string, imageIds: string[]): Promise<Result<void>> {
        const result = await this.supabase.rpc("batch_capture_image_credits", {
            p_user_id: userId,
            p_image_ids: imageIds,
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

    // 重试翻译
    async prepareImagesForRetry(userId: string, taskId: string, imageIds: string[]): Promise<Result<{ newly_prepared: string[], already_prepared: string[] }>> {
        const result = await this.supabase.rpc("prepare_images_for_retry", {
            p_user_id: userId,
            p_task_id: taskId,
            p_image_ids: imageIds,
        });
        return handleRpcResult(result);
    }
}
