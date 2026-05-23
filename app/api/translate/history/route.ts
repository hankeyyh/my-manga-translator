import { TranslationImageRepository } from "@/lib/repositories/translate/translation-image";
import { TranslationStorageRepository } from "@/lib/repositories/translate/translation-storage";
import { TranslationTaskRepository } from "@/lib/repositories/translate/translation-task";
import { UserRepository } from "@/lib/repositories/auth/user-repository";
import { TranslationService } from "@/lib/services/translate/translation-service";
import { createServerClient } from "@/lib/utils/supabase/server";
import { ApiTranslationTaskImage } from "@/types/api/translation-image";
import { SUCCESS_CODE, UNAUTHORIZED_ERROR_CODE } from "@/types/do/common";
import { TranslationImageView } from "@/types/dto/translation-image";
import { NextResponse } from "next/server";

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

export async function GET() {
    const supabase = await createServerClient();
    const translationService = new TranslationService(
        new UserRepository(supabase),
        new TranslationTaskRepository(supabase),
        new TranslationImageRepository(supabase),
        new TranslationStorageRepository(supabase),
    );

    const result = await translationService.getUserTranslationHistory();
    if (result.code === UNAUTHORIZED_ERROR_CODE) {
        return NextResponse.json({ error: result.error!.message }, { status: 401 });
    }
    if (result.code !== SUCCESS_CODE || result.data === null) {
        return NextResponse.json({ error: result.error?.message ?? "Internal Server Error" }, { status: 500 });
    }

    return NextResponse.json({
        images: result.data.map(toApiTranslationTaskImage),
    });
}
