import { AuthService } from "@/biz/services/auth/auth-service";
import { UserRepository } from "@/biz/repositories/auth/user-repository";
import { createServerClient } from "@/biz/utils/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";
import { CreditService } from "@/biz/services/credit/credit-service";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const token_hash = searchParams.get("token_hash");
    const type = searchParams.get("type") as EmailOtpType | null;
    const code = searchParams.get('code');
    const next = searchParams.get("next") ?? "/v2";

    console.log("token_hash", token_hash);
    console.log("type", type);
    console.log("code", code);
    console.log("next", next);

    const supabase = await createServerClient();
    const authService = new AuthService(new UserRepository(supabase));
    let isSuccess: boolean = false;

    if (token_hash && type) {
        // Email OTP 验证
        const { error } = await authService.verifyOtp(token_hash, type);
        if (!error) {
            isSuccess = true;
        } else {
            console.error("verifyOtp error", error);
            redirect(`/auth/error?error=${error?.message}`);
        }
    } else if (code) {
        // OAuth 验证
        // 出现过报错：supabase PKCE code verifier not found in storage。网上建议增加cookies.getAll，但之后没有复现该问题
        // 参见：https://github.com/orgs/supabase/discussions/21183#discussioncomment-12013759
        (await cookies()).getAll();
        const { error } = await authService.exchangeCodeForSession(code);
        if (!error) {
            isSuccess = true;
        } else {
            console.error("exchangeCodeForSession error", error);
            redirect(`/auth/error?error=${error?.message}`);
        }
    }

    if (isSuccess) {
        // 发放bonus credit
        const user = await authService.getCurrentUser();
        if (user.data) {
            await CreditService.fromSupabase(supabase).grantSignupBonus(user.data.id);
        }
        redirect(next);
    }

    // redirect the user to an error page with some instructions
    redirect(`/auth/error?error=No token hash or type`);
}
