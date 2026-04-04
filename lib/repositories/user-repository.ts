/**
 * User 仓储
 * 封装 auth.users 的所有认证操作
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { UserEntity } from '@/lib/entities/user-entity';
import { UserMapper } from '@/lib/mappers/user-mapper';
import { Result } from '@/lib/types';

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
  async signUp(
    email: string,
    password: string,
    metadata?: Record<string, any>,
    emailRedirectTo?: string
  ): Promise<Result<UserEntity>> {
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
}
