import { ImageStatus } from "../do/translation-image";

// stalled - 超时
type WebImageStatus = ImageStatus | "stalled";

export interface MangaPage {
    name: string;
    // originalFile 本地上传时存在；历史回放等仅 URL 场景可省略
    originalFile?: File;
    originalUrl: string;
    originalSize: string;
    status?: WebImageStatus;
    resultUrl?: string;
    imageId?: string;
    taskId?: string;
}
