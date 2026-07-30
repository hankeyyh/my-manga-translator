import { ImageStatus } from "../do/translation-image";

type WebImageStatus = ImageStatus | "stalled";

export interface MangaPage {
    name: string;
    originalFile: File;
    originalUrl: string;
    originalSize: string;
    status?: WebImageStatus;
    resultUrl?: string;
    imageId?: string;
}
