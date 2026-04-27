import { TranslationImageRepository } from "@/lib/repositories/translation-image";
import { TranslationStorageRepository } from "@/lib/repositories/translation-storage";
import { TranslationTaskRepository } from "@/lib/repositories/translation-task";
import { MAX_TRANSLATION_RETRIES, TranslationService } from "@/lib/services/translate/translation";
import { createServiceRoleClient } from "@/lib/supabase/server";

const POLL_INTERVAL = 5000; // 5 秒
const MAX_CONCURRENT = 3; // 同时处理 3 张图片
const RESULT_CHECK_INTERVAL = 10000; // 10 秒检查一次结果
const RESULT_CHECK_TIMEOUT = 300000; // 5 分钟超时

class TranslationWorker {
    private isRunning = false;
    private activeImages = new Set<string>();

    /**
   * 启动 Worker
   */
    async start() {
        console.log('🚀 Translation Worker started');
        this.isRunning = true;

        while (this.isRunning) {
            try {
                await this.pollAndProcess();
            } catch (error) {
                console.error('❌ Worker poll error:', error);
            }

            await this.sleep(POLL_INTERVAL);
        }
    }

    /**
   * 停止 Worker
   */
    stop() {
        console.log('🛑 Stopping Translation Worker...');
        this.isRunning = false;
    }

    /**
     * 轮询并处理图片
     */
    private async pollAndProcess() {
        // 1. 重置超时图片
        await this.resetStuckImages();

        // 2. 检查是否有空闲槽位
        const availableSlots = MAX_CONCURRENT - this.activeImages.size;
        if (availableSlots <= 0) {
            return; // 所有槽位已满
        }

        // 3. 获取待处理图片 (按图片粒度查询,而非任务粒度)
        const supabase = createServiceRoleClient();
        const imageRepo = new TranslationImageRepository(supabase);
        const pendingImagesResult = await imageRepo.getPendingImages(
            availableSlots
        );
        if (pendingImagesResult.error) {
            console.error('❌ Failed to get pending images:', pendingImagesResult.error);
            return;
        }
        const pendingImages = pendingImagesResult.data;
        if (!pendingImages) {
            return;
        }

        // 4. 处理每张图片
        for (const image of pendingImages) {
            if (this.activeImages.has(image.id)) continue;

            this.activeImages.add(image.id);
            this.processImage(image.id).finally(() => {
                this.activeImages.delete(image.id);
            });
        }
    }

    /**
     * 处理单张图片
     */
    private async processImage(imageId: string) {
        console.log(`📝 Processing image: ${imageId}`);

        // 1. 获取图片详情
        const supabase = createServiceRoleClient();
        const imageRepo = new TranslationImageRepository(supabase);
        const imageResult = await imageRepo.getImage(imageId);
        if (imageResult.error) {
            console.error('❌ Failed to get image:', imageResult.error);
            return;
        }
        const image = imageResult.data!;

        // 2. 更新图片状态为 processing (触发器会自动更新任务状态)
        const updateImageStatusResult = await imageRepo.updateImage(imageId, {
            status: 'processing',
            startedAt: new Date().toISOString(),
        });
        if (updateImageStatusResult.error) {
            console.error('❌ Failed to update image status:', updateImageStatusResult.error);
            return;
        }

        // 3. 获取任务配置 (从图片关联的任务获取)
        const translationService = new TranslationService();
        const taskRepo = new TranslationTaskRepository(supabase);
        const taskResult = await taskRepo.getTask(image.taskId);
        if (taskResult.error) {
            console.error('❌ Failed to get task:', taskResult.error);
            await this.processImageError(imageRepo, translationService, imageId, `Failed to get task: ${taskResult.error.message}`);
            return;
        }
        const task = taskResult.data!;
        const config = task.config;

        // 4. 下载原始图片
        const storageRepo = new TranslationStorageRepository(supabase);
        const downloadOriginalImageResult = await storageRepo.downloadFile(image.originalImagePath);
        if (downloadOriginalImageResult.error) {
            console.error('❌ Failed to download original image:', downloadOriginalImageResult.error);
            await this.processImageError(imageRepo, translationService, imageId, `Failed to download original image: ${downloadOriginalImageResult.error.message}`);
            return;
        }
        const originalImage = downloadOriginalImageResult.data!;

        // 5. 提交到 Modal 服务
        const submitResult = await translationService.submitTranslation(originalImage, config);
        if (submitResult.error) {
            console.error('❌ Failed to submit translation:', submitResult.error);
            await this.processImageError(imageRepo, translationService, imageId, `Failed to submit translation: ${submitResult.error.message}`);
            return;
        }
        const folderName = submitResult.data?.folderName!;

        // 6. 更新 folderName
        const updateFolderNameResult = await imageRepo.updateImage(imageId, {
            folderName: folderName,
        });
        if (updateFolderNameResult.error) {
            console.error('❌ Failed to update folder name:', updateFolderNameResult.error);
            await this.processImageError(imageRepo, translationService, imageId, `Failed to update folder name: ${updateFolderNameResult.error.message}`);
            return;
        }

        // 7. 等待翻译完成
        const isReady = await this.waitForResult(folderName);
        if (!isReady) {
            console.error('❌ Translation timeout:', translationService.getResultUrl(folderName));
            await this.processImageError(imageRepo, translationService, imageId, `Translation timeout: ${translationService.getResultUrl(folderName)}`);
            return;
        }

        // 8.下载翻译图片
        const translatedImageResult = await translationService.downloadResult(folderName);
        if (translatedImageResult.error) {
            console.error('❌ Failed to download translated image:', translationService.getResultUrl(folderName), ", error:", translatedImageResult.error);
            await this.processImageError(imageRepo, translationService, imageId, `Failed to download translated image: ${translationService.getResultUrl(folderName)}`);
            return;
        }
        const translatedImage = translatedImageResult.data!;

        // 9. 上传到 Supabase Storage
        const uploadResultImageResult = await storageRepo.uploadResultImage(task.userId, task.id, image.imageIndex, translatedImage);
        if (uploadResultImageResult.error) {
            console.error('❌ Failed to upload translated image:', translationService.getResultUrl(folderName), ", error:", uploadResultImageResult.error);
            await this.processImageError(imageRepo, translationService, imageId, `Failed to upload translated image: ${uploadResultImageResult.error.message}`);
            return;
        }
        const resultImagePath = uploadResultImageResult.data!;

        // 10. 更新图片状态为 completed (触发器会自动更新任务进度)
        const updateResultImageResult = await imageRepo.updateImage(imageId, {
            status: 'completed',
            resultImagePath: resultImagePath,
            completedAt: new Date().toISOString(),
        });
        if (updateResultImageResult.error) {
            console.error('❌ Failed to update image status:', updateResultImageResult.error);
            await this.processImageError(imageRepo, translationService, imageId, `Failed to update image result: ${updateResultImageResult.error.message}`);
            return;
        }
        console.log(`✅ Image ${imageId} processed successfully`);
    }

    private async processImageError(imageRepo: TranslationImageRepository, translationService: TranslationService, imageId: string, errorMessage: string) {
        const imageResult = await imageRepo.getImage(imageId);
        if (imageResult.error) {
            console.error('❌ Failed to get image:', imageResult.error);
            return;
        }
        const image = imageResult.data;
        if (!image) {
            console.error('❌ Image not found:', imageId);
            return;
        }
        const retryCount = translationService.getImageRetryCount(image);
        const shouldRetry = retryCount < MAX_TRANSLATION_RETRIES;
        const status = shouldRetry ? 'pending' : 'failed';
        const updateImageResult = await imageRepo.updateImage(imageId, {
            status: status,
            errorMessage: errorMessage,
            retryCount: retryCount,
        });
        if (updateImageResult.error) {
            console.error('❌ Failed to update image:', updateImageResult.error);
            return;
        }
    }

    /**
     * 等待翻译结果就绪
     */
    private async waitForResult(folderName: string): Promise<boolean> {
        let startTime = Date.now();
        while (Date.now() - startTime < RESULT_CHECK_TIMEOUT) {
            const translationService = new TranslationService();
            const isReady = await translationService.checkResultReady(folderName);
            if (isReady) {
                return true;
            }
            await this.sleep(RESULT_CHECK_INTERVAL);
        }
        return false;
    }

    /**
     * 重置超时的图片
     */
    private async resetStuckImages() {
        const supabase = createServiceRoleClient();
        const imageRepo = new TranslationImageRepository(supabase);
        const translationService = new TranslationService();
        // 处理超过10m的图片
        const stuckImagesResult = await imageRepo.getStuckImages(10);
        if (stuckImagesResult.error) {
            console.error('❌ Failed to get stuck images:', stuckImagesResult.error);
            return;
        }
        const stuckImages = stuckImagesResult.data!;
        for (const image of stuckImages) {
            await this.processImageError(imageRepo, translationService, image.id, `Image stuck for too long`);
        }
    }

    /**
     * 睡眠函数
     */
    private async sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// 启动 Worker
const worker = new TranslationWorker();

// 优雅关闭
process.on('SIGTERM', () => {
  worker.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  worker.stop();
  process.exit(0);
});

// 启动
worker.start().catch(console.error);