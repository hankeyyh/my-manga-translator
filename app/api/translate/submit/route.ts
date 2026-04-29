import { TranslationImageRepository } from "@/lib/repositories/translation-image";
import { TranslationStorageRepository } from "@/lib/repositories/translation-storage";
import { TranslationTaskRepository } from "@/lib/repositories/translation-task";
import { authService } from "@/lib/services/auth/auth-service";
import { CreateImageParams, TranslationConfig } from "@/lib/services/translate/translation-types";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    // 1. 验证用户登录
    const result = await authService.getCurrentUser()
    if (result.error) {
        return NextResponse.json({ error: result.error.message }, { status: 401 });
    }
    const user = result.data;
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. 解析请求 (支持多图片)
    const formData = await request.formData();
    const images = formData.getAll("images") as File[];
    const configStr = formData.get("config") as string;

    if (!images || images.length === 0) {
        return NextResponse.json({ error: 'No images provided' }, { status: 400 });
    }
    for (const image of images) {
        if (image.size > 10 * 1024 * 1024) {
            return NextResponse.json({ error: 'Image size too large, max size is 10MB' }, { status: 400 });
        }
    }

    const config = JSON.parse(configStr) as TranslationConfig;

    // 3. 创建任务记录
    const supabase = await createClient();
    const taskRepo = new TranslationTaskRepository(supabase);
    const taskResult = await taskRepo.createTask({
        userId: user.id,
        totalImages: images.length,
        config,
    });
    if (taskResult.error) {
        console.error(taskResult.error);
        return NextResponse.json({ error: taskResult.error.message }, { status: 500 });
    }
    const task = taskResult.data!;

    // 4. 批量上传图片到 Storage 并创建图片记录
    const storageRepo = new TranslationStorageRepository(supabase);
    const imageRepo = new TranslationImageRepository(supabase);
    const imageParams: CreateImageParams[] = [];
    for (let i = 0; i < images.length; i++) {
        const uploadResult = await storageRepo.uploadOriginalImage(user.id, task.id, i, images[i]);
        if (uploadResult.error) {
            return NextResponse.json({ error: uploadResult.error.message }, { status: 500 });
        }
        imageParams.push({
            taskId: task.id,
            imageIndex: i,
            originalImagePath: uploadResult.data!,
            originalImageSize: images[i].size,
        });
    }
    const imagesResult = await imageRepo.createImages(imageParams);
    if (imagesResult.error) {
        console.error(imagesResult.error);
        return NextResponse.json({ error: imagesResult.error.message }, { status: 500 });
    }

    // 5. 返回任务 ID
    return NextResponse.json({ taskId: task.id }, { status: 200 });
}