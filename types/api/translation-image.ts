import { ImageStatus } from "../do/translation-image";


export interface ApiTranslationTaskImage {
    id: string;
    status: ImageStatus;
    imageIndex: number;
    taskId: string;
    originalImageUrl: string;
    resultImageUrl: string;
    errorMessage?: string;
}
