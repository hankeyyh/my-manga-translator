/**
 * 认证服务类型定义 - 注册功能
 * 基于 Supabase Auth 实现
 */

import { User as SupabaseUser, Session as SupabaseSession } from '@supabase/supabase-js';

import type { ApiResponse } from '@/lib/types/api';

// ============================================================================
// 用户相关类型
// ============================================================================

/**
 * 用户元数据
 */
export interface UserMetadata {
  name?: string;
  avatar?: string;
  [key: string]: any;
}

/**
 * 用户对象（使用 Supabase User）
 */
export type User = SupabaseUser;

/**
 * 会话对象（使用 Supabase Session）
 */
export type Session = SupabaseSession;

// ============================================================================
// 认证响应类型
// ============================================================================

/**
 * 认证响应
 */
export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error?: AuthError;
}

/**
 * 认证错误
 */
export interface AuthError {
  message: string;
  status?: number;
  code?: string;
}

// ============================================================================
// AuthService 规格类型（见 prds/technical_specification.md）
// ============================================================================

export type OAuthProvider = 'google' | 'github';

export type EmailOtpType = 'signup' | 'email_change' | 'magiclink' | 'recovery';

export interface SignInWithOAuthOptions {
  redirectTo?: string;
  scopes?: string;
}

export interface UserUpdateData {
  email?: string;
  password?: string;
  data?: UserMetadata;
}

/**
 * 认证服务接口
 * 负责用户认证、会话管理和用户信息操作
 */
export interface AuthService {
  signUp(email: string, password: string, metadata?: UserMetadata): Promise<AuthResponse>;
  signIn(email: string, password: string): Promise<AuthResponse>;
  signInWithProvider(provider: OAuthProvider, options?: SignInWithOAuthOptions): Promise<AuthResponse>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  getSession(): Promise<Session | null>;
  updateUser(data: UserUpdateData): Promise<User>;
  resetPassword(email: string): Promise<void>;
  updatePassword(newPassword: string): Promise<User>;
  verifyOtp(email: string, token: string, type: EmailOtpType): Promise<AuthResponse>;
}

// ============================================================================
// 注册相关类型
// ============================================================================

/**
 * 注册请求参数
 */
export interface SignUpRequest {
  email: string;
  password: string;
  metadata?: UserMetadata;
}

/**
 * 注册接口成功时的 data
 */
export interface SignUpSuccessData {
  user: User | null;
  session: Session | null;
}

/**
 * POST /api/auth/signup 响应体（失败时 data 恒为 null）
 */
export type SignUpResponse = ApiResponse<SignUpSuccessData>;