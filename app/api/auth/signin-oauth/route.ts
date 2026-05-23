import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/services/auth/auth-service";
import { SUCCESS_CODE } from "@/types/api/common";

export async function POST(request: NextRequest) {
    const body = await request.json();
    const { provider } = body;
    if (provider === "google") {
        const result = await authService.signInWithGoogle();
        if (result.error) {
            return NextResponse.json({ code: 'SIGNIN_WITH_OAUTH_FAILED', message: result.error.message, data: null }, { status: 400 });
        }
        return NextResponse.json({ code: SUCCESS_CODE, message: 'OK', data: { url: result.data } }, { status: 200 });
    } else {
        return NextResponse.json({ code: 'INVALID_PROVIDER', message: '不支持的OAuth Provider', data: null }, { status: 400 });
    }
}