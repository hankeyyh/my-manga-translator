
export const TRANSLATION_STYLES = ["WildWords BB", "Standard", "Artistic"] as const;
export type TranslationStyle = (typeof TRANSLATION_STYLES)[number];
