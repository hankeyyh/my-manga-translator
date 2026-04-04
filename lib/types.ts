/**
 * 统一 API 响应结构（全站接口约定）
 */
export interface ApiResponse<T = unknown> {
  code: string;
  message: string;
  data: T | null;
}

/** 业务成功码（与 HTTP 状态码独立，供客户端判断） */
export const API_SUCCESS_CODE = '0';

// repo, service 通用返回类型
export type Result<TData, TError = Error> = {
    data: TData | null
    error: TError | null
}

