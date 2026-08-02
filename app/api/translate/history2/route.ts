import { TranslationImageRepository } from "@/biz/repositories/translate/translation-image";
import { TranslationStorageRepository } from "@/biz/repositories/translate/translation-storage";
import { TranslationTaskRepository } from "@/biz/repositories/translate/translation-task";
import { UserRepository } from "@/biz/repositories/auth/user-repository";
import { TranslationHistoryRange, TranslationService } from "@/biz/services/translate/translation-service";
import { createServerClient } from "@/biz/utils/supabase/server";
import { ApiGetTranslationTaskResponse } from "@/types/api/translation-task";
import { ApiTranslationTaskImage } from "@/types/api/translation-image";
import { SUCCESS_CODE, UNAUTHORIZED_ERROR_CODE } from "@/types/dto/response";
import { TranslationTaskDetailView } from "@/types/dto/translation-task";
import { TranslationImageView } from "@/types/dto/translation-image";
import { TaskStatus } from "@/types/do/translation-task";
import { NextRequest, NextResponse } from "next/server";
import { PricingConfigRepository } from "@/biz/repositories/pricing/pricing-config";

const VALID_STATUSES: TaskStatus[] = ["pending", "processing", "completed", "failed", "partial"];
const VALID_RANGES: TranslationHistoryRange[] = ["1d", "7d", "1m", "all"];

function toApiTranslationTaskImage(img: TranslationImageView): ApiTranslationTaskImage {
    return {
        id: img.id,
        status: img.status,
        filename: img.filename,
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
        config: view.config,
        images: view.images.map(toApiTranslationTaskImage),
    };
}

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const statusParam = searchParams.get("status");
    const rangeParam = searchParams.get("range") ?? "all";

    if (statusParam !== null && !VALID_STATUSES.includes(statusParam as TaskStatus)) {
        return NextResponse.json(
            { error: `Invalid status. Expected one of: ${VALID_STATUSES.join(", ")}` },
            { status: 400 },
        );
    }
    if (!VALID_RANGES.includes(rangeParam as TranslationHistoryRange)) {
        return NextResponse.json(
            { error: `Invalid range. Expected one of: ${VALID_RANGES.join(", ")}` },
            { status: 400 },
        );
    }

    const supabase = await createServerClient();
    const result = await TranslationService.fromSupabase(supabase).getUserTranslationHistoryByTasks({
        status: statusParam as TaskStatus | undefined,
        range: rangeParam as TranslationHistoryRange,
    });

    if (result.code === UNAUTHORIZED_ERROR_CODE) {
        return NextResponse.json({ error: "UnAuthorized", data: null }, { status: 401 });
    }
    if (result.code !== SUCCESS_CODE || result.data === null) {
        return NextResponse.json({ error: "Internal Server Error", data: null }, { status: 500 });
    }

    const data: ApiGetTranslationTaskResponse[] = result.data.map(toApiGetTranslationTaskResponse);
    return NextResponse.json({ error: null, data: data });
}
