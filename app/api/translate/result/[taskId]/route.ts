import { isValidImage } from "@/lib/repositories/common";
import { TranslationStorageRepository } from "@/lib/repositories/translation-storage";
import { TranslationTaskRepository } from "@/lib/repositories/translation-task";
import { authService } from "@/lib/services/auth/auth-service";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
    // 1. 验证用户
    const userResult = await authService.getCurrentUser();
    if (userResult.error) {
        return NextResponse.json({ error: userResult.error.message }, { status: 401 });
    }
    const user = userResult.data;
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. 获取任务 ID
    const { taskId } = await params;

    // 3. 获取任务详情
    const supabase = await createClient();
    const taskRepo = new TranslationTaskRepository(supabase);
    const taskDetailResult = await taskRepo.getTaskWithImages(taskId);
    if (taskDetailResult.error) {
        return NextResponse.json({ error: taskDetailResult.error.message }, { status: 500 });
    }
    const taskDetail = taskDetailResult.data;
    if (!taskDetail) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    if (taskDetail.userId !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 401 });
    }
    if (taskDetail.status !== 'completed') {
        return NextResponse.json({ error: 'Task not completed' }, { status: 400 });
    }

    // 4. 创建签名 URLs
    const storageRepo = new TranslationStorageRepository(supabase);
    const resultImagePaths = taskDetail.images.filter(isValidImage).map((img) => img.resultImagePath!);
    const signedUrlsResult = await storageRepo.createSignedUrls(resultImagePaths, 3600);
    if (signedUrlsResult.error) {
        console.error('❌ Failed to create signed URLs:', signedUrlsResult.error);
        return NextResponse.json({ error: "Failed to create signed URLs: " + signedUrlsResult.error.message }, { status: 500 });
    }
    const signedUrls = signedUrlsResult.data;
    if (!signedUrls) {
        console.error('❌ Signed URLs are null:', resultImagePaths);
        return NextResponse.json({ error: 'Signed URLs are null' }, { status: 500 });
    }

    const resultImages = [];
    let j = 0;
    for (const image of taskDetail.images) {
        if (!isValidImage(image)) {
            continue;
        }
        if (!signedUrls[j]) {
            console.error('❌ Signed URL is empty:', image.resultImagePath);
        }
        resultImages.push({
            id: image.id,
            url: signedUrls[j],
        });
        j++;
    }

    // 4. 返回任务详情
    return NextResponse.json({
        id: taskDetail.id,
        status: taskDetail.status,
        total_images: taskDetail.totalImages,
        completed_images: taskDetail.completedImages,
        failed_images: taskDetail.failedImages,
        progress: taskDetail.progress,
        created_at: taskDetail.createdAt,
        completed_at: taskDetail.completedAt,

        // 图片列表
        resultImages: resultImages,
    });
}

