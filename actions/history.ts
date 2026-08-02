"use server";

import {
    GetUserTranslationHistoryInput,
    TranslationHistoryRange,
    TranslationService,
} from "@/biz/services/translate/translation-service";
import { createServerClient } from "@/biz/utils/supabase/server";
import {
    CHECK_PARAM_ERROR_CODE,
    EXCEPTION_CODE,
    SUCCESS_CODE,
    UNAUTHORIZED_ERROR_CODE,
} from "@/types/dto/response";
import { TranslationHistoryPage } from "@/types/dto/translation-task";
import { TaskStatus } from "@/types/do/translation-task";
import { Response } from "@/types/action/response";

const VALID_STATUSES: TaskStatus[] = ["pending", "processing", "completed", "failed", "partial"];
const VALID_RANGES: TranslationHistoryRange[] = ["1d", "7d", "1m", "all"];

export async function getUserTranslationHistory(input: GetUserTranslationHistoryInput = {}):
    Promise<Response<TranslationHistoryPage>> {
    try {
        const status = input.status;
        const range = input.range ?? "all";

        if (status !== undefined && !VALID_STATUSES.includes(status)) {
            return {
                code: CHECK_PARAM_ERROR_CODE,
                message: `Invalid status. Expected one of: ${VALID_STATUSES.join(", ")}`,
                data: null,
            };
        }
        if (!VALID_RANGES.includes(range)) {
            return {
                code: CHECK_PARAM_ERROR_CODE,
                message: `Invalid range. Expected one of: ${VALID_RANGES.join(", ")}`,
                data: null,
            };
        }

        const supabase = await createServerClient();
        const result = await TranslationService.fromSupabase(supabase).getUserTranslationHistoryByTasks(input);
        if (result.code === UNAUTHORIZED_ERROR_CODE) {
            return {
                code: UNAUTHORIZED_ERROR_CODE,
                message: "UnAuthorized",
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
        console.error(`getUserTranslationHistory unexpected error: ${errorMessage}`);
        return { code: EXCEPTION_CODE, message: errorMessage, data: null };
    }
}
