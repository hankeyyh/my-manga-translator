import { TranslationConfig } from "./translation-config";
import { TranslationImage } from "./translation-image";


// 任务状态 (主表)
export type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'partial';

// 任务结束状态
export const TASK_ENDED_STATUSES = ['completed', 'failed', 'partial'];

// 任务记录 (主表)
export interface TranslationTask {
    id: string;
    userId: string;
    status: TaskStatus;

    // 统计信息
    totalImages: number;
    completedImages: number;
    failedImages: number;
    progress: number;

    config: TranslationConfig;

    createdAt: string;
    startedAt?: string;
    completedAt?: string;
    updatedAt: string;
    metadata?: Record<string, any>;

    creditPerImage: number;
    totalCredits: number;
}

// 任务详情 (含图片列表)
export interface TranslationTaskDetail extends TranslationTask {
    images: TranslationImage[];
}

