import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/biz/services/auth/auth-service";
import { UserRepository } from "@/biz/repositories/auth/user-repository";
import { createServerClient } from "@/biz/utils/supabase/server";
import { API_SUCCESS_CODE } from "@/types/api/response";

export async function POST(request: NextRequest) {
    const body = await request.json();
    const { provider } = body;
    if (provider === "google") {
        const supabase = await createServerClient();
        const authService = new AuthService(new UserRepository(supabase));
        const result = await authService.signInWithGoogle();
        if (result.error) {
            return NextResponse.json({ code: 'SIGNIN_WITH_OAUTH_FAILED', message: result.error.message, data: null }, { status: 400 });
        }
        return NextResponse.json({ code: API_SUCCESS_CODE, message: 'OK', data: { url: result.data } }, { status: 200 });
    } else {
        return NextResponse.json({ code: 'INVALID_PROVIDER', message: '不支持的OAuth Provider', data: null }, { status: 400 });
    }
}