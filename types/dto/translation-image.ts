import { TranslationImage } from "../do/translation-image";

export interface TranslationImageView extends TranslationImage {
    originalImageUrl: string;
    resultImageUrl: string;
}

/** Polling-only image fields; skip original image and unused row data. */
export interface TranslationImagePollView {
    id: string;
    status: TranslationImage["status"];
    filename: string;
    taskId: string;
    imageIndex: number;
    resultImageUrl: string;
    errorMessage?: string;
}
