import { TaskStatus } from "../do/translation-task";
import { MangaPage } from "./manga-page";

export interface MangaTask {
    id?: string;
    status?: TaskStatus;
    createdAt?: string;
    sourceLang: string;
    targetLang: string;
    pages: MangaPage[];
}