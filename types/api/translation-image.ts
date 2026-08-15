import { ImageStatus } from "../do/translation-image";


export interface ApiTranslationTaskImage {
    id: string;
    status: ImageStatus;
    imageIndex: number;
    filename: string;
    taskId: string;
    originalImageUrl: string;
    resultImageUrl: string;
    errorMessage?: string;
}

/** Image fields needed while polling; originals are client-local. */
export interface ApiTranslationTaskLiteImage {
    id: string;
    status: ImageStatus;
    imageIndex: number;
    filename: string;
    taskId: string;
    resultImageUrl: string;
    errorMessage?: string;
}
