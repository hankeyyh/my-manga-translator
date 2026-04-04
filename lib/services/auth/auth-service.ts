/**
 * 认证服务
 * 负责用户认证、会话管理和用户信息操作
 * 使用 Repository 层实现业务逻辑与数据访问的分离
 */

import { createClient } from '@/lib/supabase/server';
import type {
  AuthResponse,
  AuthService,
  EmailOtpType,
  OAuthProvider,
  SignInWithOAuthOptions,
  UserMetadata,
  UserUpdateData,
} from './auth-types';
import { UserRepository } from '@/lib/repositories/user-repository';
import { UserEntity } from '@/lib/entities/user-entity';
import { Result } from '@/lib/types';

const NOT_IMPLEMENTED_ERROR: AuthResponse = {
  user: null,
  session: null,
  error: {
    message: 'Not implemented',
    code: 'NOT_IMPLEMENTED',
  },
};

function emailConfirmRedirectUrl(): string | undefined {
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
  return base;
}

/**
 * 认证服务单例（使用 Repository 层）
 */
export const authService: AuthService = {
  async signUp(email: string, password: string, metadata?: UserMetadata): Promise<Result<UserEntity>> {
    const supabase = await createClient();

    // 验证邮箱格式
    const emailValidation = UserEntity.validateEmail(email);
    if (!emailValidation.valid) {
      return {
        data: null,
        error: new Error(emailValidation.error!),
      };
    }

    // 初始化仓储
    const userRepo = new UserRepository(supabase);

    const redirectTo = emailConfirmRedirectUrl();

    // 1. 创建认证用户
    return await userRepo.signUp(email, password, metadata, redirectTo);
  },

  async signIn(email: string, password: string): Promise<AuthResponse> {
    return { ...NOT_IMPLEMENTED_ERROR };
  },

  async signInWithProvider(provider: OAuthProvider, options?: SignInWithOAuthOptions): Promise<AuthResponse> {
    return { ...NOT_IMPLEMENTED_ERROR };
  },

  async signOut(): Promise<void> { },

  async getCurrentUser(): Promise<Result<UserEntity>> {
    const supabase = await createClient();
    const userRepo = new UserRepository(supabase);
    return await userRepo.getCurrentUser();
  },


  async verifyOtp(email: string, token: string, type: EmailOtpType): Promise<AuthResponse> {
    return { ...NOT_IMPLEMENTED_ERROR };
  },
};
