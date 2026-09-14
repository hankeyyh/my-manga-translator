/**
 * 与 MangaTranslator `deploy/api/schemas.py` `JobConfigIn` 对齐的管线配置。
 * DeepL 无视觉：`translation_mode` 必须 two-step，`ocr_method` 必须 manga-ocr。
 */

export type TranslationMode = "one-step" | "two-step";
export type OcrMethod = "LLM" | "manga-ocr";
export type InpaintingMethod = "lama_large" | "opencv" | "none";
export type OutputFormat = "webp" | "png" | "jpg";

/** 与 `PROVIDER_ALIASES` 规范化后的 provider 名对齐；也接受未列入的原始值 */
export type Provider =
    | "DeepSeek"
    | "DeepL"
    | "Google"
    | "OpenAI"
    | "Anthropic"
    | "SpaceXAI"
    | "OpenRouter";

/** 与 `DetectionConfigIn` 对齐的气泡检测选项 */
export interface DetectionConfig {
    /** 气泡检测模型，默认 yolo_2 */
    bubble_detector_model?: string;
}

/** 与 `OutsideTextConfigIn` 对齐的框外文字处理选项 */
export interface OutsideTextConfig {
    enabled?: boolean;
    /** lama_large / opencv / none */
    inpainting_method?: InpaintingMethod;
}

/** 与 `RenderingConfigIn` 对齐的排版选项 */
export interface RenderingConfig {
    /** 气泡/分镜阅读顺序；true：日漫默认；false：美漫 / 韩漫 / 国漫 */
    rtl?: boolean;
}

/** 与 `JobConfigIn` 对齐的翻译任务配置 */
export interface TranslationConfig {
    input_language?: string | null;
    output_language?: string | null;
    /** 服务端会按 `PROVIDER_ALIASES` 规范化，如 deepl → DeepL */
    provider?: Provider | string | null;
    model_name?: string | null;
    translation_mode?: TranslationMode | null;
    ocr_method?: OcrMethod | null;
    /** 对应服务端 `DEFAULT_FONT_NAME`（NotoSans） */
    font_name?: string | null;
    detection?: DetectionConfig | null;
    outside_text?: OutsideTextConfig | null;
    rendering?: RenderingConfig | null;
    /** webp / png / jpg（jpeg 会被规范成 jpg） */
    output_format?: OutputFormat | null;
}
