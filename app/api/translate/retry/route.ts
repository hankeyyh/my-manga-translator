import { UserRepository } from "@/biz/repositories/auth/user-repository";
import { AuthService } from "@/biz/services/auth/auth-service";
import { retryTranslationWorkflow } from "@/biz/utils/cloudflare";
import { createServerClient } from "@/biz/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    // 0. 验证用户登录
    const supabase = await createServerClient();
    const authService = new AuthService(new UserRepository(supabase));
    const userResult = await authService.getCurrentUser();
    if (userResult.error || !userResult.data) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const { taskId, imageIds } = body as { taskId: string, imageIds: string[] };

    // 1. 启动workflow
    const workflowResponse = await retryTranslationWorkflow({ userId: userResult.data.id, taskId: taskId, imageIds: imageIds }); 
    if (!workflowResponse.ok) {
        console.error(`Failed to start workflow, status: ${workflowResponse.status}, error: ${workflowResponse.statusText}`);
        return NextResponse.json({ error: "Failed to start retry translation workflow" }, { status: 500 });
    }
    return NextResponse.json({ error: null }, { status: 200 });
}

/**
 * click 重试
 * 轮询task
 */

/**
 * LEARN
 * workflow 能否不通过binding fetch 触发，通过普通fetch公网url触发
 */