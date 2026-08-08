import { TaskStatus } from "@/types/do/translation-task";
import { MangaPage } from "@/types/web/manga-page";

/** 首页会话级临时任务（刷新即清空，最多保留若干条） */
export type SessionTask = {
    localId: string;
    /** 服务端 task id；未提交为 null */
    taskId: string | null;
    /** null 表示尚未开始翻译的草稿 */
    status: TaskStatus | null;
    pages: MangaPage[];
    createdAt: number;
    /** 该 task 缩略图是否显示译图（各自独立） */
    showTranslated: boolean;
};

export const MAX_SESSION_TASKS = 5;
