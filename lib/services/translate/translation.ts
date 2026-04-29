import { Result } from "@/lib/types";
import { TranslationConfig, TranslationImage } from "./translation-types";

export const MAX_TRANSLATION_RETRIES = 3;
export class TranslationService {
    private baseUrl: string;
    private modalStorage = "manga-results";

    constructor() {
        this.baseUrl = process.env.MANGA_IMAGE_TRANSLATOR_BASE_URL || 'http://127.0.0.1:8000';
    }

    /**
   * ===== 调用模型翻译服务 =====
   */
    async submitTranslation(imageBlob: Blob, config: TranslationConfig): Promise<Result<{ folderName: string }>> {
        const formData = new FormData();
        formData.append('image', imageBlob);
        formData.append('config', JSON.stringify(this.buildApiConfig(config)));

        const response = await fetch(
            `${this.baseUrl}/translate/with-form/image/stream/web`,
            {
                method: 'POST',
                body: formData,
            }
        );

        if (!response.ok) {
            console.error('❌ submitTranslation error:', response.statusText);
            return {
                data: null,
                error: new Error(`Translation API error: ${response.statusText}`),
            };
        }

        // 解析流式响应获取 folderName
        const folderName = await this.parseFolderNameFromStream(response);
        if (!folderName) {
            return {
                data: null,
                error: new Error('Folder name not found'),
            };
        }

        return {
            data: { folderName },
            error: null,
        };
    }

    /**
   * 将前端扁平配置映射为后端 Config 所需的嵌套结构
   */
    private buildApiConfig(config: TranslationConfig) {
        return {
            _web_frontend_optimized: true,
            ...(config.upscaler ? { upscale: { upscaler: config.upscaler } } : {}),
            ...(config.detector ? { detector: { detector: config.detector } } : {}),
            ...(config.ocr ? { ocr: { ocr: config.ocr } } : {}),
            ...(config.inpainter ? { inpainter: { inpainter: config.inpainter } } : {}),
            ...(config.renderer ? { render: { renderer: config.renderer } } : {}),
            ...(config.translator || config.target_lang || config.source_lang
                ? {
                    translator: {
                        ...(config.translator ? { translator: config.translator } : {}),
                        ...(config.target_lang ? { target_lang: config.target_lang } : {}),
                        ...(config.source_lang ? { source_lang: config.source_lang } : {}),
                    },
                }
                : {}),
        };
    }

    /**
   * 从流式响应中解析 folderName
   * 注意: 这个实现需要根据实际的响应格式调整
   */
    private extractFolderNameFromProgressText(text: string): string {
        // 后端会发送类似:
        // - rendering_folder:<folderName>
        // - final_ready:<folderName>
        // 兼容历史可能的 folder_name/folder-name 形式。
        const patterns = [
            /(?:rendering_folder|final_ready)\s*:\s*([a-zA-Z0-9_-]+)/i,
            /folder[_-]?name["\s:]+([a-zA-Z0-9_-]+)/i,
        ];
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match?.[1]) return match[1];
        }
        return "";
    }

    private async parseFolderNameFromStream(response: Response): Promise<string> {
        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        let folderName = '';
        let buffer: Uint8Array<ArrayBufferLike> = new Uint8Array(0);
        const decoder = new TextDecoder();

        const concatUint8Array = (
            a: Uint8Array<ArrayBufferLike>,
            b: Uint8Array<ArrayBufferLike>
        ): Uint8Array<ArrayBufferLike> => {
            const merged = new Uint8Array(a.length + b.length);
            merged.set(a, 0);
            merged.set(b, a.length);
            return merged;
        };

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                if (!value || value.length === 0) continue;

                // 解析流式数据: [1 byte status][4 bytes size][n bytes data]
                // 注意：一个 chunk 可能包含多个包，也可能是半包，需要缓存并拼包。
                buffer = concatUint8Array(buffer, value);

                while (buffer.length >= 5) {
                    const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
                    const status = buffer[0];
                    const size = view.getUint32(1, false); // big-endian
                    const frameSize = 5 + size;

                    if (buffer.length < frameSize) break;

                    const data = buffer.slice(5, frameSize);
                    buffer = buffer.slice(frameSize);

                    if (status === 1) {
                        // 进度消息里可能包含 folder 名称。
                        const text = decoder.decode(data);
                        const extracted = this.extractFolderNameFromProgressText(text);
                        if (extracted) {
                            folderName = extracted;
                            // 已拿到 folderName，无需继续解析后续流
                            return folderName;
                        }
                    } else if (status === 2) {
                        const errorMsg = decoder.decode(data);
                        console.error("error:", errorMsg);
                        throw new Error(errorMsg);
                    }
                }
            }
        } finally {
            reader.releaseLock();
        }

        // 如果无法从流中解析,尝试从响应头获取
        if (!folderName) {
            console.debug("response.headers:", response.headers);
            folderName = response.headers.get('X-Result-Folder') ||
                response.headers.get('X-Folder-Name') || '';
        }

        return folderName;
    }

    /**
   * 检查翻译结果是否就绪
   */
    async checkResultReady(folderName: string): Promise<boolean> {
        try {
            const response = await fetch(
                this.getResultUrl(folderName),
                { method: 'HEAD' }
            );
            return response.ok;
        } catch (error) {
            console.error('❌ checkResultReady error:', error);
            return false;
        }
    }

    /**
     * 获取翻译结果图片 URL
     */
    getResultUrl(folderName: string): string {
        return `${this.baseUrl}/result/${folderName}/final.png`;
    }

    /**
     * 下载翻译结果
     */
    async downloadResult(folderName: string): Promise<Result<Blob>> {  
        const response = await fetch(this.getResultUrl(folderName));

        if (!response.ok) {
            return {
                data: null,
                error: new Error(`Failed to download result: ${response.statusText}`),
            };
        }

        return {
            data: await response.blob(),
            error: null,
        };
    }

    getImageRetryCount(image: TranslationImage): number {
        return Math.min((image.retryCount || 0) + 1, MAX_TRANSLATION_RETRIES);
    }
}