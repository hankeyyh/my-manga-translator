import { TaskStatus } from "../do/translation-task";
import { ApiTranslationTaskImage } from "./translation-image";


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
