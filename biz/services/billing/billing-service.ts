import { UserRepository } from "@/biz/repositories/auth/user-repository";
import { TopUpConfigRepository } from "@/biz/repositories/topup/topup-config";
import { UserSubscriptionRepository } from "@/biz/repositories/topup/user-subscriptions";
import { UserTransactionsRepository } from "@/biz/repositories/topup/user-transactions";
import {
    BizResult,
    CHECK_PARAM_ERROR_CODE,
    DB_ERROR_CODE,
    SUCCESS_CODE,
    UNAUTHORIZED_ERROR_CODE,
} from "@/types/dto/response";
import { UserSubscription } from "@/types/do/user-subscription";
import { SupabaseClient } from "@supabase/supabase-js";
import { ListUserTransactionsPage } from "@/types/dto/user-transaction";

const DEFAULT_PAGE_LIMIT = 20;
const MAX_PAGE_LIMIT = 50;

export type ListUserTransactionsInput = {
    cursor?: string | null;
    limit?: number;
};

type TransactionCursor = {
    createdAt: string;
    id: string;
};

function encodeCursor(cursor: TransactionCursor): string {
    return Buffer.from(JSON.stringify(cursor), "utf8").toString("base64url");
}

function decodeCursor(raw: string): TransactionCursor | null {
    try {
        const parsed = JSON.parse(
            Buffer.from(raw, "base64url").toString("utf8"),
        ) as Partial<TransactionCursor>;
        if (
            typeof parsed.createdAt === "string" &&
            typeof parsed.id === "string" &&
            parsed.createdAt.length > 0 &&
            parsed.id.length > 0
        ) {
            return { createdAt: parsed.createdAt, id: parsed.id };
        }
        return null;
    } catch {
        return null;
    }
}

/**
 * 账单与订阅
 */
export class BillingService {
    constructor(
        private userRepo: UserRepository,
        private userSubscriptionRepo: UserSubscriptionRepository,
        private userTransRepo: UserTransactionsRepository,
        private topupConfigRepo: TopUpConfigRepository,
    ) { }

    static fromSupabase(supabase: SupabaseClient) {
        return new BillingService(
            new UserRepository(supabase),
            new UserSubscriptionRepository(supabase),
            new UserTransactionsRepository(supabase),
            new TopUpConfigRepository(supabase),
        );
    }

    async getUserSubscription(): Promise<BizResult<UserSubscription>> {
        const userResult = await this.userRepo.getCurrentUser();
        if (userResult.error) {
            console.error(
                `getUserSubscription, repo.getCurrentUser fail, error: ${userResult.error}`,
            );
            return { data: null, error: userResult.error, code: DB_ERROR_CODE };
        }
        if (!userResult.data) {
            return { data: null, error: null, code: UNAUTHORIZED_ERROR_CODE };
        }

        const result = await this.userSubscriptionRepo.getActiveByUserId(
            userResult.data.id,
        );
        if (result.error) {
            console.error(`getUserSubscription, repo.getByUserId fail, error: ${result.error.message}`);
            return { data: null, error: result.error, code: DB_ERROR_CODE };
        }

        const subscription = result.data;
        if (!subscription) {
            return { data: null, error: null, code: SUCCESS_CODE };
        }

        const configResult = await this.topupConfigRepo.getTopUpConfig(subscription.topupConfigId);
        if (configResult.error) {
            console.error(`getUserSubscription, repo.getTopUpConfig fail, error: ${configResult.error.message}`);
            return { data: null, error: configResult.error, code: DB_ERROR_CODE };
        }

        return {
            data: {
                ...subscription,
                price: configResult.data?.price ?? null,
            },
            error: null,
            code: SUCCESS_CODE,
        };
    }

    async listUserTransactions(
        input: ListUserTransactionsInput = {},
    ): Promise<BizResult<ListUserTransactionsPage>> {
        const userResult = await this.userRepo.getCurrentUser();
        if (userResult.error) {
            console.error(`listUserTransactions, repo.getCurrentUser fail, error: ${userResult.error}`);
            return { data: null, error: userResult.error, code: DB_ERROR_CODE };
        }
        if (!userResult.data) {
            return { data: null, error: null, code: UNAUTHORIZED_ERROR_CODE };
        }

        const limit = Math.min(
            Math.max(input.limit ?? DEFAULT_PAGE_LIMIT, 1),
            MAX_PAGE_LIMIT,
        );

        let cursor: TransactionCursor | undefined;
        if (input.cursor) {
            const decoded = decodeCursor(input.cursor);
            if (!decoded) {
                return {
                    data: null,
                    error: new Error("Invalid cursor"),
                    code: CHECK_PARAM_ERROR_CODE,
                };
            }
            cursor = decoded;
        }

        const result = await this.userTransRepo.listByUserId(userResult.data.id, {
            cursor,
            limit: limit + 1,
        });
        if (result.error) {
            console.error(
                `listUserTransactions, repo.listByUserId fail, error: ${result.error.message}`,
            );
            return { data: null, error: result.error, code: DB_ERROR_CODE };
        }

        const rows = result.data ?? [];
        const hasMore = rows.length > limit;
        const items = hasMore ? rows.slice(0, limit) : rows;
        const last = items[items.length - 1];
        const nextCursor =
            hasMore && last
                ? encodeCursor({ createdAt: last.createdAt, id: last.id })
                : null;

        return {
            data: { items, nextCursor },
            error: null,
            code: SUCCESS_CODE,
        };
    }
}
