/**
 * 用户实体与 Supabase User 之间的映射器
 */

import { User as SupabaseUser, JwtPayload } from '@supabase/supabase-js';
import { UserEntity } from '@/lib/entities/user-entity';
import type { UserDTO } from '@/lib/services/auth/auth-types';

/**
 * UserMapper - 数据类型转换
 */
export class UserMapper {
    /**
   * 将 Supabase User 转换为 UserEntity
   */
    static fromClaimsToEntity(claims: JwtPayload): UserEntity {
        return new UserEntity(
            claims.sub,
            claims.email!,
        );
    }

    static fromUserToEntity(user: SupabaseUser): UserEntity {
        return new UserEntity(
            user.id,
            user.email!,
        );
    }

    /**
   * 将 UserEntity 转换为可序列化的 DTO（用于 API 响应）
   */
    static toDTO(entity: UserEntity): UserDTO {
        return {
            id: entity.id,
            email: entity.email,
        };
    }
}
