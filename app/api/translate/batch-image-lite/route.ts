import { TranslationService } from "@/biz/services/translate/translation-service";
import { createServerClient } from "@/biz/utils/supabase/server";
import { ApiTranslationTaskLiteImage } from "@/types/api/translation-image";
import { SUCCESS_CODE, UNAUTHORIZED_ERROR_CODE } from "@/types/dto/response";
import { TranslationImageLiteView } from "@/types/dto/translation-image";
import { NextRequest, NextResponse } from "next/server";

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

export async function GET(request: NextRequest) {
    const imageIdStr = request.nextUrl.searchParams.get("imageIds");
    if (!imageIdStr) {
        return NextResponse.json({ error: "Need ImageIds" }, { status: 400 });
    }
    const imageIds = imageIdStr.split(",").map((id) => id.trim()).filter(Boolean);
    if (imageIds.length === 0) {
        return NextResponse.json({ error: "Need ImageIds" }, { status: 400 });
    }

    const supabase = await createServerClient();
    const result = await TranslationService.fromSupabase(supabase).batchGetTranslationImageLite(imageIds);
    if (result.code === UNAUTHORIZED_ERROR_CODE) {
        return NextResponse.json({ error: "UnAuthorized" }, { status: 401 });
    }
    if (result.code !== SUCCESS_CODE || result.data === null) {
        return NextResponse.json({ error: result.error?.message ?? "Internal Server Error" }, { status: 500 });
    }

    return NextResponse.json({
        images: result.data.map(toApiTranslationTaskLiteImage),
    });
}
