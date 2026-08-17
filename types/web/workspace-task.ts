import { LangOption } from "@/app/(main)/v2/_components/translate-section-2";
import { MangaPage } from "./manga-page";


export type WorkspaceTask = {
    localId: string;
    serverTaskId: string | null;
    pages: MangaPage[];
    targetLang: LangOption;
    translateMode: string;
    fontStyle: string;
    submitLoading: boolean;
    retryLoading: boolean;
    showTranslated: boolean;
    pollStartedAt: number | null;
};
