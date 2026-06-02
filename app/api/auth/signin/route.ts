/**
 * API Route: 用户登录
 * POST /api/auth/signin
 *
 * 功能：
 * 1. 使用邮箱和密码登录
 */

import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/biz/services/auth/auth-service";
import { UserRepository } from "@/biz/repositories/auth/user-repository";
import { createServerClient } from "@/biz/utils/supabase/server";
import { SignInResponse } from "@/types/api/auth";
import { API_SUCCESS_CODE } from "@/types/api/response";


export async function POST(request: NextRequest) {
    const body = await request.json();
    const { email, password } = body;
    if (!email || !password) {
        const response: SignInResponse = { code: 'VALIDATION_ERROR', message: 'Email and password are required', data: null };
        return NextResponse.json(response, { status: 400 });
    }
    const supabase = await createServerClient();
    const authService = new AuthService(new UserRepository(supabase));
    const authResponse = await authService.signIn(email, password);
    if (authResponse.error) {
        const response: SignInResponse = { code: 'SIGNIN_FAILED', message: authResponse.error.message, data: null };
        return NextResponse.json(response, { status: 400 });
    }
    const userEntity = authResponse.data!;
    const response: SignInResponse = {
        code: API_SUCCESS_CODE,
        message: 'OK',
        data: {
            user: { id: userEntity.id, email: userEntity.email }
        }
    };
    return NextResponse.json(response, { status: 200 });
}