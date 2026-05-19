
type Upscaler = 'waifu2x' | 'esrgan' | '4xultrasharp';
type Detector = 'default' | 'dbconvnext' | 'ctd' | 'craft' | 'paddle' | 'none';
type Ocr = '32px' | '48px' | '48px_ctc' | 'mocr';
type Translator = 'youdao' | 'baidu' | 'deepl' | 'papago' | 'caiyun' | 'chatgpt' | 'chatgpt_2stage' | 'none' | 'original' | 'sakura' | 'deepseek' | 'groq' | 'gemini' | 'gemini_2stage' | 'custom_openai' | 'offline' | 'nllb' | 'nllb_big' | 'sugoi' | 'jparacrawl' | 'jparacrawl_big' | 'm2m100' | 'm2m100_big' | 'mbart50' | 'qwen2' | 'qwen2_big';
type Inpainter = 'default' | 'lama_large' | 'lama_mpe' | 'sd' | 'none' | 'original';
type InpaintPrecision = 'fp32' | 'fp16' | 'bf16';
type Colorizer = 'none' | 'mc2';
type Renderer = 'default' | 'manga2eng' | 'manga2eng_pillow' | 'none';
type Alignment = 'auto' | 'left' | 'center' | 'right';
type Direction = 'auto' | 'horizontal' | 'vertical';
/** 与 manga-image-translator `UpscaleConfig` 对齐的放大选项 */

export interface UpscaleConfig {
    /** 使用的放大器；需设置 `upscale_ratio` 才会生效 */
    upscaler?: Upscaler;
    /** 译后将先前放大的图像缩回原始尺寸（与 `upscale_ratio` 配合使用） */
    revert_upscaling?: boolean;
    /** 检测前对图像的放大倍数，有助于文字检测 */
    upscale_ratio?: number | null;
}
/** 与 manga-image-translator `RenderConfig` 对齐的渲染选项 */

export interface RenderConfig {
    /** 译文字体排版渲染器；部分选项会忽略其它参数 */
    renderer?: Renderer;
    /** 文本对齐 */
    alignment?: Alignment;
    /** 关闭描边 */
    disable_font_border?: boolean;
    /** 字号偏移，正数增大 */
    font_size_offset?: number;
    /** 最小输出字号；默认约为 image_sides_sum/200，-1 表示使用默认 */
    font_size_minimum?: number;
    /** 强制横排 / 竖排 / 自动 */
    direction?: Direction;
    uppercase?: boolean;
    lowercase?: boolean;
    /** GIMP 渲染用字体族名 */
    gimp_font?: string;
    /** 不在单词间插入连字符断行 */
    no_hyphenation?: boolean;
    /**
     * 覆盖 OCR 检测的前/背景色；无 # 的 hex，如 FFFFFF；
     * 或 FFFFFF:000000 表示白字黑底描边区域
     */
    font_color?: string | null;
    /** 行距 = font_size * 该值；横排默认约 0.01，竖排约 0.2 */
    line_spacing?: number | null;
    /** 固定字号渲染 */
    font_size?: number | null;
    /** 分镜与 text_region 的从右到左阅读顺序 */
    rtl?: boolean;
}
/** 与 manga-image-translator `TranslatorConfig` 对齐的翻译器与译后检查选项 */

export interface TranslatorConfig {
    /** 使用的语言翻译服务 */
    translator?: Translator;
    /** 目标语言代码 */
    target_lang?: string;
    /** 不跳过看似已在目标语言中的文本 */
    no_text_lang_skip?: boolean;
    /**
     * 若图源语言为所列语言之一则跳过翻译；逗号分隔多种语言。
     * 例：JPN,ENG
     */
    skip_lang?: string | null;
    /** GPT 配置文件路径，详见 README */
    gpt_config?: string | null;
    /**
     * 链式翻译：前一个译者的输出作为下一个的输入。
     * 例：google:JPN;sugoi:ENG
     */
    translator_chain?: string | null;
    /**
     * 按图中检测到的语言选择翻译器；未在规则中定义的语言使用链中第一个作为默认。
     * 例：google:JPN;sugoi:ENG
     */
    selective_translation?: string | null;

    /** 启用译后校验 */
    enable_post_translation_check?: boolean;
    /** 校验失败时的最大重试次数 */
    post_check_max_retry_attempts?: number;
    /** 触发幻觉检测所需的最少连续重复次数 */
    post_check_repetition_threshold?: number;
    /** 比例检查：译文中目标语言字符占比下限 */
    post_check_target_lang_threshold?: number;
}
/** 与 manga-image-translator `DetectorConfig` 对齐的文本检测选项 */

export interface DetectorConfig {
    /** 用于从图像生成文字掩膜的检测器；漫画场景勿用 craft，该模型并非为此设计 */
    detector?: Detector;
    /** 检测阶段使用的图像边长 */
    detection_size?: number;
    /** 文字检测阈值 */
    text_threshold?: number;
    /** 检测前旋转图像，可能改善检测效果 */
    det_rotate?: boolean;
    /** 检测前旋转图像以偏向竖排文字行，可能改善检测效果 */
    det_auto_rotate?: boolean;
    /** 检测前反色，可能改善检测效果 */
    det_invert?: boolean;
    /** 检测前伽马校正，可能改善检测效果 */
    det_gamma_correct?: boolean;
    /** 生成边界框时的阈值 */
    box_threshold?: number;
    /** 将文字骨架扩展为边界框时的比例 */
    unclip_ratio?: number;
}
/** 与 manga-image-translator `InpainterConfig` 对齐的修复/抹字选项 */

export interface InpainterConfig {
    /** 使用的图像修复模型 */
    inpainter?: Inpainter;
    /** 修复阶段使用的图像边长；过大易 OOM */
    inpainting_size?: number;
    /** LaMa 等修复模型的数值精度；能用 bf16 时优先 bf16 */
    inpainting_precision?: InpaintPrecision;
}
/** 与 manga-image-translator `ColorizerConfig` 对齐的上色选项 */

export interface ColorizerConfig {
    /** 上色阶段图像边长；-1 表示使用原图全尺寸 */
    colorization_size?: number;
    /** 上色强度相关去噪；0–255，默认 30；-1 关闭 */
    denoise_sigma?: number;
    /** 使用的上色模型 */
    colorizer?: Colorizer;
}
/** 与 manga-image-translator `OcrConfig` 对齐的 OCR 选项 */

export interface OcrConfig {
    /** Manga OCR 推理时是否合并 bbox */
    use_mocr_merge?: boolean;
    /** 光学字符识别模型 */
    ocr?: Ocr;
    /** 文本区域的最小字符长度 */
    min_text_length?: number;
    /**
     * 忽略非气泡区域文字的阈值，有效约 1–50；建议 5–10。
     * 过低可能误伤正常气泡，过高可能把非气泡当气泡
     */
    ignore_bubble?: number;
    /** 文本区域最低置信度；为 null 时使用模型默认 */
    prob?: number | null;
}
/** 与 manga-image-translator `Config` 对齐的管线配置（嵌套子配置） */

export interface TranslationConfig {
    /** 按正则按文字内容过滤区域，例 `'.*badtext.*'` */
    filter_text?: string | null;
    render?: RenderConfig;
    upscale?: UpscaleConfig;
    translator?: TranslatorConfig;
    detector?: DetectorConfig;
    colorizer?: ColorizerConfig;
    inpainter?: InpainterConfig;
    ocr?: OcrConfig;
    /** 不用分镜检测排序，而使用更简单的回退逻辑 */
    force_simple_sort?: boolean;
    /** 抹字区域卷积核大小，用于彻底清除文字残留 */
    kernel_size?: number;
    /** 扩展文字 mask 以消除原图遗留文字像素 */
    mask_dilation_offset?: number;
}
