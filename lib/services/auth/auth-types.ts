/**
 * 认证服务类型定义 - 注册功能
 * 基于 Supabase Auth 实现，使用 Entity 层进行数据抽象
 */

import { EmailOtpType, Provider, Session as SupabaseSession } from '@supabase/supabase-js';
import { UserEntity } from '@/lib/entities/user-entity';

import type { ApiResponse, Result } from '@/lib/types';

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
  user: UserEntity | null;
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

export type OAuthProvider = Provider;

export interface UserUpdateData {
  email?: string;
  password?: string;
  data?: UserMetadata;
}

/**
 * 认证服务接口
 * 负责用户认证、会话管理和用户信息操作
 * 所有方法返回 Entity 类型，而非 Supabase 原生类型
 */
export interface AuthService {
  signUp(email: string, password: string, metadata?: UserMetadata): Promise<Result<UserEntity>>;
  signIn(email: string, password: string): Promise<Result<UserEntity>>;
  signInWithGoogle(): Promise<Result<string | null>>;
  signOut(): Promise<Result<void>>;
  getCurrentUser(): Promise<Result<UserEntity>>;
  verifyOtp(tokenHash: string, type: EmailOtpType): Promise<Result<UserEntity>>;
  exchangeCodeForSession(code: string): Promise<Result<UserEntity>>;
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
 * 用户实体的可序列化版本（用于 API 响应）
 */
export interface UserDTO {
  id: string;
  email: string;
}

/**
 * 注册接口成功时的 data
 */
export interface SignUpSuccessData {
  user: UserDTO | null;
}

export interface SignInSuccessData {
  user: UserDTO | null;
}

/**
 * POST /api/auth/signup 响应体（失败时 data 恒为 null）
 */
export type SignUpResponse = ApiResponse<SignUpSuccessData>;

export type SignInResponse = ApiResponse<SignInSuccessData>;

export type SignOutResponse = ApiResponse<void>;