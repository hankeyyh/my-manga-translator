import type { SupabaseClient } from '@supabase/supabase-js';
import { CreateImageParams, TranslationImage, UpdateImageParams } from '../services/translate/translation-types';
import type { Json, Tables, TablesInsert, TablesUpdate } from '../supabase/database';
import { Result } from '../types';
import { mapTranslationImageRowToTranslationImage } from './common';

export class TranslationImageRepository {
    constructor(private supabase: SupabaseClient) { }

    /**
   * 创建单张图片记录
   */
    async createImage(params: CreateImageParams): Promise<Result<TranslationImage>> {
        const insertData: TablesInsert<'translation_images'> = {
            task_id: params.taskId,
            image_index: params.imageIndex,
            status: 'pending',
            original_image_path: params.originalImagePath,
            original_image_size: params.originalImageSize,
            original_image_width: params.originalImageWidth,
            original_image_height: params.originalImageHeight,
        };

        const { data, error } = await this.supabase
            .from('translation_images')
            .insert(insertData)
            .select()
            .single();

        if (error) {
            return {
                data: null,
                error: new Error(`创建图片记录失败: ${error.message}`),
            };
        }
        if (!data) {
            return {
                data: null,
                error: new Error('创建图片记录失败: 未返回图片数据'),
            };
        }

        return {
            data: mapTranslationImageRowToTranslationImage(data),
            error: null,
        };
    }

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
            task_id: param.taskId,
            image_index: param.imageIndex,
            status: 'pending',
            original_image_path: param.originalImagePath,
            original_image_size: param.originalImageSize,
            original_image_width: param.originalImageWidth,
            original_image_height: param.originalImageHeight,
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
            }
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
   * 获取任务的所有图片
   */
    async getImagesByTask(taskId: string): Promise<Result<TranslationImage[]>> {
        const { data, error } = await this.supabase
            .from('translation_images')
            .select('*')
            .eq('task_id', taskId)
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
            .eq('status', 'failed')
            .order('created_at', { ascending: true });

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

    /**
   * 删除图片
   */
    async deleteImage(imageId: string): Promise<Result<void>> {
        const { error } = await this.supabase
            .from('translation_images')
            .delete()
            .eq('id', imageId);

        if (error) {
            return {
                data: null,
                error: new Error(`删除图片失败: ${error.message}`),
            };
        }
        return {
            data: null,
            error: null,
        };
    }
}