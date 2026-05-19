import { SignUpSuccessData, SignInSuccessData } from "@/lib/services/auth/auth-types";
import { TaskStatus } from "./do/translation-task";
import { ImageStatus } from "./do/translation-image";

/** 业务成功码（与 HTTP 状态码独立，供客户端判断） */
export const SUCCESS_CODE = '0';

/**
 * 统一 API 响应结构（全站接口约定）
 */
export interface ApiResponse<T = unknown> {
    code: string;
    message: string;
    data: T | null;
}

export interface ApiTranslationTaskImage {
    id: string;
    status: ImageStatus;
    imageIndex: number;
    taskId: string;
    originalImageUrl: string;
    resultImageUrl: string;
    errorMessage?: string;
}

export interface ApiGetTranslationTaskResponse {
    id: string;
    status: TaskStatus;
    total_images: number;
    completed_images: number;
    failed_images: number;
    progress: number;
    created_at: string;
    completed_at?: string;
    images: ApiTranslationTaskImage[];
}

export type SignUpResponse = ApiResponse<SignUpSuccessData>;

export type SignInResponse = ApiResponse<SignInSuccessData>;

export type SignOutResponse = ApiResponse<void>;

