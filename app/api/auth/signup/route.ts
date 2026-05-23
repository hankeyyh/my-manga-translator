/**
 * API Route: 用户注册
 * POST /api/auth/signup
 *
 * 功能：
 * 1. 在服务端创建新用户
 * 2. 发送邮箱验证邮件
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authService } from '@/lib/services/auth/auth-service';
import type { SignUpResponse } from "@/types/api/auth";
import { SUCCESS_CODE } from "@/types/api/common";
import { UserMapper } from '@/lib/mappers/user-mapper';

// 参数校验
const signUpSchema = z.object({
    email: z.email('Invalid email address'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .max(100, 'Password must be less than 100 characters'),
    metadata: z
        .object({
            name: z.string().optional(),
            avatar: z.url().optional(),
        })
        .optional(),
});

export async function POST(request: NextRequest) {
    // 1. 解析请求体
    const body = await request.json();

    // 2. 验证请求数据
    const validationResult = signUpSchema.safeParse(body);

    if (!validationResult.success) {
        const firstIssue = validationResult.error.issues[0];
        const response: SignUpResponse = {
            code: 'VALIDATION_ERROR',
            message: firstIssue?.message ?? 'Invalid request data',
            data: null,
        };

        return NextResponse.json(response, { status: 400 });
    }

    // 3. 调用注册服务
    const { email, password, metadata } = validationResult.data;
    const authResponse = await authService.signUp(email, password, metadata);

    // 4. 处理注册错误
    if (authResponse.error) {
        const response: SignUpResponse = { code: 'SIGNUP_FAILED', message: authResponse.error.message, data: null };
        return NextResponse.json(response, { status: 400 });
    }

    // 5. 返回成功响应（将 Entity 转换为 JSON 可序列化格式）
    const response: SignUpResponse = {
        code: SUCCESS_CODE,
        message: 'OK',
        data: {
            user: authResponse.data ? UserMapper.toDTO(authResponse.data) : null,
        },
    };

    return NextResponse.json(response, { status: 201 });
}
