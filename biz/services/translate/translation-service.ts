import { CHECK_PARAM_ERROR_CODE, DB_ERROR_CODE, LOGIC_ERROR_CODE, NETWORK_ERROR_CODE, REMOTE_LOGIC_ERROR_CODE, SUCCESS_CODE, UNAUTHORIZED_ERROR_CODE } from "@/types/dto/response";
import { Result } from "@/types/do/response";
import { BizResult } from "@/types/dto/response";
import { ImageStatus, TranslationImage } from "@/types/do/translation-image";
import { TranslationConfig } from "@/types/do/translation-config";
import { getAlgoBaseUrl } from "@/biz/utils/url";
import { TranslationTaskRepository } from "@/biz/repositories/translate/translation-task";
import { CreateImageParams, TranslationImageRepository } from "@/biz/repositories/translate/translation-image";
import { TranslationStorageRepository } from "@/biz/repositories/translate/translation-storage";
import { UserRepository } from "@/biz/repositories/auth/user-repository";
import { TranslationTaskDetailView } from "@/types/dto/translation-task";
import { TranslateImageFailedResult, TranslateImageSuccessResult, TranslationImageView } from "@/types/dto/translation-image";
import { PricingConfigRepository } from "@/biz/repositories/pricing/pricing-config";

const MAX_TRANSLATION_RETRIES = 3;
const RESULT_CHECK_INTERVAL = 10000; // 10 秒检查一次结果
const RESULT_CHECK_TIMEOUT = 300000; // 5 分钟超时

export class TranslationService {

    constructor(private userRepo: UserRepository,
        private taskRepo: TranslationTaskRepository,
        private imageRepo: TranslationImageRepository,
        private imageStorage: TranslationStorageRepository,
        private pricingConfigRepo: PricingConfigRepository) { }

    // 提交任务
    async submitTranslationTask(taskId: string, images: File[], config: TranslationConfig): Promise<BizResult<string>> {
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
            console.error(`submitTranslationTask, repo.getCurrentUser fail, error: ${userResult.error.message}`);
            return { code: UNAUTHORIZED_ERROR_CODE, data: null, error: userResult.error };
        }
        const user = userResult.data!;

        // 2. 获取价格配置
        const pricingResult = await this.pricingConfigRepo.getPricingConfigByModel(config.translator?.model_name ?? "");
        if (pricingResult.error) {
            console.error(`submitTranslationTask, repo.getPricingConfigByModel fail, error: ${pricingResult.error.message}`);
            return { code: DB_ERROR_CODE, data: null, error: pricingResult.error };
        }
        // 3. 创建任务
        const taskResult = await this.taskRepo.createTask({
            id: taskId,
            userId: user.id,
            totalImages: images.length,
            creditPerImage: pricingResult.data?.creditPerImage!,
            config,
        });
        if (taskResult.error) {
            console.error(`submitTranslationTask, repo.createTask fail, error: ${taskResult.error.message}`);
            return { code: DB_ERROR_CODE, data: null, error: taskResult.error };
        }
        const task = taskResult.data!;

        // 4. 上传图片
        const createImageParams: CreateImageParams[] = [];
        for (let i = 0; i < images.length; i++) {
            const uploadResult = await this.imageStorage.uploadOriginalImage(user.id, task.id, i, images[i]);
            if (uploadResult.error) {
                console.error("submitTranslationTask, uploadOriginalImage failed, error: ", uploadResult.error.message);
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
                credits: pricingResult.data?.creditPerImage!,
            });
        }

        // 4. 保存图片
        const imageResult = await this.imageRepo.createImages(createImageParams);
        if (imageResult.error) {
            console.error(`submitTranslationTask, repo.createImages failed, error: ${imageResult.error.message}`);
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
    async translateImage(imageId: string): Promise<BizResult<TranslateImageSuccessResult | TranslateImageFailedResult>> {
        console.log(`📝 Processing image: ${imageId}`);
        // 1. 获取图片详情
        const imageResult = await this.imageRepo.getImage(imageId);
        if (imageResult.error) {
            console.error('❌ Failed to get image:', imageResult.error);
            return {
                code: DB_ERROR_CODE,
                data: {
                    userId: "",
                    taskId: "",
                    imageId: imageId,
                    needRefund: false, // image状态仍为pending，下一轮重试 
                    refundCredits: 0,
                },
                error: imageResult.error
            };
        }
        const image = imageResult.data!;

        // 2. 更新图片状态为 processing (触发器会自动更新任务状态)
        const updateImageStatusResult = await this.imageRepo.updateImage(imageId, {
            status: 'processing',
            startedAt: new Date().toISOString(),
        });
        if (updateImageStatusResult.error) {
            console.error('❌ Failed to update image status:', updateImageStatusResult.error);
            return {
                code: DB_ERROR_CODE,
                data: {
                    userId: "",
                    taskId: "",
                    imageId: imageId,
                    needRefund: false, // image状态仍为pending，下一轮重试 
                    refundCredits: 0,
                },
                error: updateImageStatusResult.error
            };
        }

        // 3. 获取任务配置 (从图片关联的任务获取)
        const taskResult = await this.taskRepo.getTask(image.taskId);
        if (taskResult.error) {
            console.error('❌ Failed to get task:', taskResult.error);
            const handleResult = await this.handleTranslateImageFailed(imageId, `Failed to get task: ${taskResult.error.message}`);
            const shouldRetry = handleResult.data!;
            return {
                code: DB_ERROR_CODE,
                data: {
                    userId: "", // TODO 没有task就不知道userId，怎么做？
                    taskId: image.taskId,
                    imageId: imageId,
                    needRefund: !shouldRetry,
                    refundCredits: 0,
                },
                error: taskResult.error
            };
        }
        const task = taskResult.data!;
        const config = task.config;

        const consumeCredits = image.credits;
        console.debug("consumeCredits: ", consumeCredits);

        // 4. 下载原始图片
        const downloadOriginalImageResult = await this.imageStorage.downloadFile(image.originalImagePath);
        if (downloadOriginalImageResult.error) {
            console.error('❌ Failed to download original image:', downloadOriginalImageResult.error);
            const handleResult = await this.handleTranslateImageFailed(imageId, `Failed to download original image: ${downloadOriginalImageResult.error.message}`);
            const shouldRetry = handleResult.data!;
            return {
                code: DB_ERROR_CODE,
                data: {
                    userId: task.userId,
                    taskId: task.id,
                    imageId: imageId,
                    needRefund: !shouldRetry,
                    refundCredits: consumeCredits,
                },
                error: downloadOriginalImageResult.error
            };
        }
        const originalImage = downloadOriginalImageResult.data!;
        console.debug("originalImage:", originalImage);

        // 5. 提交到 Modal 服务
        const submitResult = await this.submitTranslation(originalImage, config);
        if (submitResult.error) {
            console.error('❌ Failed to submit translation:', submitResult.error);
            const handleResult = await this.handleTranslateImageFailed(imageId, `Failed to submit translation: ${submitResult.error.message}`);
            const shouldRetry = handleResult.data!;
            return {
                code: submitResult.code,
                data: {
                    userId: task.userId,
                    taskId: task.id,
                    imageId: imageId,
                    needRefund: !shouldRetry,
                    refundCredits: consumeCredits,
                },
                error: submitResult.error
            };
        }
        const reader = submitResult.data!;

        // 6. 等待翻译完成
        const waitResult = await this.waitTranslationComplete(reader);
        if (waitResult.error) {
            console.error('❌ algo svr return error:', waitResult.error);
            const handleResult = await this.handleTranslateImageFailed(imageId, `Talgo svr return error:: ${waitResult.error}`);
            const shouldRetry = handleResult.data!;
            return {
                code: waitResult.code,
                data: {
                    userId: task.userId,
                    taskId: task.id,
                    imageId: imageId,
                    needRefund: !shouldRetry,
                    refundCredits: consumeCredits,
                },
                error: waitResult.error
            };
        }

        // 7. 上传到 Supabase Storage
        const uploadResultImageResult = await this.imageStorage.uploadResultImage(task.userId, task.id, image.imageIndex, waitResult.data!);
        if (uploadResultImageResult.error) {
            console.error("❌ Failed to upload translated image, error:", uploadResultImageResult.error);
            const handleResult = await this.handleTranslateImageFailed(imageId, `Failed to upload translated image: ${uploadResultImageResult.error.message}`);
            const shouldRetry = handleResult.data!;
            return {
                code: DB_ERROR_CODE,
                data: {
                    userId: task.userId,
                    taskId: task.id,
                    imageId: imageId,
                    needRefund: !shouldRetry,
                    refundCredits: consumeCredits,
                },
                error: uploadResultImageResult.error
            };
        }
        const resultImagePath = uploadResultImageResult.data!;

        // 8. 更新图片状态为 completed (触发器会自动更新任务进度)
        const updateResultImageResult = await this.imageRepo.updateImage(imageId, {
            status: 'completed',
            resultImagePath: resultImagePath,
            completedAt: new Date().toISOString(),
        });
        if (updateResultImageResult.error) {
            console.error('❌ Failed to update image status:', updateResultImageResult.error);
            const handleResult = await this.handleTranslateImageFailed(imageId, `Failed to update image result: ${updateResultImageResult.error.message}`);
            const shouldRetry = handleResult.data!;
            return {
                code: DB_ERROR_CODE,
                data: {
                    userId: task.userId,
                    taskId: task.id,
                    imageId: imageId,
                    needRefund: !shouldRetry,
                    refundCredits: consumeCredits,
                },
                error: updateResultImageResult.error
            };
        }
        console.log(`✅ Image ${imageId} processed successfully`);

        return {
            code: SUCCESS_CODE,
            data: {
                userId: task.userId,
                taskId: task.id,
                imageId: imageId,
                consumeCredits: consumeCredits,
            },
            error: null
        };
    }

    // 处理翻译失败的图片，
    // return: boolean 是否需要重试
    private async handleTranslateImageFailed(imageId: string, errMessage: string): Promise<BizResult<boolean>> {
        const imageResult = await this.imageRepo.getImage(imageId);
        if (imageResult.error) {
            console.error("handleTranslateImageFailed, Failed to get image, error: ", imageResult.error);
            // 此时image状态为processing，下一轮也无法取到重试，只能人工介入
            return { code: DB_ERROR_CODE, data: false, error: imageResult.error };
        }
        const image = imageResult.data!;

        const retryCount = this.computeImageRetryCount(image);
        const shouldRetry = retryCount < MAX_TRANSLATION_RETRIES;
        const status = shouldRetry ? 'pending' : 'failed';
        const updateImageResult = await this.imageRepo.updateImage(imageId, {
            status: status,
            errorMessage: errMessage,
            retryCount: retryCount,
        });
        if (updateImageResult.error) {
            console.error('handleTranslateImageFailed, Failed to update image:', updateImageResult.error);
            return { code: DB_ERROR_CODE, data: false, error: updateImageResult.error };
        }
        return { code: SUCCESS_CODE, data: shouldRetry, error: null };
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

    async submitTranslation(imageBlob: Blob, config: TranslationConfig): Promise<BizResult<ReadableStreamDefaultReader>> {
        const algoBaseUrl = getAlgoBaseUrl();
        try {
            const bodyData = new FormData();
            bodyData.append("image", imageBlob);
            bodyData.append("config", JSON.stringify(config));
            const response = await fetch(`${algoBaseUrl}/translate/with-form/image/stream`, {
                method: "POST",
                body: bodyData,
            });
            if (!response.ok) {
                console.error(`submitTranslation, fetch algo svr fail, error: ${response.statusText}`);
                return { code: NETWORK_ERROR_CODE, data: null, error: new Error("fetch algo svr fail") };
            }
            const reader = response.body?.getReader();
            if (!reader) {
                console.error("submitTranslation, no response body");
                return { code: NETWORK_ERROR_CODE, data: null, error: new Error("no response body") };
            }
            return { code: SUCCESS_CODE, data: reader, error: null };
        } catch (err) {
            console.error(`submitTranslation, fetch algo svr fail, error: ${err}`);
            return {
                code: NETWORK_ERROR_CODE,
                data: null,
                error: err instanceof Error ? err : new Error(String(err)),
            };
        }
    }

    async waitTranslationComplete(reader: ReadableStreamDefaultReader<Uint8Array<ArrayBuffer>>): Promise<BizResult<Blob>> {
        let buffer: Uint8Array<ArrayBuffer> = new Uint8Array();
        const textDecoder = new TextDecoder("utf-8");
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    // 不应该走到这里，通过协议status判断结束
                    return { code: LOGIC_ERROR_CODE, data: null, error: new Error("data not completed") };
                }
                if (!value || value.length === 0) {
                    continue;
                }
                // merge value
                buffer = this.mergeUint8Array(buffer, value);

                // 解析流式数据: [1 byte status][4 bytes size][n bytes data]
                while (buffer.byteLength >= 5) {
                    const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
                    const status = view.getUint8(0);
                    const dataSize = view.getUint32(1, false);
                    const frameSize = 5 + dataSize;
                    if (view.byteLength < frameSize) {
                        break;
                    }
                    // 当前完整数据
                    const data = buffer.slice(5, frameSize);
                    // buffer 剩下的数据属于下一轮
                    buffer = buffer.slice(frameSize);

                    // 处理数据包, status=0 正常返回; status=1 过程数据; status=2 异常报错; status=3 排队中; status=4 即将开始
                    if (status === 0) {
                        const blob = new Blob([data], { type: "image/png" });
                        return { code: SUCCESS_CODE, data: blob, error: null };
                    } else if (status === 1) {
                        const stateText = textDecoder.decode(data);
                        console.debug(`waitTranslationComplete, stateText: ${stateText}`);
                    } else if (status === 2) {
                        const errText = textDecoder.decode(data);
                        console.error(`waitTranslationComplete, algo svr return error: ${errText}`);
                        return { code: REMOTE_LOGIC_ERROR_CODE, data: null, error: new Error(errText) };
                    } else if (status === 3) {
                        const queuePos = textDecoder.decode(data);
                        console.debug(`waitTranslationComplete, waiting, queue pos: ${queuePos}`);
                    } else if (status === 4) {
                        console.debug("waitTranslationComplete, ready to start!");
                    }
                }
            }
        } finally {
            reader.cancel();
        }
    }

    mergeUint8Array(a: Uint8Array<ArrayBuffer>, b: Uint8Array<ArrayBuffer>): Uint8Array<ArrayBuffer> {
        const merged = new Uint8Array(a.length + b.length);
        merged.set(a, 0);
        merged.set(b, a.length);
        return merged;
    }

    computeImageRetryCount(image: TranslationImage): number {
        return Math.min((image.retryCount || 0) + 1, MAX_TRANSLATION_RETRIES);
    }
}