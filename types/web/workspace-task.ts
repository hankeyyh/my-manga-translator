import type { FontId } from "@/app/fonts/config";
import type { TranslationMode } from "@/types/do/translation-intent";
import { MangaPage } from "./manga-page";

export type LangOption = { code: string; label: string; };

export type WorkspaceTask = {
    localId: string;
    serverTaskId: string | null;
    pages: MangaPage[];
    targetLang: LangOption;
    translateMode: TranslationMode;
    fontStyle: FontId;
    submitLoading: boolean;
    retryLoading: boolean;
    showTranslated: boolean;
    pollStartedAt: number | null;
};

