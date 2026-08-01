"use server";

import {
    BillingService,
    type ListUserTransactionsInput,
} from "@/biz/services/billing/billing-service";
import { type ListUserTransactionsPage } from "@/types/dto/user-transaction";
import { createServerClient } from "@/biz/utils/supabase/server";
import { BizResult, DB_ERROR_CODE } from "@/types/dto/response";
import { UserSubscription } from "@/types/do/user-subscription";

export async function getUserSubscription(): Promise<BizResult<UserSubscription>> {
    try {
        const supabase = await createServerClient();
        return BillingService.fromSupabase(supabase).getUserSubscription();
    } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown Error");
        console.error(`getUserSubscription unexpected error: ${error.message}`);
        return { data: null, error, code: DB_ERROR_CODE };
    }
}

export async function listUserTransactions(input: ListUserTransactionsInput = {}): Promise<BizResult<ListUserTransactionsPage>> {
    try {
        const supabase = await createServerClient();
        return BillingService.fromSupabase(supabase).listUserTransactions(input);
    } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown Error");
        console.error(`listUserTransactions unexpected error: ${error.message}`);
        return { data: null, error, code: DB_ERROR_CODE };
    }
}
