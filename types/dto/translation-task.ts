import { TranslationTask } from "../do/translation-task";
import { TranslationImageView, TranslationImageLiteView } from "./translation-image";

export interface TranslationTaskDetailView extends TranslationTask {
    images: TranslationImageView[];
}

/** Task detail for polling: result URLs only when available. */
export interface TranslationTaskLiteView extends TranslationTask {
    images: TranslationImageLiteView[];
}

export interface TranslationHistoryPage {
    tasks: TranslationTaskDetailView[],
    nextCursor: string | null,
}