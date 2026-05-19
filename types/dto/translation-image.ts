import { TranslationImage } from "../do/translation-image";

export interface TranslationImageView extends TranslationImage {
    originalImageUrl: string;
    resultImageUrl: string;
}