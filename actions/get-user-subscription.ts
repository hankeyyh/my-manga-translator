"use server";

import {
    BillingService,
} from "@/biz/services/billing/billing-service";
import { createServerClient } from "@/biz/utils/supabase/server";
import {
    EXCEPTION_CODE,
    SUCCESS_CODE,
    UNAUTHORIZED_ERROR_CODE,
} from "@/types/dto/response";
import { UserSubscription } from "@/types/do/user-subscription";
import { Response } from "@/types/action/response";

export async function getUserSubscription(): Promise<Response<UserSubscription>> {
    try {
        const supabase = await createServerClient();
        const result = await BillingService.fromSupabase(supabase).getUserSubscription();
        if (result.code === UNAUTHORIZED_ERROR_CODE) {
            return {
                code: UNAUTHORIZED_ERROR_CODE,
                message: "UnAuthorized",
                data: null,
            };
        }
        if (result.code !== SUCCESS_CODE) {
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
        console.error(`getUserSubscription unexpected error: ${errorMessage}`);
        return { code: EXCEPTION_CODE, message: "Internal Server Error", data: null };
    }
}


