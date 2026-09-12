import { TranslationStreamEvent } from "@/types/do/translation-stream-event";
import { TranslationIntent } from "@/types/do/translation-intent";
import { BizResult } from "@/types/dto/response";

export interface TranslationImageInput {
    imageId: string,
    blob: Blob,
    outputPath: string,
}

export interface TranslationBackend {
    streamTranslation(
        images: TranslationImageInput[],
        intent: TranslationIntent
    ): Promise<BizResult<AsyncIterable<TranslationStreamEvent>>>;
}