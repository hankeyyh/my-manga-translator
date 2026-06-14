import { TranslationImage } from "../do/translation-image";

export interface TranslationImageView extends TranslationImage {
    originalImageUrl: string;
    resultImageUrl: string;
}

// 调algo svr翻译成功，返回上层的结构
export interface TranslateImageSuccessResult {
    userId: string;
    taskId: string;
    imageId: string;
    consumeCredits: number;
}

// 翻译失败，返回上层的结构
export interface TranslateImageFailedResult {
    userId: string;
    taskId: string;
    imageId: string;
    needRefund: boolean;
    refundCredits: number;
}

export function isTranslateImageSuccessResult(data: TranslateImageSuccessResult | TranslateImageFailedResult):
    data is TranslateImageSuccessResult {
    return "consumeCredits" in data;
}

export function isTranslateImageFailedResult(data: TranslateImageSuccessResult | TranslateImageFailedResult):
    data is TranslateImageFailedResult {
    return "refundCredits" in data;
}