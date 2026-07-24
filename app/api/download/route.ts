import { UserRepository } from "@/biz/repositories/auth/user-repository";
import { PricingConfigRepository } from "@/biz/repositories/pricing/pricing-config";
import { TranslationImageRepository } from "@/biz/repositories/translate/translation-image";
import { TranslationStorageRepository } from "@/biz/repositories/translate/translation-storage";
import { TranslationTaskRepository } from "@/biz/repositories/translate/translation-task";
import { TranslationService } from "@/biz/services/translate/translation-service";
import { createServerClient } from "@/biz/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const url = new URL(request.url);
    const imageIdsStr = url.searchParams.get("imageIds");
    if (!imageIdsStr) {
        return NextResponse.json({ error: "Image id required" }, { status: 400 });
    }
    const imageIds = imageIdsStr.split(",")
    if (imageIds.length === 0) {
        return NextResponse.json({ error: "Image id required" }, { status: 400 });
    }
    const supabase = await createServerClient();
    const translationService = new TranslationService(
        new UserRepository(supabase),
        new TranslationTaskRepository(supabase),
        new TranslationImageRepository(supabase),
        new TranslationStorageRepository(supabase),
        new PricingConfigRepository(supabase),
    );
    const result = await translationService.downloadResultZip(imageIds);
    if (result.error) {
        return NextResponse.json({ error: "Internal Server Error"}, { status: 500 });
    }
    const zipped = result.data;
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const fileName = `task-${[
        d.getFullYear(),
        pad(d.getMonth() + 1),
        pad(d.getDate()),
        pad(d.getHours()),
        pad(d.getMinutes()),
        pad(d.getSeconds()),
    ].join("-")}.zip`;
    return new NextResponse(Buffer.from(zipped), {
        headers: {
            "Content-Disposition": `attachment; filename=${fileName}`,
            "Content-Type": "application/zip"
        },
        status: 200,
    })
}

/**
 * http header multipart
 * Date 如何格式化输出
 */