"use server";

import { TranslationService } from "@/biz/services/translate/translation-service";
import { createServerClient } from "@/biz/utils/supabase/server";
import { Response } from "@/types/action/response";
import { CHECK_PARAM_ERROR_CODE, EXCEPTION_CODE, SUCCESS_CODE, UNAUTHORIZED_ERROR_CODE } from "@/types/dto/response";
import { TranslationTaskDetailView } from "@/types/dto/translation-task";

const TASKS_LIMIT = 20;

export async function batchGetTaskDetail(taskIds: string[]): Promise<Response<TranslationTaskDetailView[]>> {
    if (taskIds.length > TASKS_LIMIT) {
        return { code: CHECK_PARAM_ERROR_CODE, data: null, message: `taskIds length limit is ${TASKS_LIMIT}` };
    }
    try {
        const supabase = await createServerClient();
        const result = await TranslationService.fromSupabase(supabase).batchGetTranslationTaskDetail(taskIds);
        if (result.code === UNAUTHORIZED_ERROR_CODE) {
            return { code: result.code, data: null, message: "UnAuthorized" };
        }
        if (result.code !== SUCCESS_CODE) {
            return { code: result.code, data: null, message: "Internal Server Error" };
        }
        return { code: result.code, data: result.data, message: "" };
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown Error";
        console.error(`batchGetTaskDetail unexpected error: ${errorMessage}`);
        return {
            code: EXCEPTION_CODE,
            message: "Internal Server Error",
            data: null,
        };
    }
}