import type { SupportedLangCode } from "@/types/common";

export type FontDefinition = {
    name: string;       // 前端UI显示
    renderName: string; // 翻译引擎匹配字体
};

export type WritingConfig = {
    rtl: boolean;
    hyphenation: boolean;
};

export type ScriptDefinition = {
    id: string;
    locales: readonly SupportedLangCode[];
    defaultFont: string;
    fonts: readonly string[];
    previewSample: string;
    writing: WritingConfig;
};


export const FONT_CONFIG = {
    fonts: {
        "anime-ace-3": {
            name: "Anime Ace 3.0",
            renderName: "Anime Ace 3.0",
        },
        "comic-shanns-2": {
            name: "Comic Shanns 2",
            renderName: "Comic Shanns 2",
        },
        "comic-marker-deluxe": {
            name: "Comic Marker Deluxe",
            renderName: "Comic Marker Deluxe",
        },
        "bangers": {
            name: "Bangers",
            renderName: "Bangers",
        },
        "komika-slim": {
            name: "Komika Slim",
            renderName: "Komika Slim",
        },
        "caveat": {
            name: "Caveat",
            renderName: "Caveat",
        },
        "noto-sans": {
            name: "Noto Sans",
            renderName: "Noto Sans",
        },
        "inter": {
            name: "Inter",
            renderName: "Inter",
        },
        "noto-sans-sc": {
            name: "Noto Sans SC",
            renderName: "Noto Sans SC",
        },
        "zcool-kuai-le": {
            name: "ZCOOL KuaiLe",
            renderName: "ZCOOL KuaiLe",
        },
        "long-cang": {
            name: "Long Cang",
            renderName: "Long Cang",
        },
        "ma-shan-zheng": {
            name: "Ma Shan Zheng",
            renderName: "Ma Shan Zheng",
        },
        "noto-sans-jp": {
            name: "Noto Sans JP",
            renderName: "Noto Sans JP",
        },
        "genei-late-go-n": {
            name: "GenEi LateGo N",
            renderName: "GenEi LateGo N",
        },
        "genei-antique": {
            name: "GenEi Antique",
            renderName: "GenEi Antique",
        },
        "mplus-rounded-1c": {
            name: "M PLUS Rounded 1c",
            renderName: "M PLUS Rounded 1c",
        },
        "zen-kurenaido": {
            name: "Zen Kurenaido",
            renderName: "Zen Kurenaido",
        },
        "noto-sans-kr": {
            name: "Noto Sans KR",
            renderName: "Noto Sans KR",
        },
        "komacon": {
            name: "KOMACON",
            renderName: "KOMACON",
        },
        "gowun-dodum": {
            name: "Gowun Dodum",
            renderName: "Gowun Dodum",
        },
        "nanum-pen-script": {
            name: "Nanum Pen Script",
            renderName: "Nanum Pen Script",
        },
        "noto-sans-tc": {
            name: "Noto Sans TC",
            renderName: "Noto Sans TC",
        },
        "lxgw-wenkai-tc": {
            name: "LXGW WenKai TC",
            renderName: "LXGW WenKai TC",
        },
        "noto-sans-thai": {
            name: "Noto Sans Thai",
            renderName: "Noto Sans Thai",
        },
        "charmonman": {
            name: "Charmonman",
            renderName: "Charmonman",
        },
        "itim": {
            name: "Itim",
            renderName: "Itim",
        },
        "krub": {
            name: "Krub",
            renderName: "Krub",
        },
        "playpen-sans-thai": {
            name: "Playpen Sans Thai",
            renderName: "Playpen Sans Thai",
        },
        "noto-sans-arabic": {
            name: "Noto Sans Arabic",
            renderName: "Noto Sans Arabic",
        },
        "qts-manga": {
            name: "QTS Manga",
            renderName: "QTS Manga",
        },
        "msyh": {
            name: "Microsoft YaHei",
            renderName: "Microsoft YaHei",
        },
    },
    scripts: [
        {
            id: "latin",
            locales: [
                "ENG",
                "FRA",
                "DEU",
                "ESP",
                "ITA",
                "NLD",
                "POL",
                "PTB",
                "ROM",
                "CSY",
                "HUN",
                "HRV",
                "TRK",
                "IND",
                "FIL",
                "VIN",
                "CNR",
            ],
            defaultFont: "noto-sans",
            fonts: [
                "noto-sans",
                "anime-ace-3",
                "comic-shanns-2",
                "comic-marker-deluxe",
                "bangers",
                "komika-slim",
                "caveat",
                "msyh",
            ],
            previewSample: "MANGA",
            writing: {
                rtl: false,
                hyphenation: true,
            },
        },
        {
            id: "cyrillic",
            locales: [
                "RUS",
                "UKR",
                "SRP",
            ],
            defaultFont: "noto-sans",
            fonts: [
                "noto-sans",
                "inter",
                "msyh",
            ],
            previewSample: "Манга",
            writing: {
                rtl: false,
                hyphenation: true,
            },
        },
        {
            id: "cjk-sc",
            locales: [
                "CHS",
            ],
            defaultFont: "noto-sans-sc",
            fonts: [
                "noto-sans-sc",
                "zcool-kuai-le",
                "long-cang",
                "ma-shan-zheng",
                "genei-late-go-n",
                "msyh",
            ],
            previewSample: "漫画",
            writing: {
                rtl: false,
                hyphenation: false,
            },
        },
        {
            id: "cjk-tc",
            locales: [
                "CHT",
            ],
            defaultFont: "noto-sans-tc",
            fonts: [
                "noto-sans-tc",
                "genei-late-go-n",
                "lxgw-wenkai-tc",
                "msyh",
            ],
            previewSample: "漫畫",
            writing: {
                rtl: false,
                hyphenation: false,
            },
        },
        {
            id: "cjk-jp",
            locales: [
                "JPN",
            ],
            defaultFont: "noto-sans-jp",
            fonts: [
                "noto-sans-jp",
                "genei-late-go-n",
                "genei-antique",
                "mplus-rounded-1c",
                "zen-kurenaido",
                "msyh",
            ],
            previewSample: "マンガ",
            writing: {
                rtl: false,
                hyphenation: false,
            },
        },
        {
            id: "hangul",
            locales: [
                "KOR",
            ],
            defaultFont: "noto-sans-kr",
            fonts: [
                "noto-sans-kr",
                "komacon",
                "gowun-dodum",
                "nanum-pen-script",
            ],
            previewSample: "만화",
            writing: {
                rtl: false,
                hyphenation: false,
            },
        },
        {
            id: "thai",
            locales: [
                "THA",
            ],
            defaultFont: "noto-sans-thai",
            fonts: [
                "noto-sans-thai",
                "charmonman",
                "itim",
                "krub",
                "playpen-sans-thai",
            ],
            previewSample: "มังงะ",
            writing: {
                rtl: false,
                hyphenation: false,
            },
        },
        {
            id: "arabic",
            locales: [
                "ARA",
            ],
            defaultFont: "noto-sans-arabic",
            fonts: [
                "noto-sans-arabic",
                "qts-manga",
            ],
            previewSample: "مانغا",
            writing: {
                rtl: true,
                hyphenation: false,
            },
        },
    ],
} as const satisfies {
    fonts: Record<string, FontDefinition>;
    scripts: readonly ScriptDefinition[];
};

export type FontId = keyof typeof FONT_CONFIG.fonts;
export type ScriptId = (typeof FONT_CONFIG.scripts)[number]["id"];
export type FontScript = (typeof FONT_CONFIG.scripts)[number];

// 编译检查，SUPPORT_LANG 是否都配置了对应字体
type ScriptLocale = FontScript["locales"][number];
type UnassignedLangCode = Exclude<SupportedLangCode, ScriptLocale>;
type AssertAllLangsAssigned<T extends never> = T;
type _AssertAllLangsAssigned = AssertAllLangsAssigned<UnassignedLangCode>;

const LATIN_SCRIPT = FONT_CONFIG.scripts.find((script) => script.id === "latin") ?? FONT_CONFIG.scripts[0];

export function isFontId(id: string): id is FontId {
    return id in FONT_CONFIG.fonts;
}

export function getScriptForLocale(code: string): FontScript {
    return FONT_CONFIG.scripts.find((script) =>
        (script.locales as readonly string[]).includes(code),
    ) ?? LATIN_SCRIPT;
}

export function getScriptFonts(script: FontScript) {
    return script.fonts.filter(isFontId).map((id) => ({
        id,
        ...FONT_CONFIG.fonts[id],
    }));
}

export function resolveFontId(code: string, current?: string): FontId {
    const script = getScriptForLocale(code);
    if (current && (script.fonts as readonly string[]).includes(current) && isFontId(current)) {
        return current;
    }
    if (isFontId(script.defaultFont)) {
        return script.defaultFont;
    }
    const first = script.fonts.find(isFontId);
    return first ?? "anime-ace-3";
}
