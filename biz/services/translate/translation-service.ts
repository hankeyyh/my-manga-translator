import { CHECK_PARAM_ERROR_CODE, DB_ERROR_CODE, NETWORK_ERROR_CODE, SUCCESS_CODE, UNAUTHORIZED_ERROR_CODE } from "@/types/dto/response";
import { BizResult } from "@/types/dto/response";
import { TranslationImage } from "@/types/do/translation-image";
import { TranslationConfig } from "@/types/do/translation-config";
import { getAlgoBaseUrl } from "@/biz/utils/url";
import { TranslationTaskRepository } from "@/biz/repositories/translate/translation-task";
import { CreateImageParams, TranslationImageRepository } from "@/biz/repositories/translate/translation-image";
import { TranslationStorageRepository } from "@/biz/repositories/translate/translation-storage";
import { UserRepository } from "@/biz/repositories/auth/user-repository";
import { TranslationTaskDetailView } from "@/types/dto/translation-task";
import { TranslationImageView } from "@/types/dto/translation-image";
import { PricingConfigRepository } from "@/biz/repositories/pricing/pricing-config";
import { TranslationTask } from "@/types/do/translation-task";
import { TranslationStreamEvent } from "@/types/do/translation-stream-event";
import { packZip } from "@/biz/utils/pack";

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
        if (!userResult.data) {
            console.error(`submitTranslationTask, user claims not found, need login`);
            return { code: UNAUTHORIZED_ERROR_CODE, data: null, error: new Error("User Not Login") };
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
        if (userResult.error || !userResult.data) {
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
            console.error('❌ Failed to create signed URLs:', originalUrlsResult.error.message);
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
                console.error("getTranslationTaskDetail, createSignedUrls failed, error: ", resultUrlResult.error.message);
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
        if (userResult.error || !userResult.data) {
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
            console.error("getUserTranslationHistory, createSignedUrls failed, error: ", originalUrlResult.error.message);
            return { code: DB_ERROR_CODE, data: null, error: originalUrlResult.error };
        }
        const originalUrls = originalUrlResult.data!;
        // 4. 生成翻译图签名 URL
        const resultUrlResult = await this.imageStorage.createSignedUrls(resultImagePaths, 3600);
        if (resultUrlResult.error) {
            console.error("getUserTranslationHistory, createSignedUrls failed, error: ", resultUrlResult.error.message);
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

    async batchGetPendingImageForProcessing(imageIds: string[]): Promise<BizResult<TranslationImage[]>> {
        const claimResult = await this.imageRepo.batchGetPendingImageForProcessing(imageIds);
        if (claimResult.error) {
            return { code: DB_ERROR_CODE, data: null, error: claimResult.error };
        }
        return { code: SUCCESS_CODE, data: claimResult.data, error: null };
    }

    async getTask(taskId: string): Promise<BizResult<TranslationTask>> {
        const taskResult = await this.taskRepo.getTask(taskId);
        if (taskResult.error) {
            return { code: DB_ERROR_CODE, data: null, error: taskResult.error };
        }
        return { code: SUCCESS_CODE, data: taskResult.data, error: null };
    }

    async downloadOriginalImages(images: TranslationImage[]): Promise<{ validImages: TranslationImage[], blobs: Blob[]; }> {
        const originalImages: Blob[] = [];
        const validImages: TranslationImage[] = [];
        for (const image of images) {
            const downloadOriginalImageResult = await this.imageStorage.downloadFile(image.originalImagePath);
            if (downloadOriginalImageResult.error) {
                console.error(`Failed to download original image, imageId: ${image.id}, err: ${downloadOriginalImageResult.error.message}`);
                continue;
            }
            validImages.push(image);
            originalImages.push(downloadOriginalImageResult.data!);
        }
        return { validImages, blobs: originalImages };
    }

    async downloadResultZip(imageIds: string[]): Promise<BizResult<Uint8Array<ArrayBuffer>>> {
        // 获取images
        const imageResult = await this.imageRepo.batchGetImages(imageIds);
        if (imageResult.error) {
            console.error(`downloadResultZip, repo.batchGetImages fail, error: ${imageResult.error.message}`);
            return { code: DB_ERROR_CODE, data: null, error: imageResult.error };
        }
        const images = imageResult.data!;
        // 下载翻译后的图
        const zippable: { fileName: string, blob: Blob; }[] = [];
        for (const image of images) {
            if (!image.resultImagePath) {
                continue;
            }
            const downloadResult = await this.imageStorage.downloadFile(image.resultImagePath);
            if (downloadResult.error) {
                console.error(`downloadResultZip, storage.downloadFile fail, error: ${downloadResult.error.message}`);
                continue;
            }
            zippable.push({ fileName: image.filename, blob: downloadResult.data! });
        }
        // 打包zip
        const result = await packZip(zippable);
        return { code: SUCCESS_CODE, data: result, error: null };
    }

    /**
     * 用户上传一批图片到工作栏
     * 点击翻译
     * 处理这批图片
     * 如果部分失败，标红失败的图片，其他图片成功（不需要max_retries, retry_cnt，做复杂了，由用户控制重试就好）
     * 用户可以选择重试，失败图片一起重新翻译
     */
    async batchTranslatePipeline(task: TranslationTask, images: TranslationImage[]) {
        const imageIds = images.map((value) => value.id);
        const successImageIds: string[] = [];
        const failedImageIds: string[] = [];

        // DEBUG
        if (process.env.FORCE_TRANSLATE_FAIL === "1") {
            await this.markImagesFailed(imageIds, "dev forced fail");
            return { successImageIds: [], failedImageIds: imageIds };
        }

        // 1. 下载原始图片
        const { validImages, blobs: originalImages } = await this.downloadOriginalImages(images);
        const validImageIds = validImages.map((value) => value.id);
        const invalidImageIds = imageIds.filter((id) => !validImageIds.includes(id));
        if (invalidImageIds.length) {
            const invalidResult = await this.markImagesFailed(invalidImageIds, `Failed to download original image blob`);
            if (invalidResult.data) {
                failedImageIds.push(...invalidResult.data);
            }
        }
        if (validImageIds.length === 0) {
            return { successImageIds, failedImageIds };
        }
        const config = task.config;

        // 2. 提交到Modal服务
        config.save = {
            save_to: "supabase_storage",
            supabase_storage_bucket: "translation_storage",
            supabase_storage_paths: []
        };
        const today = new Date().toISOString().slice(0, 10);
        for (const image of validImages) {
            const finalFilePath = `${task.userId}/${today}/output/${task.id}_${image.imageIndex}.png`;
            config.save.supabase_storage_paths?.push(finalFilePath);
        }
        config.image_identifiers = validImageIds;
        const submitResult = await this.submitBatchTranslation(originalImages, config);
        if (submitResult.error) {
            console.error('Failed to submit translation:', submitResult.error.message);
            const submitFailResult = await this.markImagesFailed(validImageIds, `Failed to submit translation: ${submitResult.error.message}`);
            if (submitFailResult.data) {
                failedImageIds.push(...submitFailResult.data);
            }
            return { successImageIds, failedImageIds };
        }
        const reader = submitResult.data!;

        // 3. 监听事件
        for await (const event of this.parseTranslationStream(reader)) {
            switch (event.type) {
                case 'image_completed':
                    const successResult = await this.markImageSuccess(event.imageId, event.outputPath);
                    if (!successResult.error) {
                        successImageIds.push(event.imageId);
                    }
                    break;
                case 'image_failed':
                    const failResult = await this.markImagesFailed([event.imageId], event.error);
                    if (failResult.data) {
                        failedImageIds.push(...failResult.data);
                    }
                    break;
                case 'batch_error': {
                    // 函数仅会将 processing 的图片标记为失败
                    console.error("event:batch_error: ", event.error);
                    const batchErrResult = await this.markImagesFailed(validImageIds, event.error);
                    if (batchErrResult.data) {
                        failedImageIds.push(...batchErrResult.data);
                    }
                    break;
                }
                case 'batch_completed':
                    console.debug("event:batch_completed!");
                    break;
            }
        }
        return { successImageIds, failedImageIds };
    }

    // 标记失败图片
    async markImagesFailed(imageIds: string[], errMessage: string): Promise<BizResult<string[]>> {
        const result = await this.imageRepo.markImagesFailed(imageIds, errMessage);
        if (result.error) {
            console.error("markImagesFailed failed, error: ", result.error.message ?? result.error);
            return { code: DB_ERROR_CODE, data: null, error: result.error };
        }
        const markedIds = result.data ?? [];
        return { code: SUCCESS_CODE, data: markedIds, error: null };
    }

    // 标记成功图片
    async markImageSuccess(imageId: string, finalFilePath: string): Promise<BizResult<string>> {
        const result = await this.imageRepo.markImageSuccess(imageId, finalFilePath);
        if (result.error) {
            return { code: DB_ERROR_CODE, data: null, error: result.error };
        }
        return { code: SUCCESS_CODE, data: result.data, error: null };
    }

    // 获取任务图片
    async getTaskPendingImages(taskId: string): Promise<BizResult<TranslationImage[]>> {
        const result = await this.imageRepo.getPendingImagesByTask(taskId);
        if (result.error) {
            console.error("getPendingImagesByTask failed, error: ", result.error.message);
            return { code: DB_ERROR_CODE, data: null, error: result.error };
        }
        return { code: SUCCESS_CODE, data: result.data!, error: null };
    }

    private async submitBatchTranslation(imageBlobs: Blob[], config: TranslationConfig): Promise<BizResult<ReadableStreamDefaultReader>> {
        const algoBaseUrl = getAlgoBaseUrl();
        try {
            const bodyData = new FormData();
            for (const imageBlob of imageBlobs) {
                bodyData.append("images", imageBlob);
            }
            bodyData.append("config", JSON.stringify(config));
            const response = await fetch(`${algoBaseUrl}/translate/batch/image/stream/web`, {
                method: "POST",
                body: bodyData,
            });
            if (!response.ok) {
                console.error(`submitBatchTranslation, fetch algo svr fail, error: ${response.statusText}`);
                return { code: NETWORK_ERROR_CODE, data: null, error: new Error("fetch algo svr fail") };
            }
            const reader = response.body?.getReader();
            if (!reader) {
                console.error("submitBatchTranslation, no response body");
                return { code: NETWORK_ERROR_CODE, data: null, error: new Error("no response body") };
            }
            return { code: SUCCESS_CODE, data: reader, error: null };
        } catch (err) {
            console.error(`submitBatchTranslation, fetch algo svr fail, error: ${err}`);
            return {
                code: NETWORK_ERROR_CODE,
                data: null,
                error: err instanceof Error ? err : new Error(String(err)),
            };
        }
    }

    /**
     * TODO 没有超时控制
     */
    private async* parseTranslationStream(reader: ReadableStreamDefaultReader<Uint8Array<ArrayBuffer>>): AsyncGenerator<TranslationStreamEvent, void, void> {
        let buffer: Uint8Array<ArrayBuffer> = new Uint8Array();
        const textDecoder = new TextDecoder("utf-8");
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    // 不应该走到这里，通过协议status判断结束
                    throw new Error('stream closed before batch_completed');
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
                    const message = textDecoder.decode(data);

                    // 处理数据包, 
                    // status=0 接口执行成功后，每张图片发一次; 
                    // status=1 过程数据;
                    // - image_completed:{image_identifier}:{output_path} 保存成功
                    // - image_failed:{image_identifier}:{errMsg} 翻译过程遇到失败
                    // status=2 整体异常报错;
                    // status=3 排队中;
                    // status=4 即将开始;
                    // status=5 整体翻译完成
                    switch (status) {
                        case 1: {
                            console.debug("status: 1 ", " message: ", message);
                            const event = this.parseProgressEvent(message);
                            if (event) {
                                yield event;
                            }
                            break;
                        }
                        case 2: {
                            console.debug("status: 2 ", " message: ", message);
                            yield { type: "batch_error", error: message };
                            return;
                        }
                        case 3: {
                            console.debug("status: 3 ", " message: ", message);
                            yield { type: "queue", position: Number(message) };
                            break;
                        }
                        case 4: {
                            console.debug("status: 4 ", " message: ", message);
                            yield { type: "ready" };
                            break;
                        }
                        case 5: {
                            console.debug("status: 5 ", " message: ", message);
                            yield { type: "batch_completed" };
                            return;
                        }
                    }
                }
            }
        } finally {
            await reader.cancel();
        }
    }

    private parseProgressEvent(message: string): TranslationStreamEvent | null {
        if (message.startsWith("image_completed:")) {
            const parsed = this.parseImageProgressMessage(message, "image_completed:");
            if (!parsed) {
                return null;
            }
            return { type: "image_completed", imageId: parsed.imageId, outputPath: parsed.payload };
        } else if (message.startsWith("image_failed:")) {
            const parsed = this.parseImageProgressMessage(message, "image_failed:");
            if (!parsed) {
                return null;
            }
            return { type: "image_failed", imageId: parsed.imageId, error: parsed.payload };
        }
        return { type: "progress", message: message };
    }

    private parseImageProgressMessage(message: string, prefix: string): { imageId: string; payload: string; } | null {
        if (!message.startsWith(prefix)) {
            return null;
        }
        const content = message.slice(prefix.length);
        const colonIndex = content.indexOf(":");
        if (colonIndex <= 0) {
            return null;
        }
        const imageId = content.slice(0, colonIndex);
        const payload = content.slice(colonIndex + 1);
        if (!imageId || !payload) {
            return null;
        }
        return { imageId, payload };
    }

    private mergeUint8Array(a: Uint8Array<ArrayBuffer>, b: Uint8Array<ArrayBuffer>): Uint8Array<ArrayBuffer> {
        const merged = new Uint8Array(a.length + b.length);
        merged.set(a, 0);
        merged.set(b, a.length);
        return merged;
    }
}