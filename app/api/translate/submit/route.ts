import { TranslationImageRepository } from "@/biz/repositories/translate/translation-image";
import { TranslationStorageRepository } from "@/biz/repositories/translate/translation-storage";
import { TranslationTaskRepository } from "@/biz/repositories/translate/translation-task";
import { UserRepository } from "@/biz/repositories/auth/user-repository";
import { TranslationService } from "@/biz/services/translate/translation-service";
import { TranslationConfig } from "@/types/do/translation-config";
import { CHECK_PARAM_ERROR_CODE, CREDIT_BALANCE_NOT_ENOUGH, SUCCESS_CODE, UNAUTHORIZED_ERROR_CODE } from "@/types/dto/response";
import { createServerClient } from "@/biz/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { CreditService } from "@/biz/services/credit/credit-service";
import { TopUpConfigRepository } from "@/biz/repositories/topup/topup-config";
import { UserTransactionsRepository } from "@/biz/repositories/topup/user-transactions";
import { PricingConfigRepository } from "@/biz/repositories/pricing/pricing-config";
import { UserCreditsRepository } from "@/biz/repositories/credit/user-credits";
import { AuthService } from "@/biz/services/auth/auth-service";
import { createServiceRoleClient } from "@/biz/utils/supabase/admin";
import { randomUUID } from "crypto";
import { getWorkflowBaseUrl } from "@/biz/utils/url";

export async function POST(request: NextRequest) {
    // 1. 验证用户登录
    const supabase = await createServerClient();
    const authService = new AuthService(new UserRepository(supabase));
    const userResult = await authService.getCurrentUser();
    if (userResult.error || !userResult.data) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // 1. 解析请求 (支持多图片)
    const formData = await request.formData();
    const images = formData.getAll("images") as File[];
    const configStr = formData.get("config") as string;
    if (images.length === 0) {
        return NextResponse.json({ error: "no images" }, { status: 400 });
    }
    let config: TranslationConfig;
    try {
        config = JSON.parse(configStr) as TranslationConfig;
    } catch (err) {
        return NextResponse.json({ error: 'config invalid' }, { status: 400 });
    }

    // 2. 计算&冻结积分
    const serviceRoleClient = createServiceRoleClient();
    const creditService = new CreditService(
        new TopUpConfigRepository(supabase),
        new UserTransactionsRepository(supabase),
        new PricingConfigRepository(supabase),
        new UserCreditsRepository(serviceRoleClient),
    );
    // 计算积分
    const creditResult = await creditService.estimateCreditCost(images.length, config);
    if (creditResult.error) {
        return NextResponse.json({ error: "Failed to Calculate Credits" }, { status: 500 });
    }
    // 冻结积分
    const taskId = randomUUID();
    const frozenResult = await creditService.freezeTaskCredits(userResult.data.id, taskId, creditResult.data!);
    if (frozenResult.code === CREDIT_BALANCE_NOT_ENOUGH) {
        return NextResponse.json({ error: "Not Enough Credits" }, { status: 500 });
    }
    if (frozenResult.error) {
        return NextResponse.json({ error: frozenResult.error.message }, { status: 500 });
    }

    // 3. 创建任务、上传图片并保存记录
    const translationService = new TranslationService(
        new UserRepository(supabase),
        new TranslationTaskRepository(supabase),
        new TranslationImageRepository(supabase),
        new TranslationStorageRepository(supabase),
        new PricingConfigRepository(supabase),
    );
    const submitResult = await translationService.submitTranslationTask(taskId, images, config);
    if (submitResult.code === UNAUTHORIZED_ERROR_CODE) {
        // TODO 如果失败，需要refundcredits，但此时没有imageId
        return NextResponse.json({ error: submitResult.error!.message }, { status: 401 });
    }
    if (submitResult.code === CHECK_PARAM_ERROR_CODE) {
        return NextResponse.json({ error: submitResult.error!.message }, { status: 400 });
    }
    if (submitResult.code !== SUCCESS_CODE || !submitResult.data) {
        return NextResponse.json({ error: submitResult.error?.message ?? 'Internal Server Error' }, { status: 500 });
    }

    // 4. 调用workflow，发起翻译流程
    const workflowResponse = await fetch(`${getWorkflowBaseUrl()}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            userId: userResult.data.id,
            taskId: submitResult.data,
        }),
    });
    let workflowResult: { success?: boolean; message?: string };
    try {
        workflowResult = await workflowResponse.json();
    } catch {
        console.error("Failed to parse workflow response");
        return NextResponse.json({ error: "Failed to start translation workflow" }, { status: 500 });
    }
    if (!workflowResponse.ok || !workflowResult.success) {
        console.error("Failed to start workflow:", workflowResult.message ?? workflowResponse.statusText);
        return NextResponse.json(
            { error: workflowResult.message ?? "Failed to start translation workflow" },
            { status: 500 },
        );
    }

    // 5. 返回任务 ID
    return NextResponse.json({ taskId: submitResult.data }, { status: 200 });
}
