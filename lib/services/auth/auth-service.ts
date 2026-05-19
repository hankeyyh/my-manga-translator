/**
 * 认证服务
 * 负责用户认证、会话管理和用户信息操作
 * 使用 Repository 层实现业务逻辑与数据访问的分离
 */

import { createServerClient } from "@/lib/utils/supabase/server";
import type {
    AuthService,
    UserMetadata,
} from './auth-types';
import { UserRepository } from '@/lib/repositories/auth/user-repository';
import { UserEntity } from '@/lib/entities/user-entity';
import { Result } from "@/types/do/common";
import { EmailOtpType } from '@supabase/supabase-js';

// 设置confirm邮件中的next重定向链接
function emailConfirmRedirectUrl(): string | undefined {
    const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
    return base;
}

// oauth登录后，重定向到confirm url
function getConfirmUrl(next: string): string {
    const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
    return `${base}/api/auth/confirm?next=${encodeURIComponent(next)}`;
}

function getGoogleOAuthQueryParams(): { prompt?: string; } {
    if (process.env.NODE_ENV === 'development') {
        // 每次登录显示账号选择，授权页面
        return { prompt: 'consent select_account' };
    } else {
        return {};
    }
}
/**
 * 认证服务单例（使用 Repository 层）
 */
export const authService: AuthService = {
    async signUp(email: string, password: string, metadata?: UserMetadata): Promise<Result<UserEntity>> {
        // 验证邮箱格式
        const emailValidation = UserEntity.validateEmail(email);
        if (!emailValidation.valid) {
            return {
                data: null,
                error: new Error(emailValidation.error!),
            };
        }
        const redirectTo = emailConfirmRedirectUrl();

        // 创建认证用户
        const supabase = await createServerClient();
        const userRepo = new UserRepository(supabase);
        return await userRepo.signUp(email, password, metadata, redirectTo);
    },

    async signIn(email: string, password: string): Promise<Result<UserEntity>> {
        const supabase = await createServerClient();
        const userRepo = new UserRepository(supabase);
        return await userRepo.signIn(email, password);
    },

    async signInWithGoogle(): Promise<Result<string | null>> {
        const supabase = await createServerClient();
        const userRepo = new UserRepository(supabase);
        const result = await userRepo.signInWithOAuth("google", {
            redirectTo: getConfirmUrl('/'),
            queryParams: getGoogleOAuthQueryParams(),
        });
        return result;
    },

    async signOut(): Promise<Result<void>> {
        const supabase = await createServerClient();
        const userRepo = new UserRepository(supabase);
        return await userRepo.signOut();
    },

    async getCurrentUser(): Promise<Result<UserEntity>> {
        const supabase = await createServerClient();
        const userRepo = new UserRepository(supabase);
        return await userRepo.getCurrentUser();
    },


    async verifyOtp(tokenHash: string, type: EmailOtpType): Promise<Result<UserEntity>> {
        const supabase = await createServerClient();
        const userRepo = new UserRepository(supabase);
        return await userRepo.verifyOtp(tokenHash, type);
    },

    async exchangeCodeForSession(code: string): Promise<Result<UserEntity>> {
        const supabase = await createServerClient();
        const userRepo = new UserRepository(supabase);
        return await userRepo.exchangeCodeForSession(code);
    },
};
