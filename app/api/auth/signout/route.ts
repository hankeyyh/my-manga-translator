/**
 * API Route: 用户登出
 * POST /api/auth/signout
 *
 * 功能：
 * 1. 登出当前用户
 */

import { NextResponse } from "next/server";
import { authService } from "@/lib/services/auth/auth-service";
import { SignOutResponse } from "@/types/api/auth";
import { SUCCESS_CODE } from "@/types/api/common";

export async function POST() {
    const authResponse = await authService.signOut();
    if (authResponse.error) {
        const response: SignOutResponse = { code: 'SIGNOUT_FAILED', message: authResponse.error.message, data: null };
        return NextResponse.json(response, { status: 400 });
    }
    const response: SignOutResponse = { code: SUCCESS_CODE, message: 'OK', data: null };
    return NextResponse.json(response, { status: 200 });
}