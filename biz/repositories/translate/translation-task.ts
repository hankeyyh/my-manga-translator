import type { SupabaseClient } from '@supabase/supabase-js';
import type { TranslationTaskDetail } from "@/types/do/translation-task";
import type { TaskStatus, TranslationTask } from "@/types/do/translation-task";
import type { Json, Tables, TablesInsert, TablesUpdate } from '@/types/database';
import { Result } from "@/types/do/response";
import { mapTranslationImageRowToTranslationImage } from "./translation-image";
import { TranslationConfig } from '@/types/do/translation-config';

export function mapTranslationTaskRowToTranslationTask(data: Tables<'translation_tasks'>): TranslationTask {
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

        creditPerImage: data.credit_per_image,
        totalCredits: data.total_credits,

    };
}

// 创建任务参数
export interface CreateTaskParams {
    id?: string;
    userId: string;
    totalImages: number;
    creditPerImage: number;
    config: TranslationConfig;
}

// 更新任务参数 (很少使用,因为有触发器自动更新)
export interface UpdateTaskParams {
    status?: TaskStatus;
    progress?: number;
    totalImages?: number;
    completedImages?: number;
    failedImages?: number;
    startedAt?: string;
    completedAt?: string;
    metadata?: Record<string, any>;
}

export class TranslationTaskRepository {
    constructor(private supabase: SupabaseClient) { }

    /**
   * 创建翻译任务
   */
    async createTask(params: CreateTaskParams): Promise<Result<TranslationTask>> {
        const insertData: TablesInsert<'translation_tasks'> = {
            ...(params.id && { id: params.id }), // 如果传入id，则显示设置
            user_id: params.userId,
            status: 'pending',
            total_images: params.totalImages,
            completed_images: 0,
            failed_images: 0,
            progress: 0,
            config: params.config as Json,
            credit_per_image: params.creditPerImage,
            total_credits: params.creditPerImage * params.totalImages,
        };

        const { data, error } = await this.supabase
            .from('translation_tasks')
            .insert(insertData)
            .select()
            .single();

        if (error) {
            return {
                data: null,
                error: new Error(`创建翻译任务失败: ${error.message}`),
            };
        }

        if (!data) {
            return {
                data: null,
                error: new Error('创建翻译任务失败: 未返回任务数据'),
            };
        }

        return {
            data: mapTranslationTaskRowToTranslationTask(data),
            error: null,
        };
    }

    /**
     * 获取任务详情 (不含图片列表)
     */
    async getTask(taskId: string): Promise<Result<TranslationTask>> {
        const { data, error } = await this.supabase
            .from('translation_tasks')
            .select('*')
            .eq('id', taskId)
            .single();

        if (error) {
            return {
                data: null,
                error: new Error(`获取任务详情失败: ${error.message}`),
            };
        }
        if (!data) {
            return {
                data: null,
                error: new Error('获取任务详情失败: 未返回任务数据'),
            };
        }

        return {
            data: mapTranslationTaskRowToTranslationTask(data),
            error: null,
        };
    }

    /**
     * 批量获取任务详情 (不含图片列表)
     */
    async batchGetTask(taskIds: string[]): Promise<Result<TranslationTask[]>> {
        if (taskIds.length === 0) {
            return { data: null, error: null };
        }
        const { data, error } = await this.supabase
            .from('translation_tasks')
            .select()
            .in('id', taskIds);
        if (error) {
            return {
                data: null, 
                error: new Error(`批量获取任务详情失败：${error.message}`),
            };
        }
        if (!data || data.length === 0) {
            return {
                data: null, 
                error: null,
            }
        }
        return {
            data: data.map(mapTranslationTaskRowToTranslationTask),
            error: null,
        }
    }

    /**
   * 获取任务详情 (含图片列表)
   */
    async getTaskWithImages(taskId: string): Promise<Result<TranslationTaskDetail>> {
        const { data, error } = await this.supabase
            .from('translation_tasks')
            .select('*, translation_images(*)')
            .eq('id', taskId)
            .single();

        if (error) {
            return {
                data: null,
                error: new Error(`获取任务详情失败: ${error.message}`),
            };
        }
        if (!data) {
            return {
                data: null,
                error: new Error('获取任务详情失败: 未返回任务数据'),
            };
        }

        return {
            data: {
                ...mapTranslationTaskRowToTranslationTask(data),
                images: data.translation_images.map(mapTranslationImageRowToTranslationImage),
            },
            error: null,
        };
    }

    /**
     * 更新任务
     */
    async updateTask(taskId: string, params: UpdateTaskParams): Promise<Result<void>> {
        const updateData: TablesUpdate<'translation_tasks'> = {};

        if (params.status !== undefined) {
            updateData.status = params.status;
        }
        if (params.progress !== undefined) {
            updateData.progress = params.progress;
        }
        if (params.totalImages !== undefined) {
            updateData.total_images = params.totalImages;
        }
        if (params.completedImages !== undefined) {
            updateData.completed_images = params.completedImages;
        }
        if (params.failedImages !== undefined) {
            updateData.failed_images = params.failedImages;
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
            .from('translation_tasks')
            .update(updateData)
            .eq('id', taskId);

        if (error) {
            return {
                data: null,
                error: new Error(`更新任务失败: ${error.message}`),
            };
        }
        return {
            data: null,
            error: null,
        };
    }

    /**
   * 获取用户的任务列表
   */
    async getUserTasks(userId: string, status?: TaskStatus, limit: number = 50): Promise<Result<TranslationTask[]>> {
        let query = this.supabase
            .from('translation_tasks')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) {
            return {
                data: null,
                error: new Error(`获取用户任务列表失败: ${error.message}`),
            };
        }

        if (!data || data.length === 0) {
            return {
                data: [],
                error: null,
            };
        }

        return {
            data: data.map((task) => mapTranslationTaskRowToTranslationTask(task)),
            error: null,
        };
    }

    /**
   * 删除任务 (级联删除图片)
   */
    async deleteTask(taskId: string): Promise<Result<void>> {
        const { error } = await this.supabase
            .from('translation_tasks')
            .delete()
            .eq('id', taskId);

        if (error) {
            return {
                data: null,
                error: new Error(`删除任务失败: ${error.message}`),
            };
        }
        return {
            data: null,
            error: null,
        };
    }
}


