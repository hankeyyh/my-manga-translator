/**
 * 认证服务
 * 负责用户认证、会话管理和用户信息操作
 * 使用 Repository 层实现业务逻辑与数据访问的分离
 */

import { UserRepository } from '@/biz/repositories/auth/user-repository';
import { UserEntity } from "@/types/entity/user";
import { Result } from "@/types/do/response";
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

export interface UserMetadata {
    name?: string;
    avatar?: string;
    [key: string]: any;
}

export class AuthService {
    constructor(private userRepo: UserRepository) { }

    async signUp(email: string, password: string, metadata?: UserMetadata): Promise<Result<UserEntity>> {
        const emailValidation = UserEntity.validateEmail(email);
        if (!emailValidation.valid) {
            return {
                data: null,
                error: new Error(emailValidation.error!),
            };
        }
        const redirectTo = emailConfirmRedirectUrl();
        return await this.userRepo.signUp(email, password, metadata, redirectTo);
    }

    async signIn(email: string, password: string): Promise<Result<UserEntity>> {
        return await this.userRepo.signIn(email, password);
    }

    async signInWithGoogle(): Promise<Result<string | null>> {
        return await this.userRepo.signInWithOAuth("google", {
            redirectTo: getConfirmUrl('/'),
            queryParams: getGoogleOAuthQueryParams(),
        });
    }

    async signOut(): Promise<Result<void>> {
        return await this.userRepo.signOut();
    }

    async getCurrentUser(): Promise<Result<UserEntity>> {
        return await this.userRepo.getCurrentUser();
    }

    async verifyOtp(tokenHash: string, type: EmailOtpType): Promise<Result<UserEntity>> {
        return await this.userRepo.verifyOtp(tokenHash, type);
    }

    async exchangeCodeForSession(code: string): Promise<Result<UserEntity>> {
        return await this.userRepo.exchangeCodeForSession(code);
    }
}
