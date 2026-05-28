import { UserRepository } from "@/biz/repositories/auth/user-repository";
import { TopUpConfigRepository } from "@/biz/repositories/topup/topup-config";
import { UserTransactionsRepository } from "@/biz/repositories/topup/user-transactions";
import { sleep } from "@/biz/utils/sleep";
import { BizResult, DB_ERROR_CODE, LOGIC_ERROR_CODE, Result, SUCCESS_CODE, UNAUTHORIZED_ERROR_CODE } from "@/types/do/common";
import { TopUpConfig } from "@/types/do/topup-config";
import { UserTransaction } from "@/types/do/user-transaction";

// 充值失败，重试次数
const TOPUP_MAX_RETRIES = 3;

const TRANSACTION_TYPE_PAY_TO_USE = "pay-to-use";
const TRANSACTION_TYPE_SUBSCRIPTION = "subscription";

const TRANSACTION_STATUS_PENDING = "pending";
const TRANSACTION_STATUS_SUCCESS = "success";
const TRANSACTION_STATUS_FAILED = "failed";
const TRANSACTION_STATUS_CANCELED = "canceled";

const BILLING_CYCLE_MONTHLY = "monthly";
const BILLING_CYCLE_YEARLY = "yearly";

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
    ) {

    }

    // 查询积分余额
    async getCreditBalance(userId: string): Promise<number> {
        return 0;
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

    // 创建交易记录
    async startUserTransaction(userId: string, topupConfig: TopUpConfig): Promise<BizResult<UserTransaction>> {
        let transactionResult: Result<UserTransaction>;
        if (topupConfig.transactionType === TRANSACTION_TYPE_PAY_TO_USE) {
            // 一次性购买
            transactionResult = await this.userTransRepo.createPayToUseTransaction({
                userId: userId,
                rechargeAmount: topupConfig.price,
                credits: topupConfig.creditsIncluded,
                transactionStatus: TRANSACTION_STATUS_PENDING,
                packTier: topupConfig.packTier!,
            });
        } else if (topupConfig.transactionType === TRANSACTION_TYPE_SUBSCRIPTION) {
            // 订阅
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
            });
        } else {
            console.error(`startUserTransaction, unsupported transactionType: ${topupConfig.transactionType}`);
            return { code: LOGIC_ERROR_CODE, data: null, error: new Error("unsupported transactionType") };
        }
        if (transactionResult.error) {
            console.error(`startUserTransaction, createUserTransaction fail, error: ${transactionResult.error.message}`);
            return { code: DB_ERROR_CODE, data: null, error: transactionResult.error };
        }
        return { code: SUCCESS_CODE, data: transactionResult.data, error: null };
    }

    // 交易记录成功
    async succeedUserTransaction(transactionId: string): Promise<BizResult<boolean>> {
        const result = await this.userTransRepo.succeedTransaction(transactionId);
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

    // 预估消费
    async estimateCreditCost() { }

    // 计算实际消费
    async calculateActualCredits() { }

    // 扣除积分
    async deductCredits() { }

    // 退还积分
    async refundCredits() { }
}
