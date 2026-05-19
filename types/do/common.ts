
// repo 通用返回类型
export type Result<TData, TError = Error> = {
    data: TData | null;
    error: TError | null;
};

// biz 通用返回类型
export type BizResult<TData, TError = Error> = {
    data: TData | null;
    error: TError | null;
    code: number;
}

export const SUCCESS_CODE = 0;
export const CHECK_PARAM_ERROR_CODE = 1;
export const UNAUTHORIZED_ERROR_CODE = 2;
export const DB_ERROR_CODE = 3;
export const NETWORK_ERROR_CODE = 4;
export const REMOTE_LOGIC_ERROR_CODE = 5; // 下游业务错误
export const LOGIC_ERROR_CODE = 6; // 业务逻辑错误