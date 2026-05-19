import { TranslationImageRepository } from "@/lib/repositories/translate/translation-image";
import { TranslationStorageRepository } from "@/lib/repositories/translate/translation-storage";
import { TranslationTaskRepository } from "@/lib/repositories/translate/translation-task";
import { UserRepository } from "@/lib/repositories/auth/user-repository";
import { authService } from "@/lib/services/auth/auth-service";
import { TranslationService } from "@/lib/services/translate/translation-service";
import { TranslationConfig } from "@/types/do/translation-config";
import { CHECK_PARAM_ERROR_CODE, SUCCESS_CODE, UNAUTHORIZED_ERROR_CODE } from "@/types/do/common";
import { createServerClient } from "@/lib/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    // 1. 解析请求 (支持多图片)
    const formData = await request.formData();
    const images = formData.getAll("images") as File[];
    const configStr = formData.get("config") as string;
    let config: TranslationConfig;
    try {
        config = JSON.parse(configStr) as TranslationConfig;
    } catch (err) {
        return NextResponse.json({ error: 'config invalid' }, { status: 400 });
    }

    // 2. 创建任务、上传图片并保存记录
    const supabase = await createServerClient();
    const translationService = new TranslationService(
        new UserRepository(supabase),
        new TranslationTaskRepository(supabase),
        new TranslationImageRepository(supabase),
        new TranslationStorageRepository(supabase),
    );
    const submitResult = await translationService.submitTranslationTask(images, config);
    if (submitResult.code === UNAUTHORIZED_ERROR_CODE) {
        return NextResponse.json({ error: submitResult.error!.message }, { status: 401 });
    }
    if (submitResult.code === CHECK_PARAM_ERROR_CODE) {
        return NextResponse.json({ error: submitResult.error!.message }, { status: 400 });
    }
    if (submitResult.code !== SUCCESS_CODE || !submitResult.data) {
        return NextResponse.json({ error: submitResult.error?.message ?? 'Internal Server Error' }, { status: 500 });
    }

    // 3. 返回任务 ID
    return NextResponse.json({ taskId: submitResult.data }, { status: 200 });
}
