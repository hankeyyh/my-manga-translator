import { getCurrentUserInfo } from "@/biz/loaders/get-current-user-info";
import { AuthService } from "@/biz/services/auth/auth-service";
import { CreditService } from "@/biz/services/credit/credit-service";
import { createServiceRoleClient } from "@/biz/utils/supabase/admin";
import { createServerClientForAnonymous } from "@/biz/utils/supabase/server";
import { API_SUCCESS_CODE } from "@/types/api/response";
import { DB_ERROR_CODE, UNAUTHORIZED_ERROR_CODE } from "@/types/dto/response";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const result = await getCurrentUserInfo();
    if (result.error) {
        return NextResponse.json({ code: result.code, error: result.error.message }, { status: 500 });
    }
    // 已登录
    if (result.data) {
        const isAnonymous = result.data.user?.isAnonymous;
        if (isAnonymous) {
            await grantDailyAnonymousBonus(result.data.user?.id!);
        }
        return NextResponse.json({ code: API_SUCCESS_CODE, data: { isAnonymous: isAnonymous } }, { status: 200 });
    }
    // 注册匿名用户
    if (result.code === UNAUTHORIZED_ERROR_CODE) {
        const supabase = await createServerClientForAnonymous();
        const authService = AuthService.fromSupabase(supabase);
        const signInResult = await authService.signInAnonymous();
        if (signInResult.error) {
            return NextResponse.json({ code: DB_ERROR_CODE, error: "Internal Server Error" }, { status: 500 });
        }
        // 发放试用积分
        await grantDailyAnonymousBonus(signInResult.data?.id!);
    }
  
    return NextResponse.json({ code: API_SUCCESS_CODE, data: { isAnonymous: true } }, { status: 200 });
}

async function grantDailyAnonymousBonus(uid: string) {
    const serviceSupabase = createServiceRoleClient();
    await CreditService.fromSupabase(serviceSupabase).grantDailyAnonymousBonus(uid);
}