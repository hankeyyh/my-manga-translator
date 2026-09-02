/** 与 manga-image-translator `VALID_LANGUAGES` 对齐 */
export type SupportedLang = {
    code: string;
    label: string;
};

export const SUPPORTED_LANGS = [
    { code: "ENG", label: "English" },
    { code: "CHS", label: "Chinese (Simplified)" },
    { code: "CHT", label: "Chinese (Traditional)" },
    { code: "ESP", label: "Spanish" },
    { code: "ARA", label: "Arabic" },
    { code: "FRA", label: "French" },
    { code: "KOR", label: "Korean" },
    { code: "JPN", label: "Japanese" },
    { code: "CSY", label: "Czech" },
    { code: "NLD", label: "Dutch" },
    { code: "DEU", label: "German" },
    { code: "HUN", label: "Hungarian" },
    { code: "ITA", label: "Italian" },
    { code: "POL", label: "Polish" },
    { code: "PTB", label: "Portuguese (Brazil)" },
    { code: "ROM", label: "Romanian" },
    { code: "RUS", label: "Russian" },
    { code: "TRK", label: "Turkish" },
    { code: "UKR", label: "Ukrainian" },
    { code: "VIN", label: "Vietnamese" },
    { code: "CNR", label: "Montenegrin" },
    { code: "SRP", label: "Serbian" },
    { code: "HRV", label: "Croatian" },
    { code: "THA", label: "Thai" },
    { code: "IND", label: "Indonesian" },
    { code: "FIL", label: "Filipino (Tagalog)" },
] as const satisfies readonly SupportedLang[];

export type SupportedLangCode = (typeof SUPPORTED_LANGS)[number]['code'];