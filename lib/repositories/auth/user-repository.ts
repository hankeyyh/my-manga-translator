/**
 * User 仓储
 * 封装 auth.users 的所有认证操作
 */

import type { EmailOtpType, Provider, SupabaseClient } from '@supabase/supabase-js';
import { UserEntity } from '@/lib/entities/user-entity';
import { UserMapper } from '@/lib/mappers/user-mapper';
import { Result } from "@/types/do/common";

// OAuth 登录选项
export type SignInWithOAuthOptions = {
    /** A URL to send the user to after they are confirmed. */
    redirectTo?: string;
    /** A space-separated list of scopes granted to the OAuth application. */
    scopes?: string;
    /** An object of query params */
    queryParams?: { [key: string]: string; };
    /** If set to true does not immediately redirect the current browser context to visit the OAuth authorization page for the provider. */
    skipBrowserRedirect?: boolean;
};

/**
 * User 仓储类
 */
export class UserRepository {
    constructor(private supabase: SupabaseClient) { }

    /**
     * 创建新用户（注册）
     * @param email 邮箱
     * @param password 密码
     * @param metadata 元数据
     * @param emailRedirectTo 邮箱确认重定向地址
     * @returns UserEntity
     */
    async signUp(email: string, password: string, metadata?: Record<string, any>, emailRedirectTo?: string): Promise<Result<UserEntity>> {
        const { data, error } = await this.supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata ?? {},
                ...(emailRedirectTo ? { emailRedirectTo } : {}),
            },
        });

        if (error) {
            return {
                data: null,
                error: new Error(`创建用户失败: ${error.message}`),
            };
        }

        if (!data?.user) {
            return {
                data: null,
                error: new Error('创建用户失败: 未返回用户数据'),
            };
        }

        return {
            data: UserMapper.fromUserToEntity(data.user),
            error: null,
        };
    }

    async signIn(email: string, password: string): Promise<Result<UserEntity>> {
        const { data, error } = await this.supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error('登录失败: ', error);
            return {
                data: null,
                error: new Error(`登录失败: ${error.message}`),
            };
        }

        if (!data?.user) {
            console.error('登录失败: 未返回用户数据');
            return {
                data: null,
                error: new Error('登录失败: 未返回用户数据'),
            };
        }

        return {
            data: UserMapper.fromUserToEntity(data.user),
            error: null,
        };
    }

    async signInWithOAuth(provider: Provider, options?: SignInWithOAuthOptions): Promise<Result<string | null>> {
        const { data, error } = await this.supabase.auth.signInWithOAuth({
            provider,
            options
        });
        if (error) {
            console.error('OAuth 登录失败: ', error);
            return {
                data: null,
                error: new Error(`OAuth 登录失败: ${error.message}`),
            };
        }
        console.debug('OAuth 登录成功: ', data);
        return {
            data: data?.url ?? null,
            error: null,
        };
    }

    async exchangeCodeForSession(code: string): Promise<Result<UserEntity>> {
        const { data, error } = await this.supabase.auth.exchangeCodeForSession(code);
        if (error) {
            console.error('Exchange code for session failed: ', error);
            return {
                data: null,
                error: new Error(`Exchange code for session failed: ${error.message}`),
            };
        }

        return { data: UserMapper.fromUserToEntity(data.user), error: null };
    }

    async signOut(): Promise<Result<void>> {
        const { error } = await this.supabase.auth.signOut();
        if (error) {
            console.error('登出失败: ', error);
            return {
                data: null,
                error: new Error(`登出失败: ${error.message}`),
            };
        }
        return { data: null, error: null };
    }

    /**
     * 获取当前登录用户
     * @returns UserEntity | null
     */
    async getCurrentUser(): Promise<Result<UserEntity>> {
        const { data, error } = await this.supabase.auth.getClaims();

        if (error) {
            console.error('获取当前用户失败: ', error);
            return {
                data: null,
                error: new Error(`获取当前用户失败: ${error.message}`),
            };
        }

        if (!data?.claims) {
            console.error('获取当前用户失败: 未返回用户数据');
            return {
                data: null,
                error: new Error('获取当前用户失败: 未返回用户数据'),
            };
        }

        return {
            data: UserMapper.fromClaimsToEntity(data.claims),
            error: null,
        };
    }

    // 验证邮箱 OTP
    async verifyOtp(tokenHash: string, type: EmailOtpType): Promise<Result<UserEntity>> {
        const { data, error } = await this.supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type,
        });

        if (error) {
            console.error('验证 OTP 失败: ', error);
            return {
                data: null,
                error: new Error(`验证 OTP 失败: ${error.message}`),
            };
        }

        if (!data?.user) {
            console.error('验证 OTP 失败: 未返回用户数据');
            return {
                data: null,
                error: new Error('验证 OTP 失败: 未返回用户数据'),
            };
        }

        return {
            data: UserMapper.fromUserToEntity(data.user),
            error: null,
        };
    }
}

