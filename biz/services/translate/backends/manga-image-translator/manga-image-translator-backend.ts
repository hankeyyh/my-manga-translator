import { TranslationIntent } from "@/types/do/translation-intent";
import { TranslationStreamEvent } from "@/types/do/translation-stream-event";
import { BizResult, NETWORK_ERROR_CODE, SUCCESS_CODE } from "@/types/dto/response";
import { TranslationBackend, TranslationImageInput } from "../translation-backend";
import { getMangaImageTranslatorBaseUrl } from "@/biz/utils/url";
import { TranslationConfig } from "./translation-config";

export class MangaImageTranslatorBackend implements TranslationBackend {
    async streamTranslation(images: TranslationImageInput[], intent: TranslationIntent): Promise<BizResult<AsyncIterable<TranslationStreamEvent>>> {
        const blobs = images.map((value) => value.blob);
        const config = this.toTranslationConfig(images, intent);
        const result = await this.submitBatchTranslation(blobs, config);
        if (result.error) {
            return { code: result.code, error: result.error, data: null };
        }

        const reader = result.data!;

        return { code: SUCCESS_CODE, error: null, data: this.parseTranslationStream(reader) };
    }

    private toTranslationConfig(images: TranslationImageInput[], intent: TranslationIntent): TranslationConfig {
        const imageIds = images.map((value) => value.imageId);
        const outputPaths = images.map((value) => value.outputPath);
        // TODO 根据intent.mode 映射
        return {
            translator: {
                translator: "deepl",
                model_name: "deepl",
                target_lang: intent.targetLang,
            },
            render: {
                renderer: "reflow",
                font_name: intent.fontName,
                fit_to_box: true,
                rtl: intent.rtl,
                no_hyphenation: !intent.hyphenation,
            },
            detector: {
                detector: "ctd",
            },
            inpainter: {
                inpainter: "lama_large",
            },
            ocr: {
                ocr: "mocr",
            },
            mask_dilation_offset: 30,
            save: {
                save_to: "supabase_storage",
                supabase_storage_bucket: "translation_storage",
                supabase_storage_paths: outputPaths,
            },
            image_identifiers: imageIds,
        };
    }

    private async submitBatchTranslation(imageBlobs: Blob[], config: TranslationConfig): Promise<BizResult<ReadableStreamDefaultReader>> {
        const algoBaseUrl = getMangaImageTranslatorBaseUrl();
        try {
            const bodyData = new FormData();
            for (const imageBlob of imageBlobs) {
                bodyData.append("images", imageBlob);
            }
            bodyData.append("config", JSON.stringify(config));
            const response = await fetch(`${algoBaseUrl}/translate/batch/image/stream/web`, {
                method: "POST",
                body: bodyData,
            });
            if (!response.ok) {
                console.error(`submitBatchTranslation, fetch algo svr fail, error: ${response.statusText}`);
                return { code: NETWORK_ERROR_CODE, data: null, error: new Error("fetch algo svr fail") };
            }
            const reader = response.body?.getReader();
            if (!reader) {
                console.error("submitBatchTranslation, no response body");
                return { code: NETWORK_ERROR_CODE, data: null, error: new Error("no response body") };
            }
            return { code: SUCCESS_CODE, data: reader, error: null };
        } catch (err) {
            const errMsg = err instanceof Error ? err.message : "Unknown Error";
            console.error(`submitBatchTranslation, fetch algo svr fail, error: ${errMsg}`);
            return {
                code: NETWORK_ERROR_CODE,
                data: null,
                error: err instanceof Error ? err : new Error(String(err)),
            };
        }
    }

    // async generator implements AsyncIterable + AsyncIterator
    // interface AsyncIterable { [Symbol.asyncIterator]() }
    // interface AsyncIterator { next(); return(value); throw(exception); }
    // async generator [Symbol.asyncIterator]() 返回自己
    private async* parseTranslationStream(reader: ReadableStreamDefaultReader<Uint8Array<ArrayBuffer>>): AsyncGenerator<TranslationStreamEvent, void, void> {
        let buffer: Uint8Array<ArrayBuffer> = new Uint8Array();
        const textDecoder = new TextDecoder("utf-8");
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    // 不应该走到这里，通过协议status判断结束
                    throw new Error('stream closed before batch_completed');
                }
                if (!value || value.length === 0) {
                    continue;
                }
                // merge value
                buffer = this.mergeUint8Array(buffer, value);

                // 解析流式数据: [1 byte status][4 bytes size][n bytes data]
                while (buffer.byteLength >= 5) {
                    const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
                    const status = view.getUint8(0);
                    const dataSize = view.getUint32(1, false);
                    const frameSize = 5 + dataSize;
                    if (view.byteLength < frameSize) {
                        break;
                    }
                    // 当前完整数据
                    const data = buffer.slice(5, frameSize);
                    // buffer 剩下的数据属于下一轮
                    buffer = buffer.slice(frameSize);
                    const message = textDecoder.decode(data);

                    // 处理数据包, 
                    // status=0 接口执行成功后，每张图片发一次; 
                    // status=1 过程数据;
                    // - image_completed:{image_identifier}:{output_path} 保存成功
                    // - image_failed:{image_identifier}:{errMsg} 翻译过程遇到失败
                    // status=2 整体异常报错;
                    // status=3 排队中;
                    // status=4 即将开始;
                    // status=5 整体翻译完成
                    switch (status) {
                        case 1: {
                            console.debug("status: 1 ", " message: ", message);
                            const event = this.parseProgressEvent(message);
                            if (event) {
                                yield event;
                            }
                            break;
                        }
                        case 2: {
                            console.debug("status: 2 ", " message: ", message);
                            yield { type: "batch_error", error: message };
                            return;
                        }
                        case 3: {
                            console.debug("status: 3 ", " message: ", message);
                            yield { type: "queue", position: Number(message) };
                            break;
                        }
                        case 4: {
                            console.debug("status: 4 ", " message: ", message);
                            yield { type: "ready" };
                            break;
                        }
                        case 5: {
                            console.debug("status: 5 ", " message: ", message);
                            yield { type: "batch_completed" };
                            return;
                        }
                    }
                }
            }
        } finally {
            await reader.cancel();
        }
    }

    private parseProgressEvent(message: string): TranslationStreamEvent | null {
        if (message.startsWith("image_completed:")) {
            const parsed = this.parseImageProgressMessage(message, "image_completed:");
            if (!parsed) {
                return null;
            }
            return { type: "image_completed", imageId: parsed.imageId, outputPath: parsed.payload };
        } else if (message.startsWith("image_failed:")) {
            const parsed = this.parseImageProgressMessage(message, "image_failed:");
            if (!parsed) {
                return null;
            }
            return { type: "image_failed", imageId: parsed.imageId, error: parsed.payload };
        }
        return { type: "progress", message: message };
    }

    private parseImageProgressMessage(message: string, prefix: string): { imageId: string; payload: string; } | null {
        if (!message.startsWith(prefix)) {
            return null;
        }
        const content = message.slice(prefix.length);
        const colonIndex = content.indexOf(":");
        if (colonIndex <= 0) {
            return null;
        }
        const imageId = content.slice(0, colonIndex);
        const payload = content.slice(colonIndex + 1);
        if (!imageId || !payload) {
            return null;
        }
        return { imageId, payload };
    }

    private mergeUint8Array(a: Uint8Array<ArrayBuffer>, b: Uint8Array<ArrayBuffer>): Uint8Array<ArrayBuffer> {
        const merged = new Uint8Array(a.length + b.length);
        merged.set(a, 0);
        merged.set(b, a.length);
        return merged;
    }
}