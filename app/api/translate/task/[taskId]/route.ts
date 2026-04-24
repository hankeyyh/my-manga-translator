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
    const taskResult = await taskRepo.getTask(taskId);
    if (taskResult.error) {
        return NextResponse.json({ error: taskResult.error.message }, { status: 500 });
    }
    const taskDetail = taskResult.data;
    if (!taskDetail) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    if (taskDetail.userId !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 401 });
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
    });
}