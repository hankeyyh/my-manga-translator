import { TranslationImageRepository } from "@/biz/repositories/translate/translation-image";
import { TranslationStorageRepository } from "@/biz/repositories/translate/translation-storage";
import { TranslationTaskRepository } from "@/biz/repositories/translate/translation-task";
import { UserRepository } from "@/biz/repositories/auth/user-repository";
import { TranslationService } from "@/biz/services/translate/translation-service";
import { createServerClient } from "@/biz/utils/supabase/server";
import { ApiGetTranslationTaskResponse } from "@/types/api/translation-task";
import { ApiTranslationTaskImage } from "@/types/api/translation-image";
import { SUCCESS_CODE, UNAUTHORIZED_ERROR_CODE } from "@/types/do/common";
import { TranslationTaskDetailView } from "@/types/dto/translation-task";
import { TranslationImageView } from "@/types/dto/translation-image";
import { NextRequest, NextResponse } from "next/server";

function toApiTranslationTaskImage(img: TranslationImageView): ApiTranslationTaskImage {
    return {
        id: img.id,
        status: img.status,
        taskId: img.taskId,
        imageIndex: img.imageIndex,
        originalImageUrl: img.originalImageUrl,
        resultImageUrl: img.resultImageUrl,
        errorMessage: img.errorMessage,
    };
}

function toApiGetTranslationTaskResponse(view: TranslationTaskDetailView): ApiGetTranslationTaskResponse {
    return {
        id: view.id,
        status: view.status,
        total_images: view.totalImages,
        completed_images: view.completedImages,
        failed_images: view.failedImages,
        progress: view.progress,
        created_at: view.createdAt,
        completed_at: view.completedAt,
        images: view.images.map(toApiTranslationTaskImage),
    };
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ taskId: string; }>; }) {
    const { taskId } = await params;

    const supabase = await createServerClient();
    const translationService = new TranslationService(
        new UserRepository(supabase),
        new TranslationTaskRepository(supabase),
        new TranslationImageRepository(supabase),
        new TranslationStorageRepository(supabase),
    );

    const result = await translationService.getTranslationTaskDetail(taskId);
    if (result.code === UNAUTHORIZED_ERROR_CODE) {
        return NextResponse.json({ error: result.error!.message }, { status: 401 });
    }
    if (result.code !== SUCCESS_CODE || !result.data) {
        return NextResponse.json({ error: result.error?.message ?? "Internal Server Error" }, { status: 500 });
    }

    return NextResponse.json(toApiGetTranslationTaskResponse(result.data));
}
