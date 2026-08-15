import { TranslationImageRepository } from "@/biz/repositories/translate/translation-image";
import { TranslationStorageRepository } from "@/biz/repositories/translate/translation-storage";
import { TranslationTaskRepository } from "@/biz/repositories/translate/translation-task";
import { UserRepository } from "@/biz/repositories/auth/user-repository";
import { TranslationService } from "@/biz/services/translate/translation-service";
import { createServerClient } from "@/biz/utils/supabase/server";
import { ApiGetTranslationTaskLiteResponse } from "@/types/api/translation-task";
import { ApiTranslationTaskLiteImage } from "@/types/api/translation-image";
import { SUCCESS_CODE, UNAUTHORIZED_ERROR_CODE } from "@/types/dto/response";
import { TranslationTaskLiteView } from "@/types/dto/translation-task";
import { TranslationImageLiteView } from "@/types/dto/translation-image";
import { NextRequest, NextResponse } from "next/server";
import { PricingConfigRepository } from "@/biz/repositories/pricing/pricing-config";

function toApiTranslationTaskLiteImage(img: TranslationImageLiteView): ApiTranslationTaskLiteImage {
    return {
        id: img.id,
        status: img.status,
        filename: img.filename,
        taskId: img.taskId,
        imageIndex: img.imageIndex,
        resultImageUrl: img.resultImageUrl,
        errorMessage: img.errorMessage,
    };
}

function toApiGetTranslationTaskLiteResponse(view: TranslationTaskLiteView): ApiGetTranslationTaskLiteResponse {
    return {
        id: view.id,
        status: view.status,
        total_images: view.totalImages,
        completed_images: view.completedImages,
        failed_images: view.failedImages,
        progress: view.progress,
        created_at: view.createdAt,
        completed_at: view.completedAt,
        images: view.images.map(toApiTranslationTaskLiteImage),
    };
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ taskId: string; }>; }) {
    const { taskId } = await params;

    const supabase = await createServerClient();
    const result = await TranslationService.fromSupabase(supabase).getTranslationTaskLiteDetail(taskId);
    if (result.code === UNAUTHORIZED_ERROR_CODE) {
        return NextResponse.json({ error: "UnAuthorized" }, { status: 401 });
    }
    if (result.code !== SUCCESS_CODE || !result.data) {
        return NextResponse.json({ error: result.error?.message ?? "Internal Server Error" }, { status: 500 });
    }

    return NextResponse.json(toApiGetTranslationTaskLiteResponse(result.data));
}
