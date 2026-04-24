type Upscaler = 'waifu2x' | 'esrgan' | '4xultrasharp';
type Detector = 'default' | 'dbconvnext' | 'ctd' | 'craft' | 'paddle' | 'none';
type Ocr = '32px' | '48px' | '48px_ctc' | 'mocr';
type Translator = 'youdao' | 'baidu' | 'deepl' | 'papago' | 'caiyun' | 'chatgpt' | 'chatgpt_2stage' | 'none' | 'original' | 'sakura' | 'deepseek' | 'groq' | 'gemini' | 'gemini_2stage' | 'custom_openai' | 'offline' | 'nllb' | 'nllb_big' | 'sugoi' | 'jparacrawl' | 'jparacrawl_big' | 'm2m100' | 'm2m100_big' | 'mbart50' | 'qwen2' | 'qwen2_big';
type Inpainter = 'default' | 'lama_large' | 'lama_mpe' | 'sd' | 'none' | 'original';
type Renderer = 'default' | 'manga2eng' | 'manga2eng_pillow' | 'none';

// 翻译配置
export interface TranslationConfig {
  upscaler?: Upscaler;
  detector?: Detector;
  ocr?: Ocr;
  translator?: Translator;
  inpainter?: Inpainter;
  renderer?: Renderer;
  target_lang?: string;
  source_lang?: string;
  text_style?: 'manga' | 'standard' | 'artistic';
  _web_frontend_optimized?: boolean;
}

// 任务状态 (主表)
export type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'partial';

// 图片状态 (从表)
export type ImageStatus = 'pending' | 'processing' | 'completed' | 'failed';

// 任务记录 (主表)
export interface TranslationTask {
  id: string;
  userId: string;
  status: TaskStatus;

  // 统计信息
  totalImages: number;
  completedImages: number;
  failedImages: number;
  progress: number;

  config: TranslationConfig;

  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

// 图片记录 (从表)
export interface TranslationImage {
  id: string;
  taskId: string;
  imageIndex: number;
  status: ImageStatus;

  // 输入数据
  originalImagePath: string;
  originalImageSize?: number;
  originalImageWidth?: number;
  originalImageHeight?: number;

  // 输出数据
  folderName?: string;
  resultImagePath?: string;

  // 错误处理
  errorMessage?: string;
  retryCount: number;
  maxRetries: number;

  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

// 创建任务参数
export interface CreateTaskParams {
  userId: string;
  totalImages: number;
  config: TranslationConfig;
}

// 创建图片参数
export interface CreateImageParams {
  taskId: string;
  imageIndex: number;
  originalImagePath: string;
  originalImageSize?: number;
  originalImageWidth?: number;
  originalImageHeight?: number;
}

// 更新任务参数 (很少使用,因为有触发器自动更新)
export interface UpdateTaskParams {
  status?: TaskStatus;
  progress?: number;
  totalImages?: number;
  completedImages?: number;
  failedImages?: number;
  startedAt?: string;
  completedAt?: string;
  metadata?: Record<string, any>;
}

// 更新图片参数
export interface UpdateImageParams {
  status?: ImageStatus;
  folderName?: string;
  resultImagePath?: string;
  errorMessage?: string;
  retryCount?: number;
  startedAt?: string;
  completedAt?: string;
  metadata?: Record<string, any>;
}

// 任务详情 (含图片列表)
export interface TranslationTaskDetail extends TranslationTask {
  images: TranslationImage[];
}