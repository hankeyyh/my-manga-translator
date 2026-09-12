import { TranslationBackendId } from "@/types/do/translation-intent";
import { MangaImageTranslatorBackend } from "./manga-image-translator/manga-image-translator-backend";
import { MangaTranslatorBackend } from "./manga-translator/manga-translator-backend";

export function createTranslationBackend(backendId: TranslationBackendId){
    switch (backendId) {
        case "manga-image-translator":
            return new MangaImageTranslatorBackend();
        case "manga-translator":
            return new MangaTranslatorBackend();
    }
}