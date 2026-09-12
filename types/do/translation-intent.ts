export type TranslationBackendId = "manga-image-translator" | "manga-translator";

export const SUPPORTED_MODES = ["fast", "quality"] as const;
export type TranslationMode = (typeof SUPPORTED_MODES)[number];

// 产品意图
export interface TranslationIntent {
    targetLang: string,
    mode: TranslationMode,
    fontName: string,
    rtl?: boolean,
    hyphenation?: boolean,
}