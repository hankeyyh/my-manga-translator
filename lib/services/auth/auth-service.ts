/**
 * 认证服务
 * 负责用户认证、会话管理和用户信息操作
 * 基于 Supabase Auth 实现
 */

import { createClient } from '@/lib/supabase/server';
import type {
  AuthResponse,
  AuthService,
  EmailOtpType,
  OAuthProvider,
  SignInWithOAuthOptions,
  User,
  UserMetadata,
  UserUpdateData,
} from './auth-types';

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
 * 认证服务单例（当前仅实现 signUp，其余方法占位）
 */
export const authService: AuthService = {
  async signUp(email: string, password: string, metadata?: UserMetadata): Promise<AuthResponse> {
    const supabase = await createClient();

    try {
      const redirectTo = emailConfirmRedirectUrl();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata ?? {},
          ...(redirectTo ? { emailRedirectTo: redirectTo } : {}),
        },
      });

      if (error) {
        return {
          user: null,
          session: null,
          error: {
            message: error.message,
            status: error.status,
            code: error.code,
          },
        };
      }

      return {
        user: data.user,
        session: data.session,
        error: undefined,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      return {
        user: null,
        session: null,
        error: {
          message: errorMessage,
          code: 'INTERNAL_ERROR',
        },
      };
    }
  },

  async signIn(email: string, password: string): Promise<AuthResponse> {
    return { ...NOT_IMPLEMENTED_ERROR };
  },

  async signInWithProvider(provider: OAuthProvider, options?: SignInWithOAuthOptions): Promise<AuthResponse> {
    return { ...NOT_IMPLEMENTED_ERROR };
  },

  async signOut(): Promise<void> { },

  async getCurrentUser(): Promise<User | null> {
    return null;
  },

  async getSession() {
    return null;
  },

  async updateUser(data: UserUpdateData): Promise<User> {
    throw new Error('AuthService.updateUser is not implemented yet');
  },

  async resetPassword(email: string): Promise<void> { },

  async updatePassword(newPassword: string): Promise<User> {
    throw new Error('AuthService.updatePassword is not implemented yet');
  },

  async verifyOtp(email: string, token: string, type: EmailOtpType): Promise<AuthResponse> {
    return { ...NOT_IMPLEMENTED_ERROR };
  },
};
