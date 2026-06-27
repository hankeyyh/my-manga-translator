import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/biz/services/auth/auth-service";
import { UserRepository } from "@/biz/repositories/auth/user-repository";
import { createServerClient } from "@/biz/utils/supabase/server";
import { API_SUCCESS_CODE } from "@/types/api/response";
import { SignInOAuthResponse } from "@/types/api/auth";

export async function POST(request: NextRequest) {
    const body = await request.json();
    const { provider } = body as { provider: string };
    if (provider === "google") {
        const supabase = await createServerClient();
        const authService = new AuthService(new UserRepository(supabase));
        const result = await authService.signInWithGoogle();
        if (result.error) {
            const response: SignInOAuthResponse = { code: 'SIGNIN_WITH_OAUTH_FAILED', message: result.error.message, data: null };
            return NextResponse.json(response, { status: 400 });
        }
        const response: SignInOAuthResponse = { code: API_SUCCESS_CODE, message: 'OK', data: { url: result.data } }
        return NextResponse.json(response, { status: 200 });
    } else {
        const response: SignInOAuthResponse = { code: 'INVALID_PROVIDER', message: '不支持的OAuth Provider', data: null };
        return NextResponse.json(response, { status: 400 });
    }
}