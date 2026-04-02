/**
 * 认证服务类型定义 - 注册功能
 * 基于 Supabase Auth 实现
 */

import { User as SupabaseUser, Session as SupabaseSession } from '@supabase/supabase-js';

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
 * 注册响应
 */
export interface SignUpResponse {
  success: boolean;
  data?: {
    user: User | null;
    session: Session | null;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
