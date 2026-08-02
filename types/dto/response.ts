// biz 通用返回类型
export type BizResult<TData, TError = Error> = {
    data: TData | null;
    error: TError | null;
    code: number;
};

/**
 * 错误码 = 模块 * 1000 + 序号
 *
 * 0        成功
 * 1xxx     协议 / 参数
 * 2xxx     鉴权
 * 3xxx     基础设施（DB、内部异常）
 * 4xxx     网络 / 下游远程
 * 5xxx     积分域
 * 6xxx     计费 / 充值 / 定价域
 * 7xxx     翻译域（预留）
 */

export const SUCCESS_CODE = 0;

// 1xxx 协议 / 参数
export const CHECK_PARAM_ERROR_CODE = 1001;

// 2xxx 鉴权
export const UNAUTHORIZED_ERROR_CODE = 2001;

// 3xxx 基础设施
export const DB_ERROR_CODE = 3001;
export const EXCEPTION_CODE = 3002; // try-catch / 配置等内部异常

// 4xxx 网络 / 下游远程
export const NETWORK_ERROR_CODE = 4001;
export const REMOTE_LOGIC_ERROR_CODE = 4002; // 下游业务/响应异常（如 Stripe 返回不合预期）

// 5xxx 积分域
export const CREDIT_BALANCE_NOT_ENOUGH = 5001; // 用户积分不足
export const CREDIT_FROZEN_NOT_ENOUGH_TO_CAPTURE = 5002; // 冻结积分不足以核销
export const CREDIT_FROZEN_NOT_ENOUGH_TO_REFUND = 5003; // 冻结积分不足以退还

// 6xxx 计费 / 充值 / 定价域
export const UNSUPPORTED_TRANSACTION_TYPE = 6001; // 不支持的充值类型
export const PRICING_CONFIG_NOT_FOUND = 6002; // 没找到价格信息
