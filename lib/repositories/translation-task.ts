import type { SupabaseClient } from '@supabase/supabase-js';
import type { CreateTaskParams, TaskStatus, TranslationImage, TranslationTask, TranslationTaskDetail, UpdateTaskParams } from '@/lib/services/translate/translation-types';
import type { Json, TablesInsert, TablesUpdate } from '@/lib/supabase/database';
import { Result } from '../types';
import { mapTranslationImageRowToTranslationImage, mapTranslationTaskRowToTranslationTask } from './common';

export class TranslationTaskRepository {
    constructor(private supabase: SupabaseClient) { }

    /**
   * 创建翻译任务
   */
    async createTask(params: CreateTaskParams): Promise<Result<TranslationTask>> {
        const insertData: TablesInsert<'translation_tasks'> = {
            user_id: params.userId,
            status: 'pending',
            total_images: params.totalImages,
            completed_images: 0,
            failed_images: 0,
            progress: 0,
            config: params.config as Json,
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