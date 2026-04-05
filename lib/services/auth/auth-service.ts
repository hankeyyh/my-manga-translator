/**
 * 认证服务
 * 负责用户认证、会话管理和用户信息操作
 * 使用 Repository 层实现业务逻辑与数据访问的分离
 */

import { createClient } from '@/lib/supabase/server';
import type {
	AuthResponse,
	AuthService,
	OAuthProvider,
	SignInWithOAuthOptions,
	UserMetadata,
} from './auth-types';
import { UserRepository } from '@/lib/repositories/user-repository';
import { UserEntity } from '@/lib/entities/user-entity';
import { Result } from '@/lib/types';
import { EmailOtpType } from '@supabase/supabase-js';

function emailConfirmRedirectUrl(): string | undefined {
	const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
	return base;
}

/**
 * 认证服务单例（使用 Repository 层）
 */
export const authService: AuthService = {
	async signUp(email: string, password: string, metadata?: UserMetadata): Promise<Result<UserEntity>> {
		// 验证邮箱格式
		const emailValidation = UserEntity.validateEmail(email);
		if (!emailValidation.valid) {
			return {
				data: null,
				error: new Error(emailValidation.error!),
			};
		}
		const redirectTo = emailConfirmRedirectUrl();

		// 创建认证用户
		const supabase = await createClient();
		const userRepo = new UserRepository(supabase);
		return await userRepo.signUp(email, password, metadata, redirectTo);
	},

	async signIn(email: string, password: string): Promise<Result<UserEntity>> {
		const supabase = await createClient();
		const userRepo = new UserRepository(supabase);
		return await userRepo.signIn(email, password);
	},

	async signInWithProvider(provider: OAuthProvider, options?: SignInWithOAuthOptions): Promise<Result<UserEntity>> {
		return {
			data: null,
			error: new Error('Not implemented'),
		};
	},

	async signOut(): Promise<Result<void>> {
		const supabase = await createClient();
		const userRepo = new UserRepository(supabase);
		return await userRepo.signOut();
	},

	async getCurrentUser(): Promise<Result<UserEntity>> {
		const supabase = await createClient();
		const userRepo = new UserRepository(supabase);
		return await userRepo.getCurrentUser();
	},


	async verifyOtp(tokenHash: string, type: EmailOtpType): Promise<Result<UserEntity>> {
		const supabase = await createClient();
		const userRepo = new UserRepository(supabase);
		return await userRepo.verifyOtp(tokenHash, type);
	},
};
