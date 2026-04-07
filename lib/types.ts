/**
 * 统一 API 响应结构（全站接口约定）
 */
export interface ApiResponse<T = unknown> {
  code: string;
  message: string;
  data: T | null;
}

/** 业务成功码（与 HTTP 状态码独立，供客户端判断） */
export const SUCCESS_CODE = '0';

// repo, service 通用返回类型
export type Result<TData, TError = Error> = {
    data: TData | null
    error: TError | null
}

// OAuth 登录选项
export type SignInWithOAuthOptions = {
  /** A URL to send the user to after they are confirmed. */
  redirectTo?: string
  /** A space-separated list of scopes granted to the OAuth application. */
  scopes?: string
  /** An object of query params */
  queryParams?: { [key: string]: string }
  /** If set to true does not immediately redirect the current browser context to visit the OAuth authorization page for the provider. */
  skipBrowserRedirect?: boolean
}