import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
    // BCP 47，对应 manga-image-translator VALID_LANGUAGES
    // 按全球使用人数（L1+L2）降序；zh-cn / zh-tw 同属中文，紧挨排列
    locales: [
        "en",    // 英语
        "zh-cn", // 简体中文
        "zh-tw", // 繁体中文
        "es",    // 西班牙语
        "ar",    // 阿拉伯语
        "fr",    // 法语
        // "pt-br", // 葡萄牙语（巴西）
        "ko",    // 韩语
        "ja",    // 日语
        "id",    // 印尼语
        "ru",    // 俄语
        "de",    // 德语
        "vi",    // 越南语
        "tr",    // 土耳其语
        "fil",   // 菲律宾语
        "th",    // 泰语
        // "it",    // 意大利语
        // "pl",    // 波兰语
        // "uk",    // 乌克兰语
        // "nl",    // 荷兰语
        // "ro",    // 罗马尼亚语
        // "hu",    // 匈牙利语
        // "cs",    // 捷克语
        // "sr",    // 塞尔维亚语
        // "hr",    // 克罗地亚语
        // "cnr",   // 黑山语
    ],
    defaultLocale: "en",
    localePrefix: "as-needed",
});

export type AppLocale = (typeof routing.locales)[number];
