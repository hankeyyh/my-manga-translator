import { TranslationImageRepository } from "@/biz/repositories/translate/translation-image";
import { TranslationStorageRepository } from "@/biz/repositories/translate/translation-storage";
import { TranslationTaskRepository } from "@/biz/repositories/translate/translation-task";
import { UserRepository } from "@/biz/repositories/auth/user-repository";
import { TranslationService } from "@/biz/services/translate/translation-service";
import { createServerClient } from "@/biz/utils/supabase/server";
import { ApiTranslationTaskImage } from "@/types/api/translation-image";
import { SUCCESS_CODE, UNAUTHORIZED_ERROR_CODE } from "@/types/dto/response";
import { TranslationImageView } from "@/types/dto/translation-image";
import { NextResponse } from "next/server";
import { PricingConfigRepository } from "@/biz/repositories/pricing/pricing-config";

function toApiTranslationTaskImage(img: TranslationImageView): ApiTranslationTaskImage {
    return {
        id: img.id,
        status: img.status,
        taskId: img.taskId,
        filename: img.filename,
        imageIndex: img.imageIndex,
        originalImageUrl: img.originalImageUrl,
        resultImageUrl: img.resultImageUrl,
        errorMessage: img.errorMessage,
    };
}

export async function GET() {
    const supabase = await createServerClient();
    const result = await TranslationService.fromSupabase(supabase).getUserTranslationHistory();
    if (result.code === UNAUTHORIZED_ERROR_CODE) {
        return NextResponse.json({ error: "UnAuthorized" }, { status: 401 });
    }
    if (result.code !== SUCCESS_CODE || result.data === null) {
        return NextResponse.json({ error: result.error?.message ?? "Internal Server Error" }, { status: 500 });
    }

    return NextResponse.json({
        images: result.data.map(toApiTranslationTaskImage),
    });
}
