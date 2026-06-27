import type { SupabaseClient } from '@supabase/supabase-js';
import { ImageStatus, TranslationImage } from "@/types/do/translation-image";
import type { Json, Tables, TablesInsert, TablesUpdate } from '../../../types/database';
import { Result } from "@/types/do/response";

// 创建图片参数
export interface CreateImageParams {
    id?: string;
    taskId: string;
    filename: string;
    imageIndex: number;
    originalImagePath: string;
    originalImageSize?: number;
    originalImageWidth?: number;
    originalImageHeight?: number;
    credits: number;
}

// 更新图片参数
export interface UpdateImageParams {
    status?: ImageStatus;
    folderName?: string;
    resultImagePath?: string;
    errorMessage?: string;
    retryCount?: number;
    startedAt?: string;
    completedAt?: string;
    metadata?: Record<string, any>;
}

export function mapTranslationImageRowToTranslationImage(data: Tables<'translation_images'>): TranslationImage {
    return {
        id: data.id,
        taskId: data.task_id,
        filename: data.filename,
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
        maxRetries: data.max_retries ?? 0, // 目前不允许重试

        createdAt: data.created_at ?? new Date().toISOString(),
        startedAt: data.started_at ?? undefined,
        completedAt: data.completed_at ?? undefined,
        updatedAt: data.updated_at ?? new Date().toISOString(),
        metadata: (data.metadata as TranslationImage['metadata']) ?? undefined,

        credits: data.credits,
    };
}

export class TranslationImageRepository {
    constructor(private supabase: SupabaseClient) { }

    /**
   * 批量创建图片记录
   */
    async createImages(params: CreateImageParams[]): Promise<Result<TranslationImage[]>> {
        if (params.length === 0) {
            return {
                data: [],
                error: null,
            };
        }

        const insertData: TablesInsert<'translation_images'>[] = params.map((param) => ({
            ...(param.id && { id: param.id }),
            task_id: param.taskId,
            filename: param.filename,
            image_index: param.imageIndex,
            status: 'pending',
            original_image_path: param.originalImagePath,
            original_image_size: param.originalImageSize,
            original_image_width: param.originalImageWidth,
            original_image_height: param.originalImageHeight,
            credits: param.credits,
        }));

        const { data, error } = await this.supabase
            .from('translation_images')
            .insert(insertData)
            .select();

        if (error) {
            return {
                data: null,
                error: new Error(`创建图片记录失败: ${error.message}`),
            };
        }
        if (!data || data.length === 0) {
            return {
                data: null,
                error: new Error('创建图片记录失败: 未返回图片数据'),
            };
        }

        return {
            data: data.map((item) => mapTranslationImageRowToTranslationImage(item)),
            error: null,
        };
    }

    async deleteImages(imageIds: string[]): Promise<Result<string[]>> {
        if (imageIds.length === 0) {
            return { data: [], error: null };
        }
        const result = await this.supabase.from("translation_images")
            .delete()
            .in("id", imageIds)
            .select("id");
        if (result.error) {
            return { data: null, error: result.error };
        }
        return { data: result.data.map((value) => value.id), error: null };
    }

    /**
   * 获取图片详情
   */
    async getImage(imageId: string): Promise<Result<TranslationImage>> {
        const { data, error } = await this.supabase
            .from('translation_images')
            .select('*')
            .eq('id', imageId)
            .single();

        if (error) {
            return {
                data: null,
                error: new Error(`获取图片详情失败: ${error.message}`),
            };
        }
        if (!data) {
            return {
                data: null,
                error: new Error('获取图片详情失败: 未返回图片数据'),
            };
        }

        return {
            data: mapTranslationImageRowToTranslationImage(data),
            error: null,
        };
    }

    /**
   * 获取任务的pending图片
   */
    async getPendingImagesByTask(taskId: string): Promise<Result<TranslationImage[]>> {
        const { data, error } = await this.supabase
            .from('translation_images')
            .select('*')
            .eq('task_id', taskId)
            .eq('status', "pending")
            .order('image_index', { ascending: true });

        if (error) {
            return {
                data: null,
                error: new Error(`获取任务图片列表失败: ${error.message}`),
            };
        }
        if (!data || data.length === 0) {
            return {
                data: [],
                error: null,
            };
        }

        return {
            data: data.map((item) => mapTranslationImageRowToTranslationImage(item)),
            error: null,
        };
    }

    /**
   * 更新图片状态 (触发器会自动更新任务状态)
   */
    async updateImage(imageId: string, params: UpdateImageParams): Promise<Result<void>> {
        const updateData: TablesUpdate<'translation_images'> = {};

        if (params.status !== undefined) {
            updateData.status = params.status;
        }
        if (params.folderName !== undefined) {
            updateData.folder_name = params.folderName;
        }
        if (params.resultImagePath !== undefined) {
            updateData.result_image_path = params.resultImagePath;
        }
        if (params.errorMessage !== undefined) {
            updateData.error_message = params.errorMessage;
        }
        if (params.retryCount !== undefined) {
            updateData.retry_count = params.retryCount;
        }
        if (params.startedAt !== undefined) {
            updateData.started_at = params.startedAt;
        }
        if (params.completedAt !== undefined) {
            updateData.completed_at = params.completedAt;
        }
        if (params.metadata !== undefined) {
            updateData.metadata = params.metadata as Json;
        }

        if (Object.keys(updateData).length === 0) {
            return {
                data: null,
                error: null,
            };
        }

        const { error } = await this.supabase
            .from('translation_images')
            .update(updateData)
            .eq('id', imageId);

        if (error) {
            return {
                data: null,
                error: new Error(`更新图片状态失败: ${error.message}`),
            };
        }
        return {
            data: null,
            error: null,
        };
    }

    /**
   * 乐观锁批量抢占待处理图片：仅当 status=pending 时更新为 processing 并返回行数据。
   * 返回 data=null 表示已被其他 worker 抢占，非错误。
   */
    async batchGetPendingImageForProcessing(imageIds: string[]): Promise<Result<TranslationImage[]>> {
        if (imageIds.length === 0) {
            return { data: null, error: null };
        }
        const { data, error } = await this.supabase
            .from('translation_images')
            .update({
                status: 'processing',
                started_at: new Date().toISOString(),
            })
            .in('id', imageIds)
            .eq('status', 'pending')
            .select();

        if (error) {
            return {
                data: null,
                error: new Error(`抢占图片失败: ${error.message}`),
            };
        }
        if (!data || data.length === 0) {
            return {
                data: [],
                error: null
            };
        }
        return {
            data: data.map(mapTranslationImageRowToTranslationImage),
            error: null,
        };
    }

    /**
   * 获取待处理的图片 (Worker 专用)
   */
    async getPendingImages(limit: number = 10): Promise<Result<TranslationImage[]>> {
        const { data, error } = await this.supabase
            .from('translation_images')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: true })
            .limit(limit);

        if (error) {
            return {
                data: null,
                error: new Error(`Failed to get pending images: ${error.message}`),
            };
        }

        if (!data || data.length === 0) {
            return {
                data: [],
                error: null,
            };
        }

        return {
            data: data.map((item) => mapTranslationImageRowToTranslationImage(item)),
            error: null,
        };
    }

    /**
   * 获取超时的 processing 图片 (Worker 专用)
   */
    async getStuckImages(timeoutMinutes: number = 30): Promise<Result<TranslationImage[]>> {
        const timeoutTime = new Date(Date.now() - timeoutMinutes * 60 * 1000).toISOString();
        const { data, error } = await this.supabase
            .from('translation_images')
            .select('*')
            .eq('status', 'processing')
            .lt('started_at', timeoutTime)
            .order('created_at', { ascending: true });

        if (error) {
            return {
                data: null,
                error: new Error(`获取超时的 processing 图片失败: ${error.message}`),
            };
        }
        if (!data || data.length === 0) {
            return {
                data: [],
                error: null,
            };
        }

        return {
            data: data.map((item) => mapTranslationImageRowToTranslationImage(item)),
            error: null,
        };
    }

    /**
   * 获取失败的图片 (用于重试)
   */
    async getFailedImages(taskId: string): Promise<Result<TranslationImage[]>> {
        const { data, error } = await this.supabase
            .from('translation_images')
            .select('*')
            .eq('task_id', taskId)
            .eq('status', 'failed');

        if (error) {
            return {
                data: null,
                error: new Error(`获取失败的图片失败: ${error.message}`),
            };
        }
        if (!data || data.length === 0) {
            return {
                data: [],
                error: null,
            };
        }

        return {
            data: data.map((item) => mapTranslationImageRowToTranslationImage(item)),
            error: null,
        };
    }

    /**
     * 获取翻译成功的图片
     */
    async getSuccessImages(taskId: string): Promise<Result<TranslationImage[]>> {
        const { data, error } = await this.supabase
            .from('translation_images')
            .select('*')
            .eq('task_id', taskId)
            .eq('status', 'completed');

        if (error) {
            return {
                data: null,
                error: new Error(`获取翻译成功的图片失败: ${error.message}`),
            };
        }
        if (!data || data.length === 0) {
            return {
                data: [],
                error: null,
            };
        }

        return {
            data: data.map((item) => mapTranslationImageRowToTranslationImage(item)),
            error: null,
        };
    }

    /**
   * 获取用户已完成翻译的图片（用于历史记录）
   */
    async getUserCompletedImages(userId: string, limit: number = 200): Promise<Result<TranslationImage[]>> {
        const { data, error } = await this.supabase
            .from('translation_images')
            .select('*, translation_tasks!inner(user_id, status)')
            .eq('translation_tasks.user_id', userId)
            .eq('translation_tasks.status', 'completed')
            .eq('status', 'completed')
            .not('result_image_path', 'is', null)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            return {
                data: null,
                error: new Error(`获取用户历史图片失败: ${error.message}`),
            };
        }

        const images = (data ?? []).map((item) =>
            mapTranslationImageRowToTranslationImage(item as unknown as Tables<'translation_images'>),
        );

        return {
            data: images,
            error: null,
        };
    }

    async markImagesFailed(imageIds: string[], errMessage: string): Promise<Result<string[]>> {
        if (imageIds.length === 0) {
            return { data: [], error: null };
        }
        const result = await this.supabase.from("translation_images")
            .update({
                status: "failed",
                error_message: errMessage,
            })
            .in("id", imageIds)
            .eq("status", "processing")
            .select("id");
        if (result.error) {
            return { data: null, error: result.error };
        }
        return { data: result.data.map((value) => value.id), error: null };
    }

    async markImageSuccess(imageId: string, outputPath: string): Promise<Result<string>> {
        const result = await this.supabase.from("translation_images")
            .update({
                status: "completed",
                result_image_path: outputPath,
                completed_at: new Date().toISOString(),
            })
            .eq("id", imageId)
            .eq("status", "processing")
            .select("id")
            .maybeSingle();
        if (result.error) {
            return { data: null, error: result.error };
        }
        return { data: result.data?.id ?? null, error: null };
    }

    // 翻译重试，将failed图片重新标记为pending
    async markImagesFromFailedToPending(imageIds: string[], retryCount: number): Promise<Result<string[]>> {
        const result = await this.supabase.from("translation_images")
            .update(
                {
                    status: "pending",
                    error_message: null,
                    retry_count: retryCount,
                }
            )
            .in("id", imageIds)
            .eq("status", "failed")
            .eq("retry_count", retryCount - 1)
            .select("id");
        if (result.error) {
            return { data: null, error: result.error };
        }
        return { data: result.data.map((value) => value.id), error: null };
    }
}
