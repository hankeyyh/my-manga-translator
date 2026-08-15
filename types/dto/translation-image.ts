import { TranslationImage } from "../do/translation-image";

export interface TranslationImageView extends TranslationImage {
    originalImageUrl: string;
    resultImageUrl: string;
}

export interface TranslationImageLiteView extends TranslationImage {
    resultImageUrl: string;
}
