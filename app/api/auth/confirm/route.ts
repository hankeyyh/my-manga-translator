import { AuthService } from "@/biz/services/auth/auth-service";
import { UserRepository } from "@/biz/repositories/auth/user-repository";
import { createServerClient } from "@/biz/utils/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse, type NextRequest } from "next/server";
import { CreditService } from "@/biz/services/credit/credit-service";
import { createServiceRoleClient } from "@/biz/utils/supabase/admin";
import { UserEntity } from "@/types/entity/user";

async function grantSignupBonusIfNeeded(user: UserEntity | null) {
    if (!user) return;
    const serviceSupabase = createServiceRoleClient();
    const bonusResult = await CreditService.fromSupabase(serviceSupabase).grantSignupBonus(user.id);
    if (bonusResult.error) {
        console.error(`grantSignupBonusIfNeeded, service.grantSignupBonus fail, error: ${bonusResult.error.message}`);
    }
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const token_hash = searchParams.get("token_hash");
    const type = searchParams.get("type") as EmailOtpType | null;
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/";
    const wantsJson = request.headers.get("accept")?.includes("application/json") ?? false;

    const supabase = await createServerClient();
    const authService = new AuthService(new UserRepository(supabase));

    if (token_hash && type) {
        const { data, error } = await authService.verifyOtp(token_hash, type);
        if (error) {
            if (wantsJson) {
                return NextResponse.json(
                    { ok: false, error: error.message, next },
                    { status: 400 },
                );
            }
            redirect(`/auth/error?error=${encodeURIComponent(error.message)}`);
        }

        console.debug(`/auth/confirm, email ok, userId: ${data?.id}`);
        await grantSignupBonusIfNeeded(data);

        if (wantsJson) {
            return NextResponse.json({ ok: true, next });
        }
        redirect(next);
    }

    if (code) {
        // OAuth：保持服务端 redirect，不经中间页
        (await cookies()).getAll();
        const { data, error } = await authService.exchangeCodeForSession(code);
        if (error) {
            console.error("exchangeCodeForSession error", error);
            redirect(`/auth/error?error=${encodeURIComponent(error.message)}`);
        }

        console.debug(`/auth/confirm, oauth ok, userId: ${data?.id}`);
        await grantSignupBonusIfNeeded(data);
        redirect(next);
    }

    if (wantsJson) {
        return NextResponse.json(
            { ok: false, error: "No token hash or type", next },
            { status: 400 },
        );
    }
    redirect(`/auth/error?error=${encodeURIComponent("No token hash or type")}`);
}
