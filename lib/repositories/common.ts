import { TranslationImage, type TranslationTask } from "../services/translate/translation-types";
import type { Tables } from "../supabase/database";


export function mapTranslationImageRowToTranslationImage(data: Tables<'translation_images'>): TranslationImage {
    return {
        id: data.id,
        taskId: data.task_id,
        imageIndex: data.image_index,
        status: data.status as TranslationImage['status'],
        // 输入数据
        originalImagePath: data.original_image_path,
        originalImageSize: data.original_image_size ?? undefined,
        originalImageWidth: data.original_image_width ?? undefined,
        originalImageHeight: data.original_image_height ?? undefined,
        // 输出数据
        folderName: data.folder_name ?? undefined,
        resultImagePath: data.result_image_path ?? undefined,
        // 错误处理
        errorMessage: data.error_message ?? undefined,
        retryCount: data.retry_count ?? 0,
        maxRetries: data.max_retries ?? 3,

        createdAt: data.created_at ?? new Date().toISOString(),
        startedAt: data.started_at ?? undefined,
        completedAt: data.completed_at ?? undefined,
        updatedAt: data.updated_at ?? new Date().toISOString(),
        metadata: (data.metadata as TranslationImage['metadata']) ?? undefined,
    };
}export function mapTranslationTaskRowToTranslationTask(data: Tables<'translation_tasks'>): TranslationTask {
    return {
        id: data.id,
        userId: data.user_id ?? '',
        status: data.status as TranslationTask['status'],
        // 统计信息
        totalImages: data.total_images,
        completedImages: data.completed_images,
        failedImages: data.failed_images,
        progress: data.progress ?? 0,

        config: data.config as TranslationTask['config'],

        createdAt: data.created_at ?? new Date().toISOString(),
        startedAt: data.started_at ?? undefined,
        completedAt: data.completed_at ?? undefined,
        updatedAt: data.updated_at ?? new Date().toISOString(),
        metadata: (data.metadata as TranslationTask['metadata']) ?? undefined,
    };
}

