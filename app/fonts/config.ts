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
            renderName: "anime-ace-3",
        },
        "comic-shanns-2": {
            name: "Comic Shanns 2",
            renderName: "comic-shanns-2",
        },
        "comic-marker-deluxe": {
            name: "Comic Marker Deluxe",
            renderName: "comic-marker-deluxe",
        },
        "bangers": {
            name: "Bangers",
            renderName: "bangers",
        },
        "komika-slim": {
            name: "Komika Slim",
            renderName: "komika-slim",
        },
        "cc-wild-words": {
            name: "CC Wild Words",
            renderName: "cc-wild-words",
        },
        "caveat": {
            name: "Caveat",
            renderName: "caveat",
        },
        "noto-sans": {
            name: "Noto Sans",
            renderName: "noto-sans",
        },
        "inter": {
            name: "Inter",
            renderName: "inter",
        },
        "noto-sans-sc": {
            name: "Noto Sans SC",
            renderName: "noto-sans-sc",
        },
        "zcool-kuai-le": {
            name: "ZCOOL KuaiLe",
            renderName: "zcool-kuai-le",
        },
        "long-cang": {
            name: "Long Cang",
            renderName: "long-cang",
        },
        "ma-shan-zheng": {
            name: "Ma Shan Zheng",
            renderName: "ma-shan-zheng",
        },
        "noto-sans-jp": {
            name: "Noto Sans JP",
            renderName: "noto-sans-jp",
        },
        "genei-late-go-n": {
            name: "GenEi LateGo N",
            renderName: "genei-late-go-n",
        },
        "genei-antique": {
            name: "GenEi Antique",
            renderName: "genei-antique",
        },
        "mplus-rounded-1c": {
            name: "M PLUS Rounded 1c",
            renderName: "mplus-rounded-1c",
        },
        "zen-kurenaido": {
            name: "Zen Kurenaido",
            renderName: "zen-kurenaido",
        },
        "noto-sans-kr": {
            name: "Noto Sans KR",
            renderName: "noto-sans-kr",
        },
        "komacon": {
            name: "KOMACON",
            renderName: "komacon",
        },
        "gowun-dodum": {
            name: "Gowun Dodum",
            renderName: "gowun-dodum",
        },
        "nanum-pen-script": {
            name: "Nanum Pen Script",
            renderName: "nanum-pen-script",
        },
        "noto-sans-tc": {
            name: "Noto Sans TC",
            renderName: "noto-sans-tc",
        },
        "lxgw-wenkai-tc": {
            name: "LXGW WenKai TC",
            renderName: "lxgw-wenkai-tc",
        },
        "noto-sans-thai": {
            name: "Noto Sans Thai",
            renderName: "noto-sans-thai",
        },
        "charmonman": {
            name: "Charmonman",
            renderName: "charmonman",
        },
        "itim": {
            name: "Itim",
            renderName: "itim",
        },
        "krub": {
            name: "Krub",
            renderName: "krub",
        },
        "playpen-sans-thai": {
            name: "Playpen Sans Thai",
            renderName: "playpen-sans-thai",
        },
        "noto-sans-arabic": {
            name: "Noto Sans Arabic",
            renderName: "noto-sans-arabic",
        },
        "qts-manga": {
            name: "QTS Manga",
            renderName: "qts-manga",
        },
        "msyh": {
            name: "Microsoft YaHei",
            renderName: "msyh",
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
                "cc-wild-words",
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
