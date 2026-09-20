import { TranslationIntent } from "@/types/do/translation-intent";
import { TranslationStreamEvent } from "@/types/do/translation-stream-event";
import { BizResult, NETWORK_ERROR_CODE, SUCCESS_CODE } from "@/types/dto/response";
import { TranslationBackend, TranslationImageInput } from "../translation-backend";
import { getMangaTranslatorBaseUrl } from "@/biz/utils/url";
import { randomUUID } from "crypto";
import { type SupportedLangCode } from "@/types/common";
import { TranslationConfig } from "./translation-config";
import { extensionFromMime } from "@/biz/utils/file";

/** `SUPPORTED_LANGS` code → MangaTranslator `output_language`（`ui/layout.py` `_ALPHABETICAL_LANGUAGES`）。CNR 无对应项，回退 English。 */
const MT_OUTPUT_LANGUAGE: Partial<Record<SupportedLangCode, string>> = {
    ENG: "English",
    CHS: "Chinese (Simplified)",
    CHT: "Chinese (Traditional)",
    ESP: "Spanish",
    ARA: "Arabic",
    FRA: "French",
    KOR: "Korean",
    JPN: "Japanese",
    CSY: "Czech",
    NLD: "Dutch",
    DEU: "German",
    HUN: "Hungarian",
    ITA: "Italian",
    POL: "Polish",
    PTB: "Portuguese",
    ROM: "Romanian",
    RUS: "Russian",
    TRK: "Turkish",
    UKR: "Ukrainian",
    VIN: "Vietnamese",
    SRP: "Serbian (Cyrillic)",
    HRV: "Croatian",
    THA: "Thai",
    IND: "Indonesian",
    FIL: "Filipino (Tagalog)",
};

function toMtOutputLanguage(code: string): string {
    const mapped = MT_OUTPUT_LANGUAGE[code as SupportedLangCode];
    if (mapped) {
        return mapped;
    }
    console.warn(`toMtOutputLanguage, unsupported MT language code: ${code}, fallback to English`);
    return "English";
}

interface MTJobsResponse {
    job_id: string,
    status: string,
    image_count: number,
}

interface SSEQueuedData {
    position: number;
}

interface SSEStartedData {
    worker_id: number;
}

interface SSEImageProgressData {
    image_id: string,
    index: number,
    stage: string,
    progress: number,
}

interface SSEImageCompletedData {
    image_id: string,
    index: number,
    output_path?: string,
}

interface SSEImageFailedData {
    image_id: string,
    index: number,
    error: string,
}

interface SSEJobCompletedData {
    success_count: number,
    error_count: number,
}

interface SSEJobFailedData {
    error: string;
}

type SSEEvent =
    | { id: string | null; event: "queued"; data: SSEQueuedData; }
    | { id: string | null; event: "started"; data: SSEStartedData; }
    | { id: string | null; event: "image_progress"; data: SSEImageProgressData; }
    | { id: string | null; event: "image_completed"; data: SSEImageCompletedData; }
    | { id: string | null; event: "image_failed"; data: SSEImageFailedData; }
    | { id: string | null; event: "job_completed"; data: SSEJobCompletedData; }
    | { id: string | null; event: "job_failed"; data: SSEJobFailedData; };

function toSseEvent(id: string | null, event: string, data: unknown): SSEEvent | null {
    if (typeof data !== "object" || data === null) {
        return null;
    }
    switch (event) {
        case "queued":
            return { id, event, data: data as SSEQueuedData };
        case "started":
            return { id, event, data: data as SSEStartedData };
        case "image_progress":
            return { id, event, data: data as SSEImageProgressData };
        case "image_completed":
            return { id, event, data: data as SSEImageCompletedData };
        case "image_failed":
            return { id, event, data: data as SSEImageFailedData };
        case "job_completed":
            return { id, event, data: data as SSEJobCompletedData };
        case "job_failed":
            return { id, event, data: data as SSEJobFailedData };
        default:
            return null;
    }
}

/** SSE 字段名后可选一个空格；`data:` 可出现多行，按协议用 `\n` 拼接。 */
function parseSseEvent(block: string): SSEEvent | null {
    let id: string | null = null;
    // WHATWG 规定：一帧里如果没有 event: 行，事件类型就是 "message"。
    let event = "message";
    let dataRaw: string = "";
    for (const rawLine of block.split(/\r?\n/)) {
        if (!rawLine || rawLine.startsWith(":")) {
            continue;
        }
        const colonIndex = rawLine.indexOf(":");
        const field = colonIndex === -1 ? rawLine : rawLine.slice(0, colonIndex);
        let value = colonIndex === -1 ? "" : rawLine.slice(colonIndex + 1);
        if (value.startsWith(" ")) {
            value = value.slice(1);
        }
        switch (field) {
            case "id":
                id = value;
                break;
            case "event":
                event = value;
                break;
            case "data":
                dataRaw += value;
                break;
        }
    }
    if (id === null && event === "message" && dataRaw.length === 0) {
        return null;
    }
    
    let parsed: any;
    try {
        parsed = JSON.parse(dataRaw);
    } catch {
        return null;
    }

    return toSseEvent(id, event, parsed);
}

/** 按空行切出完整 SSE 事件；未闭合的尾部留在 remainder。 */
function consumeSseEvents(buffer: string, flush: boolean): { events: SSEEvent[]; remainder: string; } {
    // 匹配 \n\n: unix。\r\n\r\n: HTTP Windows 的CRLF
    const parts = buffer.split(/\r?\n\r?\n/);
    const remainder = flush ? "" : (parts.pop() ?? "");
    const events: SSEEvent[] = [];
    for (const block of parts) {
        const sse = parseSseEvent(block);
        if (sse) {
            events.push(sse);
        }
    }
    return { events, remainder };
}

function mapToTranslationStreamEvent(event: SSEEvent): TranslationStreamEvent {
    console.debug(`MT SSE: ${JSON.stringify(event)}`);
    switch (event.event) {
        case "queued":
            return { type: "queue", position: event.data.position };
        case "started":
            return { type: "ready" };
        case "image_progress":
            return { type: "progress", message: event.data.stage };
        case "image_completed":
            return { type: "image_completed", imageId: event.data.image_id, outputPath: event.data.output_path };
        case "image_failed":
            return { type: "image_failed", imageId: event.data.image_id, error: event.data.error };
        case "job_completed":
            return { type: "batch_completed" };
        case "job_failed":
            return { type: "batch_error", error: event.data.error };
    }
}

export class MangaTranslatorBackend implements TranslationBackend {
    async streamTranslation(images: TranslationImageInput[], intent: TranslationIntent): Promise<BizResult<AsyncIterable<TranslationStreamEvent>>> {
        const config = this.toTranslationConfig(intent);
        // 提交翻译任务
        const submitResult = await this.submitJob(images, config);
        if (submitResult.error) {
            return { code: submitResult.code, error: submitResult.error, data: null };
        }
        const data = submitResult.data!;

        // 读取stream event
        const result = await this.getJobEventReader(data.job_id);
        if (result.error) {
            return { code: result.code, error: result.error, data: null };
        }
        const reader = result.data!;

        return {
            code: SUCCESS_CODE,
            error: null,
            data: this.streamJobEvent(reader)
        };
    }

    private toTranslationConfig(intent: TranslationIntent): TranslationConfig {
        const isFast = intent.mode === "fast";
        return {
            input_language: "", 
            output_language: toMtOutputLanguage(intent.targetLang),
            provider: "deepl",
            model_name: "deepl",
            translation_mode: "two-step",
            ocr_method: "manga-ocr",
            font_name: intent.fontName,
            detection: {
                bubble_detector_model: "yolo_2",
                use_panel_sorting: !isFast,
            },
            outside_text: {
                enabled: true,
                inpainting_method: "lama_large",
                lama_use_crf: !isFast,
                lama_detect_size: isFast ? 1024 : 2048,
                lama_inpainting_size: isFast ? 1024 : 2048,
            },
            rendering: {
                rtl: true,  // 控制的是气泡/分镜的阅读顺序。true：日漫默认；false：美漫 / 韩漫 / 国漫
            },
            output_format: "webp",
        };
    }

    private preparePayload(images: TranslationImageInput[], config: TranslationConfig): string {
        const reqImages = images.map((image, i) => ({
            "image_id": image.imageId,
            "index": i,
        }));
        const outputPaths = images.map((image) => image.outputPath);

        const payload = {
            "job_id": randomUUID(),
            "images": reqImages,
            "output": {
                "type": "supabase",
                "bucket": "translation_storage",
                "paths": outputPaths,
            },
            "config": config,
        };
        return JSON.stringify(payload);
    }

    private async submitJob(images: TranslationImageInput[], config: TranslationConfig): Promise<BizResult<MTJobsResponse>> {
        try {
            const formData = new FormData();
            const payload = this.preparePayload(images, config);
            formData.append("payload", payload);
            for (const image of images) {
                // MT 拿filename只为了取suffix，不需要真实文件名
                const ext = extensionFromMime(image.blob.type) || "png";
                formData.append("images", image.blob, `${image.imageId}.${ext}`);
            }

            const url = getMangaTranslatorBaseUrl();
            const response = await fetch(`${url}/v1/jobs`, {
                method: "POST",
                body: formData,
                headers: {
                    Authorization: `Bearer ${process.env.MT_API_KEY}`
                }
            });
            if (!response.ok) {
                const detail = await response.text();
                console.error(`submitJob, fetch MT algo svr fail, error: ${response.statusText}, detail: ${detail}`);
                return { code: NETWORK_ERROR_CODE, error: new Error("Fetch MT algo svr fail"), data: null };
            }
            const body = await response.json() as MTJobsResponse;

            return { code: SUCCESS_CODE, error: null, data: body };
        } catch (err) {
            const errMsg = err instanceof Error ? err.message : "Unknown Error";
            console.error(`submitJob, fetch MT algo svr fail, unexcepted error: ${errMsg}`);
            return {
                code: NETWORK_ERROR_CODE,
                error: err instanceof Error ? err : new Error(String(err)),
                data: null
            };
        }
    }

    private async getJobEventReader(jobId: string): Promise<BizResult<ReadableStreamDefaultReader>> {
        try {
            const url = getMangaTranslatorBaseUrl();
            const response = await fetch(`${url}/v1/jobs/${jobId}/events`, {
                headers: {
                    Authorization: `Bearer ${process.env.MT_API_KEY}`
                }
            });
            if (!response.ok) {
                const detail = await response.text();
                console.error(`getJobEventReader, fetch MT algo svr fail, error: ${response.statusText}, detail: ${detail}`);
                return { code: NETWORK_ERROR_CODE, error: new Error("Fetch MT algo svr fail"), data: null };
            }
            const reader = response.body?.getReader();
            if (!reader) {
                console.error("getJobEventReader, no response body");
                return { code: NETWORK_ERROR_CODE, data: null, error: new Error("no response body") };
            }
            return { code: SUCCESS_CODE, error: null, data: reader };
        } catch (err) {
            const errMsg = err instanceof Error ? err.message : "Unknown Error";
            console.error(`getJobEventReader, fetch MT algo svr fail, unexcepted error: ${errMsg}`);
            return {
                code: NETWORK_ERROR_CODE,
                error: err instanceof Error ? err : new Error(String(err)),
                data: null
            };
        }
    }

    private async* streamJobEvent(reader: ReadableStreamDefaultReader<Uint8Array<ArrayBuffer>>): AsyncGenerator<TranslationStreamEvent, void, void> {
        const textDecoder = new TextDecoder("utf-8");
        let buffer = "";
        let sawTerminal = false;
        const emit = (events: SSEEvent[]): TranslationStreamEvent[] => {
            const mapped: TranslationStreamEvent[] = [];
            for (const event of events) {
                const streamEvent = mapToTranslationStreamEvent(event);
                if (streamEvent.type === "batch_completed" || streamEvent.type === "batch_error") {
                    sawTerminal = true;
                }
                mapped.push(streamEvent);
            }
            return mapped;
        };
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    // 流结束时 value 通常是 undefined。
                    // decode(空字节, { stream: false }) 把内部缓存冲进字符串，拼进 buffer
                    buffer += textDecoder.decode();
                    const { events } = consumeSseEvents(buffer, true);
                    for (const streamEvent of emit(events)) {
                        yield streamEvent;
                    }
                    if (!sawTerminal) {
                        throw new Error("stream closed before batch_completed");
                    }
                    break;
                }
                if (!value || value.length === 0) {
                    continue;
                }
                // strean: true, 后面可能还有字节。如果这次 value 恰好停在 UTF-8 多字节中间（比如一个汉字 3 个字节只到了 2 个），
                // 它不会立刻输出 �，而是把这几个字节先藏在解码器内部，等下一块拼完再输出。
                buffer += textDecoder.decode(value, { stream: true });
                const consumed = consumeSseEvents(buffer, false);
                buffer = consumed.remainder;
                for (const streamEvent of emit(consumed.events)) {
                    yield streamEvent;
                }
            }
        } finally {
            await reader.cancel();
        }
    }
}