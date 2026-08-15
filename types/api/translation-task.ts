import { TranslationConfig } from "../do/translation-config";
import { TaskStatus } from "../do/translation-task";
import { ApiTranslationTaskImage, ApiTranslationTaskLiteImage } from "./translation-image";


export interface ApiGetTranslationTaskResponse {
    id: string;
    status: TaskStatus;
    total_images: number;
    completed_images: number;
    failed_images: number;
    progress: number;
    created_at: string;
    completed_at?: string;
    config: TranslationConfig;
    images: ApiTranslationTaskImage[];
}

/** Polling-oriented task payload: no original signed URLs, no config. */
export interface ApiGetTranslationTaskLiteResponse {
    id: string;
    status: TaskStatus;
    total_images: number;
    completed_images: number;
    failed_images: number;
    progress: number;
    created_at: string;
    completed_at?: string;
    images: ApiTranslationTaskLiteImage[];
}
