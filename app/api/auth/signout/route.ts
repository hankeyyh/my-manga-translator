/**
 * API Route: 用户登出
 * POST /api/auth/signout
 *
 * 功能：
 * 1. 登出当前用户
 */

import { NextResponse } from "next/server";
import { AuthService } from "@/biz/services/auth/auth-service";
import { UserRepository } from "@/biz/repositories/auth/user-repository";
import { createServerClient } from "@/biz/utils/supabase/server";
import { SignOutResponse } from "@/types/api/auth";
import { API_SUCCESS_CODE } from "@/types/api/response";

export async function POST() {
    const supabase = await createServerClient();
    const authService = new AuthService(new UserRepository(supabase));
    const authResponse = await authService.signOut();
    if (authResponse.error) {
        const response: SignOutResponse = { code: 'SIGNOUT_FAILED', message: authResponse.error.message, data: null };
        return NextResponse.json(response, { status: 400 });
    }
    const response: SignOutResponse = { code: API_SUCCESS_CODE, message: 'OK', data: null };
    return NextResponse.json(response, { status: 200 });
}