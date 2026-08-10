"use server"

import { type ListUserTransactionsInput, BillingService } from "@/biz/services/billing/billing-service";
import { createServerClient } from "@/biz/utils/supabase/server";
import { Response } from "@/types/action/response";
import { UNAUTHORIZED_ERROR_CODE, CHECK_PARAM_ERROR_CODE, SUCCESS_CODE, EXCEPTION_CODE } from "@/types/dto/response";
import type { ListUserTransactionsPage } from "@/types/dto/user-transaction";


export async function listUserTransactions(
    input: ListUserTransactionsInput = {}
): Promise<Response<ListUserTransactionsPage>> {
    try {
        const supabase = await createServerClient();
        const result = await BillingService.fromSupabase(supabase).listUserTransactions(input);
        if (result.code === UNAUTHORIZED_ERROR_CODE) {
            return {
                code: UNAUTHORIZED_ERROR_CODE,
                message: "UnAuthorized",
                data: null,
            };
        }
        if (result.code === CHECK_PARAM_ERROR_CODE) {
            return {
                code: CHECK_PARAM_ERROR_CODE,
                message: result.error?.message ?? "Param Error",
                data: null,
            };
        }
        if (result.code !== SUCCESS_CODE || result.data === null) {
            return {
                code: result.code,
                message: "Internal Server Error",
                data: null,
            };
        }

        return {
            code: SUCCESS_CODE,
            message: "",
            data: result.data,
        };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown Error";
        console.error(`listUserTransactions unexpected error: ${errorMessage}`);
        return { code: EXCEPTION_CODE, message: "Internal Server Error", data: null };
    }
}
