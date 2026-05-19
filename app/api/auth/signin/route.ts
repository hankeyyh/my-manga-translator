/**
 * API Route: 用户登录
 * POST /api/auth/signin
 *
 * 功能：
 * 1. 使用邮箱和密码登录
 */

import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/services/auth/auth-service";
import { SignInResponse } from '@/types/api';
import { SUCCESS_CODE } from "@/types/api";
import { UserMapper } from "@/lib/mappers/user-mapper";


export async function POST(request: NextRequest) {
    const body = await request.json();
    const { email, password } = body;
    if (!email || !password) {
        const response: SignInResponse = { code: 'VALIDATION_ERROR', message: 'Email and password are required', data: null };
        return NextResponse.json(response, { status: 400 });
    }
    const authResponse = await authService.signIn(email, password);
    if (authResponse.error) {
        const response: SignInResponse = { code: 'SIGNIN_FAILED', message: authResponse.error.message, data: null };
        return NextResponse.json(response, { status: 400 });
    }
    const response: SignInResponse = { code: SUCCESS_CODE, message: 'OK', data: { user: authResponse.data ? UserMapper.toDTO(authResponse.data) : null } };
    return NextResponse.json(response, { status: 200 });
}