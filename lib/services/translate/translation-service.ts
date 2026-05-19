import { BizResult, CHECK_PARAM_ERROR_CODE, DB_ERROR_CODE, LOGIC_ERROR_CODE, Result, SUCCESS_CODE, UNAUTHORIZED_ERROR_CODE } from "@/types/do/common";
import { TranslationImage } from "@/types/do/translation-image";
import { TranslationConfig } from "@/types/do/translation-config";
import { getBaseUrl } from "@/lib/utils/url";
import { TranslationTaskRepository } from "@/lib/repositories/translate/translation-task";
import { CreateImageParams, TranslationImageRepository } from "@/lib/repositories/translate/translation-image";
import { TranslationStorageRepository } from "@/lib/repositories/translate/translation-storage";
import { UserRepository } from "@/lib/repositories/auth/user-repository";
import { TranslationTaskDetailView } from "@/types/dto/translation-task";
import { TranslationImageView } from "@/types/dto/translation-image";
import { sleep } from "@/lib/utils/sleep";

const MAX_TRANSLATION_RETRIES = 3;
const RESULT_CHECK_INTERVAL = 10000; // 10 秒检查一次结果
const RESULT_CHECK_TIMEOUT = 300000; // 5 分钟超时

export class TranslationService {

    constructor(private userRepo: UserRepository,
        private taskRepo: TranslationTaskRepository,
        private imageRepo: TranslationImageRepository,
        private imageStorage: TranslationStorageRepository) { }

    // 提交任务
    async submitTranslationTask(images: File[], config: TranslationConfig): Promise<BizResult<string>> {
        // 参数检查
        if (!images || images.length === 0) {
            return { code: CHECK_PARAM_ERROR_CODE, data: null, error: new Error('No images provided') };
        }
        for (const image of images) {
            if (image.size > 10 * 1024 * 1024) {
                return { code: CHECK_PARAM_ERROR_CODE, data: null, error: new Error('Image size too large, max size is 10MB') };
            }
        }
        // 1. 获取当前用户
        const userResult = await this.userRepo.getCurrentUser();
        if (userResult.error) {
            return { code: UNAUTHORIZED_ERROR_CODE, data: null, error: userResult.error };
        }
        const user = userResult.data!;

        // 2. 创建任务
        const taskResult = await this.taskRepo.createTask({
            userId: user.id,
            totalImages: images.length,
            config,
        });
        if (taskResult.error) {
            return { code: DB_ERROR_CODE, data: null, error: taskResult.error };
        }
        const task = taskResult.data!;

        // 3. 上传图片
        const createImageParams: CreateImageParams[] = [];
        for (let i = 0; i < images.length; i++) {
            const uploadResult = await this.imageStorage.uploadOriginalImage(user.id, task.id, i, images[i]);
            if (uploadResult.error) {
                console.error("submitTranslationTask, uploadOriginalImage failed, error: ", uploadResult.error);
                return { code: DB_ERROR_CODE, data: null, error: uploadResult.error };
            }
            const originalPath = uploadResult.data!;
            createImageParams.push({
                taskId: task.id,
                filename: images[i].name,
                imageIndex: i,
                originalImagePath: originalPath,
                originalImageSize: images[i].size,
                originalImageWidth: 0,
                originalImageHeight: 0,
            });
        }

        // 4. 保存图片
        const imageResult = await this.imageRepo.createImages(createImageParams);
        if (imageResult.error) {
            return { code: DB_ERROR_CODE, data: null, error: imageResult.error };
        }

        return { code: SUCCESS_CODE, data: task.id, error: null };
    }

    // 任务详情
    async getTranslationTaskDetail(taskId: string): Promise<BizResult<TranslationTaskDetailView>> {
        // 获取当前用户
        const userResult = await this.userRepo.getCurrentUser();
        if (userResult.error) {
            return { code: UNAUTHORIZED_ERROR_CODE, data: null, error: userResult.error };
        }
        const user = userResult.data!;
        // 获取任务详情
        const taskResult = await this.taskRepo.getTaskWithImages(taskId);
        if (taskResult.error) {
            return { code: DB_ERROR_CODE, data: null, error: taskResult.error };
        }
        const taskDetail = taskResult.data!;
        if (taskDetail.userId !== user.id) {
            return { code: UNAUTHORIZED_ERROR_CODE, data: null, error: new Error("Task not belonged") };
        }
        // 生成原图签名url
        const originalImagePaths = taskDetail.images.map((img) => img.originalImagePath);
        const originalUrlsResult = await this.imageStorage.createSignedUrls(originalImagePaths, 3600);
        if (originalUrlsResult.error) {
            console.error('❌ Failed to create signed URLs:', originalUrlsResult.error);
            return { code: DB_ERROR_CODE, data: null, error: originalUrlsResult.error };
        }
        const originalSignedUrls = originalUrlsResult.data!;
        // 生成翻译图签名url
        const resultSignedUrls: string[] = taskDetail.images.map(() => '');
        const resultPathsToSign: string[] = [];
        const resultPathIndices: number[] = [];
        taskDetail.images.forEach((img, i) => {
            if (img.resultImagePath) {
                resultPathsToSign.push(img.resultImagePath);
                resultPathIndices.push(i);
            }
        });
        if (resultPathsToSign.length > 0) {
            const resultUrlResult = await this.imageStorage.createSignedUrls(resultPathsToSign, 3600);
            if (resultUrlResult.error) {
                console.error("getTranslationTaskDetail, createSignedUrls failed, error: ", resultUrlResult.error);
                return { code: DB_ERROR_CODE, data: null, error: resultUrlResult.error };
            }
            const signedResultUrls = resultUrlResult.data!;
            resultPathIndices.forEach((imageIndex, j) => {
                resultSignedUrls[imageIndex] = signedResultUrls[j] ?? '';
            });
        }
        // 组装数据
        const images = taskDetail.images.map((img, i): TranslationImageView => (
            {
                ...img,
                originalImageUrl: originalSignedUrls[i],
                resultImageUrl: resultSignedUrls[i],
            }
        ));
        const taskDetailView: TranslationTaskDetailView = {
            ...taskDetail,
            images,
        };

        return {
            code: SUCCESS_CODE, data: taskDetailView, error: null
        };
    }

    // 用户翻译历史
    async getUserTranslationHistory(): Promise<BizResult<TranslationImageView[]>> {
        // 1. 获取当前用户
        const userResult = await this.userRepo.getCurrentUser();
        if (userResult.error) {
            return { code: UNAUTHORIZED_ERROR_CODE, data: null, error: userResult.error };
        }
        const user = userResult.data!;
        // 2. 获取历史图片
        const historyResult = await this.imageRepo.getUserCompletedImages(user.id);
        if (historyResult.error) {
            return { code: DB_ERROR_CODE, data: null, error: historyResult.error };
        }
        const historyImages = historyResult.data!;
        if (historyImages.length === 0) {
            return { code: SUCCESS_CODE, data: [], error: null };
        }
        const originalImagePaths = historyImages.map((img) => img.originalImagePath);
        const resultImagePaths = historyImages.map((img) => img.resultImagePath!);

        // 3. 创建原图签名 URL
        const originalUrlResult = await this.imageStorage.createSignedUrls(originalImagePaths, 3600);
        if (originalUrlResult.error) {
            console.error("getUserTranslationHistory, createSignedUrls failed, error: ", originalUrlResult.error);
            return { code: DB_ERROR_CODE, data: null, error: originalUrlResult.error };
        }
        const originalUrls = originalUrlResult.data!;
        // 4. 生成翻译图签名 URL
        const resultUrlResult = await this.imageStorage.createSignedUrls(resultImagePaths, 3600);
        if (resultUrlResult.error) {
            console.error("getUserTranslationHistory, createSignedUrls failed, error: ", resultUrlResult.error);
            return { code: DB_ERROR_CODE, data: null, error: resultUrlResult.error };
        }
        const resultUrls = resultUrlResult.data!;

        // 5. 组装数据
        const images = historyImages.map((img, i): TranslationImageView => {
            return {
                ...img,
                originalImageUrl: originalUrls[i],
                resultImageUrl: resultUrls[i],
            };
        });

        return { code: SUCCESS_CODE, data: images, error: null };
    }

    // 实际翻译图片
    async translateImage(imageId: string) {
        console.log(`📝 Processing image: ${imageId}`);
        // 1. 获取图片详情
        const imageResult = await this.imageRepo.getImage(imageId);
        if (imageResult.error) {
            console.error('❌ Failed to get image:', imageResult.error);
            return;
        }
        const image = imageResult.data!;

        // 2. 更新图片状态为 processing (触发器会自动更新任务状态)
        const updateImageStatusResult = await this.imageRepo.updateImage(imageId, {
            status: 'processing',
            startedAt: new Date().toISOString(),
        });
        if (updateImageStatusResult.error) {
            console.error('❌ Failed to update image status:', updateImageStatusResult.error);
            return;
        }

        // 3. 获取任务配置 (从图片关联的任务获取)
        const taskResult = await this.taskRepo.getTask(image.taskId);
        if (taskResult.error) {
            console.error('❌ Failed to get task:', taskResult.error);
            await this.handleTranslateImageFailed(imageId, `Failed to get task: ${taskResult.error.message}`);
            return;
        }
        const task = taskResult.data!;
        const config = task.config;

        // 4. 下载原始图片
        const downloadOriginalImageResult = await this.imageStorage.downloadFile(image.originalImagePath);
        if (downloadOriginalImageResult.error) {
            console.error('❌ Failed to download original image:', downloadOriginalImageResult.error);
            await this.handleTranslateImageFailed(imageId, `Failed to download original image: ${downloadOriginalImageResult.error.message}`);
            return;
        }
        const originalImage = downloadOriginalImageResult.data!;
        console.debug("originalImage:", originalImage);

        // 5. 提交到 Modal 服务
        const submitResult = await this.submitTranslation(originalImage, config);
        if (submitResult.error) {
            console.error('❌ Failed to submit translation:', submitResult.error);
            await this.handleTranslateImageFailed(imageId, `Failed to submit translation: ${submitResult.error.message}`);
            return;
        }
        const folderName = submitResult.data?.folderName!;
        console.debug("algo server folderName:", folderName);

        // 6. 更新 folderName
        const updateFolderNameResult = await this.imageRepo.updateImage(imageId, {
            folderName: folderName,
        });
        if (updateFolderNameResult.error) {
            console.error('❌ Failed to update folder name:', updateFolderNameResult.error);
            await this.handleTranslateImageFailed(imageId, `Failed to update folder name: ${updateFolderNameResult.error.message}`);
            return;
        }

        // 7. 等待翻译完成
        const isReady = await this.waitForResult(folderName);
        if (!isReady) {
            console.error('❌ Translation timeout:', this.getResultUrl(folderName));
            await this.handleTranslateImageFailed(imageId, `Translation timeout: ${this.getResultUrl(folderName)}`);
            return;
        }

        // 8.下载翻译图片
        const translatedImageResult = await this.downloadResult(folderName);
        if (translatedImageResult.error) {
            console.error('❌ Failed to download translated image:', this.getResultUrl(folderName), ", error:", translatedImageResult.error);
            await this.handleTranslateImageFailed(imageId, `Failed to download translated image: ${this.getResultUrl(folderName)}`);
            return;
        }
        const translatedImage = translatedImageResult.data!;

        // 9. 上传到 Supabase Storage
        const uploadResultImageResult = await this.imageStorage.uploadResultImage(task.userId, task.id, image.imageIndex, translatedImage);
        if (uploadResultImageResult.error) {
            console.error('❌ Failed to upload translated image:', this.getResultUrl(folderName), ", error:", uploadResultImageResult.error);
            await this.handleTranslateImageFailed(imageId, `Failed to upload translated image: ${uploadResultImageResult.error.message}`);
            return;
        }
        const resultImagePath = uploadResultImageResult.data!;

        // 10. 更新图片状态为 completed (触发器会自动更新任务进度)
        const updateResultImageResult = await this.imageRepo.updateImage(imageId, {
            status: 'completed',
            resultImagePath: resultImagePath,
            completedAt: new Date().toISOString(),
        });
        if (updateResultImageResult.error) {
            console.error('❌ Failed to update image status:', updateResultImageResult.error);
            await this.handleTranslateImageFailed(imageId, `Failed to update image result: ${updateResultImageResult.error.message}`);
            return;
        }
        console.log(`✅ Image ${imageId} processed successfully`);

        return;
    }

    // 等待翻译结果就绪
    private async waitForResult(folderName: string): Promise<boolean> {
        let startTime = Date.now();
        while (Date.now() - startTime < RESULT_CHECK_TIMEOUT) {
            const isReady = await this.checkResultReady(folderName);
            if (isReady) {
                return true;
            }
            await sleep(RESULT_CHECK_INTERVAL);
        }
        return false;
    }

    // 处理翻译失败的图片
    private async handleTranslateImageFailed(imageId: string, errMessage: string) {
        const imageResult = await this.imageRepo.getImage(imageId);
        if (imageResult.error) {
            console.error("handleTranslateImageFailed, Failed to get image, error: ", imageResult.error);
            return;
        }
        const image = imageResult.data!;

        const retryCount = this.getImageRetryCount(image);
        const shouldRetry = retryCount < MAX_TRANSLATION_RETRIES;
        const status = shouldRetry ? 'pending' : 'failed';
        const updateImageResult = await this.imageRepo.updateImage(imageId, {
            status: status,
            errorMessage: errMessage,
            retryCount: retryCount,
        });
        if (updateImageResult.error) {
            console.error('handleTranslateImageFailed, Failed to update image:', updateImageResult.error);
            return;
        }
    }

    // 获取pending图片
    async getPendingImages(limit: number): Promise<BizResult<TranslationImage[]>> {
        const result = await this.imageRepo.getPendingImages(limit);
        if (result.error) {
            console.error("getPendingImages failed, error: ", result.error);
            return { code: DB_ERROR_CODE, data: null, error: result.error };
        }
        return { code: SUCCESS_CODE, data: result.data!, error: null };
    }

    // 重置超时的图片
    async resetStuckImages() {
        // 处理超过10m的图片
        const stuckImagesResult = await this.imageRepo.getStuckImages(10);
        if (stuckImagesResult.error) {
            console.error('❌ Failed to get stuck images:', stuckImagesResult.error);
            return;
        }
        const stuckImages = stuckImagesResult.data!;
        for (const image of stuckImages) {
            await this.handleTranslateImageFailed(image.id, `Image stuck for too long`);
        }
    }

    // 调用模型翻译服务
    async submitTranslation(imageBlob: Blob, config: TranslationConfig): Promise<Result<{ folderName: string; }>> {
        const formData = new FormData();
        formData.append('image', imageBlob);
        formData.append('config', JSON.stringify(config));
        const baseUrl = getBaseUrl();

        const response = await fetch(
            `${baseUrl}/translate/with-form/image/stream/web`,
            {
                method: 'POST',
                body: formData,
            }
        );

        if (!response.ok) {
            console.error('❌ submitTranslation error:', response.statusText);
            return {
                data: null,
                error: new Error(`Translation API error: ${response.statusText}`),
            };
        }

        // 解析流式响应获取 folderName
        const folderName = await this.parseFolderNameFromStream(response);
        if (!folderName) {
            console.error("submitTranslation, parseFolderNameFromStream failed, folderName not found");
            return {
                data: null,
                error: new Error('Folder name not found'),
            };
        }

        return {
            data: { folderName },
            error: null,
        };
    }

    /**
   * 从流式响应中解析 folderName
   * 注意: 这个实现需要根据实际的响应格式调整
   */
    private extractFolderNameFromProgressText(text: string): string {
        // 后端会发送类似:
        // - rendering_folder:<folderName>
        // - final_ready:<folderName>
        // 兼容历史可能的 folder_name/folder-name 形式。
        const patterns = [
            /(?:rendering_folder|final_ready)\s*:\s*([a-zA-Z0-9_-]+)/i,
            /folder[_-]?name["\s:]+([a-zA-Z0-9_-]+)/i,
        ];
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match?.[1]) return match[1];
        }
        return "";
    }

    private async parseFolderNameFromStream(response: Response): Promise<string> {
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        let folderName = '';
        let buffer: Uint8Array<ArrayBufferLike> = new Uint8Array(0);
        const decoder = new TextDecoder();

        const concatUint8Array = (
            a: Uint8Array<ArrayBufferLike>,
            b: Uint8Array<ArrayBufferLike>
        ): Uint8Array<ArrayBufferLike> => {
            const merged = new Uint8Array(a.length + b.length);
            merged.set(a, 0);
            merged.set(b, a.length);
            return merged;
        };

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                if (!value || value.length === 0) continue;

                // 解析流式数据: [1 byte status][4 bytes size][n bytes data]
                // 注意：一个 chunk 可能包含多个包，也可能是半包，需要缓存并拼包。
                buffer = concatUint8Array(buffer, value);

                while (buffer.length >= 5) {
                    const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
                    const status = buffer[0];
                    const size = view.getUint32(1, false); // big-endian
                    const frameSize = 5 + size;

                    if (buffer.length < frameSize) break;

                    const data = buffer.slice(5, frameSize);
                    buffer = buffer.slice(frameSize);

                    if (status === 1) {
                        // 进度消息里可能包含 folder 名称。
                        const text = decoder.decode(data);
                        const extracted = this.extractFolderNameFromProgressText(text);
                        if (extracted) {
                            folderName = extracted;
                            // 已拿到 folderName，无需继续解析后续流
                            return folderName;
                        }
                    } else if (status === 2) {
                        const errorMsg = decoder.decode(data);
                        console.error("error:", errorMsg);
                        throw new Error(errorMsg);
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }

        // 如果无法从流中解析,尝试从响应头获取
        if (!folderName) {
            console.debug("response.headers:", response.headers);
            folderName = response.headers.get('X-Result-Folder') ||
                response.headers.get('X-Folder-Name') || '';
        }

        return folderName;
    }

    // 检查翻译结果是否就绪
    async checkResultReady(folderName: string): Promise<boolean> {
        try {
            const response = await fetch(
                this.getResultUrl(folderName),
                { method: 'HEAD' }
            );
            return response.ok;
        } catch (error) {
            console.error('❌ checkResultReady error:', error);
            return false;
        }
    }

    // 获取翻译结果图片 URL
    getResultUrl(folderName: string): string {
        const baseUrl = getBaseUrl();
        return `${baseUrl}/result/${folderName}/final.png`;
    }

    // 下载翻译结果
    async downloadResult(folderName: string): Promise<Result<Blob>> {
        const response = await fetch(this.getResultUrl(folderName));

        if (!response.ok) {
            console.error("downloadResult, fetch result image failed, statusText: ", response.statusText);
            return {
                data: null,
                error: new Error(`Failed to download result: ${response.statusText}`),
            };
        }

        return {
            data: await response.blob(),
            error: null,
        };
    }

    getImageRetryCount(image: TranslationImage): number {
        return Math.min((image.retryCount || 0) + 1, MAX_TRANSLATION_RETRIES);
    }
}