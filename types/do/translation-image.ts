// 图片状态 (从表)
export type ImageStatus = 'pending' | 'processing' | 'completed' | 'failed';// 图片记录 (从表)

export interface TranslationImage {
    id: string;
    taskId: string;
    imageIndex: number;
    status: ImageStatus;
    filename: string;

    // 输入数据
    originalImagePath: string;
    originalImageSize?: number;
    originalImageWidth?: number;
    originalImageHeight?: number;

    // 输出数据
    folderName?: string;
    resultImagePath?: string;

    // 错误处理
    errorMessage?: string;
    retryCount: number;
    maxRetries: number;

    createdAt: string;
    startedAt?: string;
    completedAt?: string;
    updatedAt: string;
    metadata?: Record<string, any>;
}

export function isValidImage(image: TranslationImage): boolean {
    return image.status === 'completed' && Boolean(image.resultImagePath?.trim());
}

