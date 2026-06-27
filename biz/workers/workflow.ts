import { WorkflowEntrypoint, WorkflowStep, WorkflowEvent } from 'cloudflare:workers';
import { TranslationService } from '../services/translate/translation-service';
import { createServiceRoleClient } from '../utils/supabase/admin';
import { UserRepository } from '../repositories/auth/user-repository';
import { UserCreditsRepository } from '../repositories/credit/user-credits';
import { PricingConfigRepository } from '../repositories/pricing/pricing-config';
import { TopUpConfigRepository } from '../repositories/topup/topup-config';
import { UserTransactionsRepository } from '../repositories/topup/user-transactions';
import { TranslationImageRepository } from '../repositories/translate/translation-image';
import { TranslationStorageRepository } from '../repositories/translate/translation-storage';
import { TranslationTaskRepository } from '../repositories/translate/translation-task';
import { CreditService } from '../services/credit/credit-service';

// Environment bindings
export interface Env {
    MY_WORKFLOW: Workflow<WorkflowParams>;
    CONCURRENT_IMAGES: string;
}

// Workflow related types
export interface WorkflowParams {
    userId: string;
    taskId: string;
    imageIds: string[];
}

interface StartWorkflowBody {
    userId: string;
    taskId: string;
}

interface RetryWorkflowBody {
    userId: string;
    taskId: string;
}

export class MyWorkFlow extends WorkflowEntrypoint<Env, WorkflowParams> {
    async run(event: WorkflowEvent<WorkflowParams>, step: WorkflowStep) {
        const { userId, taskId, imageIds } = event.payload;
        const supabase = createServiceRoleClient();
        const translationService = new TranslationService(
            new UserRepository(supabase),
            new TranslationTaskRepository(supabase),
            new TranslationImageRepository(supabase),
            new TranslationStorageRepository(supabase),
            new PricingConfigRepository(supabase),
        );
        const creditService = new CreditService(
            new TopUpConfigRepository(supabase),
            new UserTransactionsRepository(supabase),
            new PricingConfigRepository(supabase),
            new UserCreditsRepository(supabase),
        );

        // step1: 获取图片
        const images = await step.do("get_pending_images_for_processing", async () => {
            const result = await translationService.batchGetPendingImageForProcessing(imageIds);
            if (result.error) {
                throw result.error;
            }
            return result.data!;
        });
        if (!images || images.length === 0) {
            return;
        }
        const claimedImageIds = images.map((image) => image.id);

        // step2: 获取task
        let task;
        try {
            task = await step.do("get_task", async () => {
                const result = await translationService.getTask(taskId);
                if (result.error) {
                    throw result.error;
                }
                return result.data!;
            });
        } catch (error) {
            const errMessage = error instanceof Error ? error.message : String(error);
            await step.do("handle_get_task_failed", async () => {
                // 标记image status=failed
                const result = await translationService.markImagesFailed(
                    claimedImageIds,
                    `Failed to get task: ${errMessage}`,
                );
                if (result.error) {
                    throw result.error;
                }
                // 退还积分
                if (result.data) {
                    const needRefundIds = [...result.data];
                    const refundResult = await creditService.batchRefundImageCredits(userId, needRefundIds);
                    if (refundResult.error) {
                        throw refundResult.error;
                    }
                }
            });
            return;
        }

        // step3: download + submit + listen
        const { successImageIds, failedImageIds } = await step.do("translate_batch_pipeline", async () => {
            return await translationService.batchTranslatePipeline(task, images);
        });
        console.debug(`successImageIds: ${successImageIds}`);
        console.debug(`failedImageIds: ${failedImageIds}`);

        // step4: capture or refund credits
        if (successImageIds.length) {
            await step.do("capture_credits", async () => {
                const result = await creditService.batchCaptureImageCredits(userId, successImageIds);
                if (result.error) {
                    console.error("capture_credits failed: ", result.error);
                    throw result.error;
                }
                console.debug("capture_credits success!");
            });
        }
        if (failedImageIds.length) {
            await step.do("refund_credits", async () => {
                const result = await creditService.batchRefundImageCredits(userId, failedImageIds);
                if (result.error) {
                    console.error("refund_credits failed: ", result.error);
                    throw result.error;
                }
                console.debug("refund_credits success!");
            });
        }
    }
}

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};


function chunkImageIds(imageIds: string[], size: number): string[][] {
    const chunks: string[][] = [];
    for (let i = 0; i < imageIds.length; i += size) {
        chunks.push(imageIds.slice(i, i + size));
    }
    return chunks;
}

export default {
    async fetch(req: Request, env: Env): Promise<Response> {
        const url = new URL(req.url);
        // CORS 预验请求
        if (req.method === "OPTIONS") {
            return new Response(null, {
                headers: CORS_HEADERS
            });
        }
        // 提交翻译任务
        if (req.method === "POST" && url.pathname === "/") {
            const { userId, taskId } = await req.json() as StartWorkflowBody;
            const supabase = createServiceRoleClient();
            const translationService = new TranslationService(
                new UserRepository(supabase),
                new TranslationTaskRepository(supabase),
                new TranslationImageRepository(supabase),
                new TranslationStorageRepository(supabase),
                new PricingConfigRepository(supabase),
            );
            const imagesResult = await translationService.getTaskPendingImages(taskId);
            if (imagesResult.error) {
                return Response.json({ success: false, message: imagesResult.error.message }, { status: 500 });
            }
            const images = imagesResult.data!;
            if (images.length === 0) {
                return Response.json({ success: false, message: "No images found" }, { status: 400 });
            }

            const batchSize = Math.max(1, parseInt(env.CONCURRENT_IMAGES, 10) || 1);
            const imageIdBatches = chunkImageIds(
                images.map((image) => image.id),
                batchSize,
            );
            const instances = await env.MY_WORKFLOW.createBatch(
                imageIdBatches.map((imageIds, index) => ({
                    id: `${taskId}-${index}`,
                    params: { userId, taskId, imageIds },
                })),
            );

            return Response.json({
                success: true,
                taskId,
                workflowInstanceIds: instances.map((instance) => instance.id),
            }, { status: 200 });
        }
        // 翻译重试
        if (req.method === "POST" && url.pathname === "/retry") {
            const { userId, taskId } = await req.json() as RetryWorkflowBody;
            const supabase = createServiceRoleClient();
            const translationService = new TranslationService(
                new UserRepository(supabase),
                new TranslationTaskRepository(supabase),
                new TranslationImageRepository(supabase),
                new TranslationStorageRepository(supabase),
                new PricingConfigRepository(supabase),
            );
            const creditService = new CreditService(
                new TopUpConfigRepository(supabase),
                new UserTransactionsRepository(supabase),
                new PricingConfigRepository(supabase),
                new UserCreditsRepository(supabase),
            );

            // 获取任务失败图片
            const failedImagesResult = await translationService.getFailedImages(taskId);
            if (failedImagesResult.error) {
                return Response.json({ success: false, message: failedImagesResult.error.message }, { status: 500 });
            }
            const images = failedImagesResult.data!;
            if (images.length === 0) {
                return Response.json({ success: false, message: "No failed images found" }, { status: 400 });
            }
            const imageIds = images.map((value) => value.id);
            // 批量重试：要求本批图处于同一 retry_count 轮次
            const currentAttempts = images.map((img) => img.retryCount ?? 0);
            if (new Set(currentAttempts).size > 1) {
                // 部分图已重试过、部分没有 → 应拒绝或拆开两批 workflow
                return Response.json({ success: false, message: "images retry_count not same" }, { status: 500 });
            }
            const retryCnt = currentAttempts[0] + 1;
            // 重新冻结积分
            const freezeResult = await creditService.freezeImageCreditsForRetry(userId, taskId, imageIds, retryCnt);
            if (freezeResult.error) {
                return Response.json({ success: false, message: freezeResult.error.message }, { status: 500 });
            }
            // failed -> pending
            const resetResult = await translationService.markImagesFromFailedToPending(imageIds, retryCnt);
            if (resetResult.error) {
                // IF 失败，无法batch_refund回退积分，因为image.retry_count仍为旧值，和credit_logs.retry_count对不上
                return Response.json({ success: false, message: resetResult.error.message }, { status: 500 });
            }
            // 发起workflow
            const batchSize = Math.max(1, parseInt(env.CONCURRENT_IMAGES, 10) || 1);
            const imageIdBatches = chunkImageIds(imageIds, batchSize);
            const instances = await env.MY_WORKFLOW.createBatch(
                imageIdBatches.map((imageIds, index) => ({
                    id: `retry-${retryCnt}-${taskId}-${index}`,
                    params: { userId, taskId, imageIds },
                })),
            );

            return Response.json({
                success: true,
                taskId,
                workflowInstanceIds: instances.map((instance) => instance.id),
            }, { status: 200 });
        }
        return Response.json({ success: false, message: "Invalid Request" }, { status: 400 });
    },
};