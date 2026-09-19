import { TranslationTask } from "../do/translation-task";
import { TranslationImageView } from "./translation-image";

export interface TranslationTaskDetailView extends TranslationTask {
    images: TranslationImageView[];
}

export interface TranslationHistoryPage {
    tasks: TranslationTaskDetailView[],
    nextCursor: string | null,
}

// 提交任务返回数据
export interface SubmitTaskData {
    taskId: string,
    imageIds: string[]
}