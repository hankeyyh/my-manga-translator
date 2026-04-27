import type { SupabaseClient } from '@supabase/supabase-js';
import { getFileExtension } from '../utils';
import { Result } from '../types';

export class TranslationStorageRepository {
    private bucketName = 'translation_storage';

    constructor(private supabase: SupabaseClient) { }

    /**
     * 上传原始图片
     * return: path 图片路径。访问需要通过 supabase.createSignedUrl(path) 获取签名 URL
     */
    async uploadOriginalImage(userId: string, taskId: string, imageIdx: number, image: File): Promise<Result<string>> {
        const extension = getFileExtension(image) ?? 'jpg';
        const fileName = `${userId}/${taskId}/${imageIdx}-original.${extension}`;

        const { data, error } = await this.supabase.storage
            .from(this.bucketName)
            .upload(fileName, image, {
                cacheControl: '3600',
                upsert: false,
                contentType: image.type,
            });

        if (error) {
            return {
                data: null,
                error: new Error(`Failed to upload image: ${error.message}`),
            };
        }

        return {
            data: data.path,
            error: null,
        };
    }

    /**
   * 上传翻译结果图片
   */
    async uploadResultImage(userId: string, taskId: string, imageIdx: number, resultBlob: Blob): Promise<Result<string>> {
        const fileName = `${userId}/${taskId}/${imageIdx}-result.png`;

        const { data, error } = await this.supabase.storage
            .from(this.bucketName)
            .upload(fileName, resultBlob, {
                cacheControl: '3600',
                upsert: false,
                contentType: 'image/png',
            });

        if (error) {
            return {
                data: null,
                error: new Error(`Failed to upload result: ${error.message}`),
            };
        }

        return {
            data: data.path,
            error: null,
        };
    }

    /**
     * 下载文件
     */
    async downloadFile(filePath: string): Promise<Result<Blob>> {
        const { data, error } = await this.supabase.storage
            .from(this.bucketName)
            .download(filePath);

        if (error) {
            return {
                data: null,
                error: new Error(`Failed to download file: ${error.message}`),
            };
        }

        return {
            data: data,
            error: null,
        };
    }

    /**
   * 删除文件，仅管理员能操作
   */
    async deleteFiles(filePaths: string[]): Promise<Result<void>> {
        const { error } = await this.supabase.storage
            .from(this.bucketName)
            .remove(filePaths);

        if (error) {
            return {
                data: null,
                error: new Error(`Failed to delete file: ${error.message}`),
            };
        }
        return {
            data: null,
            error: null,
        };
    }

    /**
   * 创建签名 URLs
   */
    async createSignedUrls(filePaths: string[], expiresIn: number): Promise<Result<string[]>> {
        const { data, error } = await this.supabase.storage
            .from(this.bucketName)
            .createSignedUrls(filePaths, expiresIn);

        if (error) {
            return {
                data: null,
                error: new Error(`Failed to create signed URLs: ${error.message}`),
            };
        }

        return {
            data: data.map((item) => item.signedUrl),
            error: null,
        };
    }
}