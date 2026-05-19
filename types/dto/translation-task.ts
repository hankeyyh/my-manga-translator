import { TranslationTask } from "../do/translation-task";
import { TranslationImageView } from "./translation-image";

export interface TranslationTaskDetailView extends TranslationTask {
    images: TranslationImageView[];
}