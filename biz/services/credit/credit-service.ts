import { UserCreditsRepository } from "@/biz/repositories/credit/user-credits";
import { CREDIT_BALANCE_NOT_ENOUGH_NAME, CREDIT_FROZEN_NOT_ENOUGH_TO_CAPTURE_NAME, CREDIT_FROZEN_NOT_ENOUGH_TO_REFUND_NAME } from "@/types/do/response";
import { PricingConfigRepository } from "@/biz/repositories/pricing/pricing-config";
import { TopUpConfigRepository } from "@/biz/repositories/topup/topup-config";
import { UserTransactionsRepository } from "@/biz/repositories/topup/user-transactions";
import { CHECK_PARAM_ERROR_CODE, CREDIT_FROZEN_NOT_ENOUGH_TO_CAPTURE, CREDIT_FROZEN_NOT_ENOUGH_TO_REFUND, CREDIT_BALANCE_NOT_ENOUGH, DB_ERROR_CODE, SUCCESS_CODE, UNAUTHORIZED_ERROR_CODE, UNSUPPORTED_TRANSACTION_TYPE } from "@/types/dto/response";
import { Result } from "@/types/do/response";
import { BizResult } from "@/types/dto/response";
import { PricingConfig } from "@/types/do/pricing-config";
import { TopUpConfig } from "@/types/do/topup-config";
import { TranslationConfig } from "@/types/do/translation-config";
import { UserTransaction } from "@/types/do/user-transaction";
import { UserCredit } from "@/types/do/user-credit";
import { SupabaseClient } from "@supabase/supabase-js";

// 充值失败，重试次数
const TOPUP_MAX_RETRIES = 3;

const TRANSACTION_TYPE_PAY_TO_USE = "pay-to-use";
const TRANSACTION_TYPE_SUBSCRIPTION = "subscription";
export const TRANSACTION_TYPE_SUBSCRIPTION_CHANGE = "subscription_change";

const TRANSACTION_STATUS_PENDING = "pending";
const TRANSACTION_STATUS_SUCCESS = "success";
const TRANSACTION_STATUS_FAILED = "failed";
const TRANSACTION_STATUS_CANCELED = "canceled";

const BILLING_CYCLE_MONTHLY = "monthly";
const BILLING_CYCLE_YEARLY = "yearly";

// 注册奖励积分
const BONUS_CREDITS = 5;

function getSubscriptionEndDate(billingCycle: string, from: Date = new Date()): Date {
    const endedAt = new Date(from);
    if (billingCycle === BILLING_CYCLE_MONTHLY) {
        endedAt.setMonth(endedAt.getMonth() + 1);
    } else if (billingCycle === BILLING_CYCLE_YEARLY) {
        endedAt.setFullYear(endedAt.getFullYear() + 1);
    }
    return endedAt;
}

/**
 * 积分管理
 */
export class CreditService {
    constructor(private topupConfigRepo: TopUpConfigRepository,
        private userTransRepo: UserTransactionsRepository,
        private pricingConfigRepo: PricingConfigRepository,
        private userCreditRepo: UserCreditsRepository,
    ) {

    }

    static fromSupabase(supabase: SupabaseClient) {
        return new CreditService(
            new TopUpConfigRepository(supabase),
            new UserTransactionsRepository(supabase),
            new PricingConfigRepository(supabase),
            new UserCreditsRepository(supabase),
        );
    }

    // 查询积分余额
    async getCreditBalance(userId: string): Promise<BizResult<UserCredit>> {
        const { data, error } = await this.userCreditRepo.getCredits(userId);
        if (error) {
            console.error(`getCreditBalance, repo.getCredits fail, userId: ${userId}, error: ${error.message}`);
            return { code: DB_ERROR_CODE, data: null, error: error };
        }
        return { code: SUCCESS_CODE, data: data, error: null };
    }

    // 获取积分充值配置
    async getAllTopUpConfig(): Promise<BizResult<TopUpConfig[]>> {
        const { data, error } = await this.topupConfigRepo.getAllTopUpConfig();
        if (error) {
            console.error("getAllTopUpConfig, topupConfigRepo.getAllTopUpConfig fail, error: ", error);
            return { code: DB_ERROR_CODE, data: null, error: error };
        }
        return { code: SUCCESS_CODE, data: data, error: null };
    }

    async getTopUpConfig(id: string): Promise<BizResult<TopUpConfig>> {
        const { data, error } = await this.topupConfigRepo.getTopUpConfig(id);
        if (error) {
            console.error("getTopUpConfig, topupConfigRepo.getTopUpConfig fail, error: ", error);
            return { code: DB_ERROR_CODE, data: null, error: error };
        }
        return { code: SUCCESS_CODE, data: data, error: null };
    }

    // 创建交易记录；订阅变更时传入 TRANSACTION_TYPE_SUBSCRIPTION_CHANGE
    async startUserTransaction(userId: string, topupConfig: TopUpConfig, transactionType: string): Promise<BizResult<UserTransaction>> {
        let transactionResult: Result<UserTransaction>;
        if (transactionType === TRANSACTION_TYPE_PAY_TO_USE) {
            // 一次性购买
            transactionResult = await this.userTransRepo.createPayToUseTransaction({
                userId: userId,
                rechargeAmount: topupConfig.price,
                credits: topupConfig.creditsIncluded,
                transactionStatus: TRANSACTION_STATUS_PENDING,
                packTier: topupConfig.packTier!,
                topupConfigId: topupConfig.id,
            });
        } else if (transactionType === TRANSACTION_TYPE_SUBSCRIPTION || transactionType === TRANSACTION_TYPE_SUBSCRIPTION_CHANGE) {
            // 新订阅 / 订阅计划变更
            const startedAt = new Date();
            const endedAt = getSubscriptionEndDate(topupConfig.billingCycle!, startedAt);
            transactionResult = await this.userTransRepo.createSubscribeTransaction({
                userId: userId,
                rechargeAmount: topupConfig.price,
                credits: topupConfig.creditsIncluded,
                transactionStatus: TRANSACTION_STATUS_PENDING,
                billingCycle: topupConfig.billingCycle!,
                planTier: topupConfig.planTier!,
                subscriptionStartedAt: startedAt.toISOString(),
                subscriptionEndedAt: endedAt.toISOString(),
                topupConfigId: topupConfig.id,
                transactionType,
            });
        } else {
            console.error(`startUserTransaction, unsupported transactionType: ${transactionType}`);
            return { code: UNSUPPORTED_TRANSACTION_TYPE, data: null, error: new Error("unsupported transactionType") };
        }
        if (transactionResult.error) {
            console.error(`startUserTransaction, createUserTransaction fail, error: ${transactionResult.error.message}`);
            return { code: DB_ERROR_CODE, data: null, error: transactionResult.error };
        }
        return { code: SUCCESS_CODE, data: transactionResult.data, error: null };
    }

    // 交易记录成功
    async succeedUserTransaction(transactionId: string, subscriptionId: string | null): Promise<BizResult<boolean>> {
        const result = await this.userTransRepo.succeedTransaction(transactionId, subscriptionId);
        if (result.error) {
            console.error(`succeedUserTransaction, repo.succeedTransaction fail, error: ${result.error.message}`);
            return { code: DB_ERROR_CODE, data: null, error: result.error };
        }
        return { code: SUCCESS_CODE, data: result.data, error: null };
    }

    // 交易记录失败
    async failUserTransaction(transactionId: string): Promise<BizResult<void>> {
        const { error } = await this.userTransRepo.updateUserTransaction(transactionId, {
            transactionStatus: TRANSACTION_STATUS_FAILED,
            failedAt: new Date().toISOString(),
        });
        if (error) {
            console.error(`failUserTransaction, updateUserTransaction fail, error: ${error.message}`);
            return { code: DB_ERROR_CODE, data: null, error: error };
        }
        return { code: SUCCESS_CODE, data: null, error: null };
    }

    // 交易记录取消
    async cancelUserTransaction(transactionId: string): Promise<BizResult<void>> {
        const { error } = await this.userTransRepo.updateUserTransaction(transactionId, {
            transactionStatus: TRANSACTION_STATUS_CANCELED,
            canceledAt: new Date().toISOString(),
        });
        if (error) {
            console.error(`cancelUserTransaction, updateUserTransaction fail, error: ${error.message}`);
            return { code: DB_ERROR_CODE, data: null, error: error };
        }
        return { code: SUCCESS_CODE, data: null, error: null };
    }

    // 更新stripe session id
    async updateStripeSessionId(transactionId: string, stripeSessionId: string): Promise<BizResult<void>> {
        const { error } = await this.userTransRepo.updateUserTransaction(transactionId, {
            stripeSessionId: stripeSessionId,
        });
        if (error) {
            console.error(`updateStripeSessionId, updateUserTransaction fail, error: ${error.message}`);
            return { code: DB_ERROR_CODE, data: null, error: error };
        }
        return { code: SUCCESS_CODE, data: null, error: null };
    }

    // 获取翻译价格配置
    async getAllPricingConfig(): Promise<BizResult<PricingConfig[]>> {
        const result = await this.pricingConfigRepo.getAllPricingConfig();
        if (result.error) {
            console.error(`getAllPricingConfig, repo.getAllPricingConfig fail, error: ${result.error.message}`);
            return { code: DB_ERROR_CODE, data: null, error: result.error };
        }
        return { code: SUCCESS_CODE, data: result.data, error: null };
    }

    // 预估消费, 简单模型 1image=1credits, 复杂模型 1image=3credits
    async estimateCreditCost(imageLength: number, config: TranslationConfig): Promise<BizResult<number>> {
        const modelName = config.translator?.model_name;
        if (!modelName) {
            return { code: CHECK_PARAM_ERROR_CODE, data: null, error: new Error("translator not set") };
        }
        const pricingResult = await this.pricingConfigRepo.getPricingConfigByModel(modelName);
        if (pricingResult.error) {
            console.error(`estimateCreditCost, pricingRepo.getPricingConfigByModel fail, error: ${pricingResult.error.message}`);
            return { code: DB_ERROR_CODE, data: null, error: pricingResult.error };
        }
        const totalCost = pricingResult.data!.creditPerImage * imageLength;
        return { code: SUCCESS_CODE, data: totalCost, error: null };
    }

    // 冻结积分
    async freezeTaskCredits(userId: string, taskId: string, frozenCredits: number): Promise<BizResult<void>> {
        const result = await this.userCreditRepo.freezeTaskCredits(userId, taskId, frozenCredits);
        if (result.error) {
            console.error(`freezeTaskCredits, repo.freezeTaskCredits fail, error: ${result.error.message}, 
                taskId: ${taskId}, frozenCredits: ${frozenCredits}`);
            if (result.error.name === CREDIT_BALANCE_NOT_ENOUGH_NAME) {
                return { code: CREDIT_BALANCE_NOT_ENOUGH, data: null, error: result.error };
            }
            return { code: DB_ERROR_CODE, data: null, error: result.error };
        }
        return { code: SUCCESS_CODE, data: null, error: null };
    }

    // 批量核销积分
    async batchCaptureImageCredits(userId: string, imageIds: string[]): Promise<BizResult<void>> {
        const result = await this.userCreditRepo.batchCaptureImageCredits(userId, imageIds);
        if (result.error) {
            console.error(`batchCaptureImageCredits, repo.batchCaptureImageCredits fail, error: ${result.error.message}, 
                imageIds: ${imageIds}`);
            if (result.error.name === CREDIT_FROZEN_NOT_ENOUGH_TO_CAPTURE_NAME) {
                return { code: CREDIT_FROZEN_NOT_ENOUGH_TO_CAPTURE, data: null, error: result.error };
            }
            return { code: DB_ERROR_CODE, data: null, error: result.error };
        }
        return { code: SUCCESS_CODE, data: null, error: null };
    }

    // 批量退回积分
    async batchRefundImageCredits(userId: string, imageIds: string[]): Promise<BizResult<void>> {
        const result = await this.userCreditRepo.batchRefundImageCredits(userId, imageIds);
        if (result.error) {
            console.error(`batchRefundImageCredits, repo.batchRefundImageCredits fail, error: ${result.error.message}, 
                imageIds: ${imageIds}`);
            if (result.error.name === CREDIT_FROZEN_NOT_ENOUGH_TO_REFUND_NAME) {
                return { code: CREDIT_FROZEN_NOT_ENOUGH_TO_REFUND, data: null, error: result.error };
            }
            return { code: DB_ERROR_CODE, data: null, error: result.error };
        }
        return { code: SUCCESS_CODE, data: null, error: null };
    }

    // 重试翻译
    async prepareImagesForRetry(userId: string, taskId: string, imageIds: string[]): Promise<BizResult<{ newly_prepared: string[], already_prepared: string[]; }>> {
        const result = await this.userCreditRepo.prepareImagesForRetry(userId, taskId, imageIds);
        if (result.error) {
            console.error(`prepareImagesForRetry, repo.prepareImagesForRetry fail, imageIds: ${imageIds}, error: ${result.error.message}`);
            if (result.error.name === CREDIT_BALANCE_NOT_ENOUGH_NAME) {
                return { code: CREDIT_BALANCE_NOT_ENOUGH, data: null, error: result.error };
            }
            return { code: DB_ERROR_CODE, data: null, error: result.error };
        }
        console.debug(`prepareImagesForRetry, newly_prepared: ${result.data?.newly_prepared}, already_prepared: ${result.data?.already_prepared}`);
        return { code: SUCCESS_CODE, data: result.data, error: null };
    }

    // 发放注册奖励积分
    async grantSignupBonus(userId: string): Promise<BizResult<void>> {
        const result = await this.userCreditRepo.grantSignupBonus(userId, BONUS_CREDITS);
        if (result.error) {
            console.error(`grantSignupBouns, repo.grantSignupBonus fail, userId: ${userId}, error: ${result.error.message}`);
            return { code: DB_ERROR_CODE, data: null, error: result.error };
        }
        return { code: SUCCESS_CODE, data: null, error: null };
    }
}
