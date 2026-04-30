import { isValidImage } from "@/lib/repositories/common";
import { TranslationImageRepository } from "@/lib/repositories/translation-image";
import { TranslationStorageRepository } from "@/lib/repositories/translation-storage";
import { authService } from "@/lib/services/auth/auth-service";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    // 1. 验证用户
    const userResult = await authService.getCurrentUser();
    if (userResult.error) {
        return NextResponse.json({ error: userResult.error.message }, { status: 401 });
    }

    const user = userResult.data;
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. 获取用户已完成翻译的图片
    const supabase = await createClient();
    const imageRepo = new TranslationImageRepository(supabase);
    const historyResult = await imageRepo.getUserCompletedImages(user.id);
    if (historyResult.error) {
        return NextResponse.json({ error: historyResult.error.message }, { status: 500 });
    }

    const rows = historyResult.data ?? [];
    const resultPaths = rows.filter(isValidImage).map((item) => item.resultImagePath!);

    if (resultPaths.length === 0) {
        return NextResponse.json({ images: [] });
    }

    const storageRepo = new TranslationStorageRepository(supabase);
    const signedUrlsResult = await storageRepo.createSignedUrls(resultPaths, 3600);
    if (signedUrlsResult.error || !signedUrlsResult.data) {
        return NextResponse.json(
            { error: signedUrlsResult.error?.message ?? "Failed to create signed URLs" },
            { status: 500 },
        );
    }
    const signedUrls = signedUrlsResult.data;

    const images = rows.map((item, index) => ({
        id: item.id,
        taskId: item.taskId,
        imageIndex: item.imageIndex,
        createdAt: item.createdAt,
        url: signedUrls[index] ?? "",
    }));

    return NextResponse.json({ images: images.filter((item) => item.url) });
}
