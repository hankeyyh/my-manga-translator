import { TranslationIntent } from "@/types/do/translation-intent";
import { TranslationStreamEvent } from "@/types/do/translation-stream-event";
import { BizResult, SUCCESS_CODE } from "@/types/dto/response";
import { TranslationBackend, TranslationImageInput } from "../translation-backend";

export class MangaTranslatorBackend implements TranslationBackend {
    async streamTranslation(
        images: TranslationImageInput[],
        intent: TranslationIntent
    ): Promise<BizResult<AsyncIterable<TranslationStreamEvent>>> {

        return { code: SUCCESS_CODE, error: null, data: null };
    }

    async submitTranslation(): Promise<BizResult<ReadableStreamDefaultReader>> {
        return { code: SUCCESS_CODE, error: null, data: null }
    }

    async* eventStream(reader: ReadableStreamDefaultReader): AsyncGenerator<void, void, void> {

    }
}