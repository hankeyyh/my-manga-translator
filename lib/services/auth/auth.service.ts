/**
 * 认证服务 - 服务端注册功能
 * 负责用户注册和初始化用户积分
 * 基于 Supabase Auth 实现
 */

import { createClient } from '@/lib/supabase/server';
import type { SignUpRequest, AuthResponse } from './auth.types';

/**
 * 用户注册（服务端）
 * @param request - 注册请求参数
 * @returns 认证响应
 */
export async function signUp(request: SignUpRequest): Promise<AuthResponse> {
  const supabase = await createClient();

  try {
    // 1. 调用 Supabase Auth 注册用户
    const { data, error } = await supabase.auth.signUp({
      email: request.email,
      password: request.password,
      options: {
        data: request.metadata || {},
        emailRedirectTo: process.env.NEXT_PUBLIC_SITE_URL,
      },
    });

    // 2. 处理注册错误
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

    // 3. 如果用户创建成功，初始化用户积分（赠送20积分）
    // if (data.user) {
    //   const { error: creditsError } = await supabase
    //     .from('user_credits')
    //     .insert({
    //       user_id: data.user.id,
    //       balance: 20,
    //       total_earned: 20,
    //       total_used: 0,
    //     });

    //   if (creditsError) {
    //     console.error('Failed to initialize user credits:', creditsError);
    //     // 不影响注册流程，仅记录错误
    //   }
    // }

    // 4. 返回成功响应
    return {
      user: data.user,
      session: data.session,
      error: undefined,
    };
  } catch (err) {
    // 5. 捕获未知错误
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
}
