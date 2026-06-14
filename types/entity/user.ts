
/**
 * 用户实体
 * 核心业务对象，不依赖任何数据库实现
 */
export class UserEntity {
    constructor(
        public readonly id: string,
        public readonly email: string
    ) { }

    // 验证邮箱格式
    static validateEmail(email: string): { valid: boolean; error?: string; } {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email) {
            return { valid: false, error: '邮箱地址不能为空' };
        }

        if (!emailRegex.test(email)) {
            return { valid: false, error: '邮箱地址格式不正确' };
        }

        if (email.length > 255) {
            return { valid: false, error: '邮箱地址过长' };
        }

        return { valid: true };
    }
}
