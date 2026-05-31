import "@/setup-env";
import { TranslationImageRepository } from "@/biz/repositories/translate/translation-image";
import { TranslationStorageRepository } from "@/biz/repositories/translate/translation-storage";
import { TranslationTaskRepository } from "@/biz/repositories/translate/translation-task";
import { TranslationService } from "@/biz/services/translate/translation-service";
import { createServiceRoleClient } from "@/biz/utils/supabase/admin";
import { UserRepository } from "@/biz/repositories/auth/user-repository";
import { sleep } from "@/biz/utils/sleep";
import { BizResult } from "@/types/do/common";
import { CreditService } from "@/biz/services/credit/credit-service";
import { TopUpConfigRepository } from "@/biz/repositories/topup/topup-config";
import { UserTransactionsRepository } from "@/biz/repositories/topup/user-transactions";
import { PricingConfigRepository } from "@/biz/repositories/pricing/pricing-config";
import { UserCreditsRepository } from "@/biz/repositories/credit/user-credits";
import {
    isTranslateImageFailedResult,
    isTranslateImageSuccessResult,
    TranslateImageFailedResult,
    TranslateImageSuccessResult,
} from "@/types/dto/translation-image";

const POLL_INTERVAL = 5000; // 5 秒
const MAX_CONCURRENT = 3; // 同时处理 3 张图片
const RESULT_CHECK_INTERVAL = 10000; // 10 秒检查一次结果
const RESULT_CHECK_TIMEOUT = 300000; // 5 分钟超时

class TranslationWorker {
    private isRunning = false;
    private activeImages = new Set<string>();
    private translationService: TranslationService;
    private creditService: CreditService;

    constructor() {
        const supabase = createServiceRoleClient();
        this.translationService = new TranslationService(
            new UserRepository(supabase),
            new TranslationTaskRepository(supabase),
            new TranslationImageRepository(supabase),
            new TranslationStorageRepository(supabase)
        );
        this.creditService = new CreditService(
            new TopUpConfigRepository(supabase),
            new UserTransactionsRepository(supabase),
            new PricingConfigRepository(supabase),
            new UserCreditsRepository(supabase),
        );
    }

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

            await sleep(POLL_INTERVAL);
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
        await this.translationService.resetStuckImages();

        // 2. 检查是否有空闲槽位
        const availableSlots = MAX_CONCURRENT - this.activeImages.size;
        if (availableSlots <= 0) {
            return; // 所有槽位已满
        }

        // 3. 获取待处理图片 (按图片粒度查询,而非任务粒度)
        const pendingImagesResult = await this.translationService.getPendingImages(availableSlots);
        if (pendingImagesResult.error) {
            console.error('❌ Failed to get pending images:', pendingImagesResult.error);
            return;
        }
        const pendingImages = pendingImagesResult.data!;
        if (pendingImages.length === 0) {
            return;
        }

        // 4. 处理每张图片
        for (const image of pendingImages) {
            if (this.activeImages.has(image.id)) {
                continue;
            }

            this.activeImages.add(image.id);
            this.translationService.translateImage(image.id)
                .then((result) => this.handleTranslateImageComplete(result))
                .catch((err) => {
                    // translateImage 内部已 handle 失败，catch 防未捕获异常
                    console.error(err);
                })
                .finally(() => {
                    this.activeImages.delete(image.id);
                });
        }
    }

    // 每张图片处理结束的回调
    async handleTranslateImageComplete(input: BizResult<TranslateImageSuccessResult | TranslateImageFailedResult>) {
        console.debug(`handleTranslateImageComplete, input: ${JSON.stringify(input)}`)
        if (!input.data) {
            return;
        }
        const data = input.data;
        if (isTranslateImageFailedResult(data)) {
            if (data.needRefund && data.userId) {
                await this.creditService.refundImageCredits(data.userId, data.taskId, data.imageId, data.refundCredits);
            } else {
                console.warn(`translateImage fail, but no need refund or userId not found, input: ${JSON.stringify(input)}`);
            }
            return;
        }
        if (isTranslateImageSuccessResult(data)) {
            await this.creditService.captureImageCredits(data.userId, data.taskId, data.imageId, data.consumeCredits);
        }
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