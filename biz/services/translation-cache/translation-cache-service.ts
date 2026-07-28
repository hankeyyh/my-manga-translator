import { TranslationCacheStore } from "@/biz/repositories/translation-cache/translation-cache-store";
import { bytesToHex, computeFileHash } from "@/biz/utils/file";
import { MangaPage } from "@/types/dto/manga-page";
import { TranslationConfig } from "@/types/do/translation-config";
import { PartitionResult } from "@/types/dto/cache";
import { LocalPage } from "@/types/dto/local-page";

/**
 * 提取影响翻译结果的配置字段，排序后稳定序列化。
 * 与 page.tsx submitTask 里实际提交的 config 保持一致。
 */
function extractRelevantConfig(config: TranslationConfig): object {
    return {
        translator: {
            translator: config.translator?.translator,
            model_name: config.translator?.model_name,
            target_lang: config.translator?.target_lang,
        },
        render: {
            font_name: config.render?.font_name,
            fit_to_box: config.render?.fit_to_box,
        },
        detector: { detector: config.detector?.detector },
        inpainter: { inpainter: config.inpainter?.inpainter },
        ocr: {
            ocr: config.ocr?.ocr,
            use_mocr_merge: config.ocr?.use_mocr_merge,
        },
        upscale: {
            upscaler: config.upscale?.upscaler,
            upscale_ratio: config.upscale?.upscale_ratio,
            revert_upscaling: config.upscale?.revert_upscaling,
        },
    };
}

/** 配置 → 短 hash，作为 cache key 的一部分 */
async function computeConfigHash(config: TranslationConfig): Promise<string> {
    const relevant = extractRelevantConfig(config);
    const json = JSON.stringify(relevant);
    const buffer = new TextEncoder().encode(json);
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    return bytesToHex(new Uint8Array(hashBuffer)).slice(0, 16);
}

function buildCacheKey(imageHash: string, configHash: string): string {
    return `${imageHash}:${configHash}`;
}

export interface PartitionResultV2 {
    cached: Array<{
        mangaPage: MangaPage,
        cacheResultBlob: Blob;
    }>,
    uncached: Array<{
        mangaPage: MangaPage,
    }>;
}

/** 对外业务 API，page.tsx 只依赖这一层 */
export class TranslationCacheService {
    constructor(private cacheStore: TranslationCacheStore) { }

    /**
     * 提交前：对 pages 逐张查缓存，按 originalIndex 分组
     */
    async partitionPagesByCache(
        pages: LocalPage[],
        config: TranslationConfig,
    ): Promise<PartitionResult> {
        const allUncached = (): PartitionResult => ({
            cached: [],
            uncached: pages.map((page, originalIndex) => ({ originalIndex, page })),
        });

        let configHash: string;
        try {
            configHash = await computeConfigHash(config);
        } catch {
            // 配置 hash 失败时整批降级为未命中，不阻断翻译提交
            return allUncached();
        }

        const cached: PartitionResult["cached"] = [];
        const uncached: PartitionResult["uncached"] = [];

        for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            try {
                const imageHash = await computeFileHash(page.file);
                const key = buildCacheKey(imageHash, configHash);
                const entry = await this.cacheStore.get(key);

                if (entry) {
                    cached.push({
                        originalIndex: i,
                        page,
                        hit: {
                            key: entry.key,
                            resultBlob: entry.resultBlob,
                            mimeType: entry.mimeType,
                        },
                    });
                } else {
                    uncached.push({ originalIndex: i, page });
                }
            } catch {
                // 单页 hash / 读缓存失败时该页按未命中处理
                uncached.push({ originalIndex: i, page });
            }
        }

        return { cached, uncached };
    }

    async partitionPagesByCacheV2(pages: MangaPage[], config: TranslationConfig): Promise<PartitionResultV2> {
        let configHash: string;
        try {
            configHash = await computeConfigHash(config);
        } catch {
            return { cached: [], uncached: pages.map((value) => { return { mangaPage: value }; }) };
        }
        const cached: PartitionResultV2["cached"] = [];
        const uncached: PartitionResultV2["uncached"] = [];
        for (const page of pages) {
            try {
                const fileHash = await computeFileHash(page.originalFile);
                const key = buildCacheKey(fileHash, configHash);
                const entry = await this.cacheStore.get(key);
                if (entry) {
                    cached.push({ mangaPage: page, cacheResultBlob: entry.resultBlob });
                } else {
                    uncached.push({ mangaPage: page });
                }
            } catch (err) {
                uncached.push({ mangaPage: page });
            }
        }
        return { cached, uncached };
    }

    /**
     * 翻译成功后：下载远程结果并写入缓存
     */
    async saveFromResultUrl(
        file: File,
        config: TranslationConfig,
        resultImageUrl: string,
    ): Promise<void> {
        try {
            const response = await fetch(resultImageUrl);
            if (!response.ok) {
                return;
            }

            const resultBlob = await response.blob();
            const imageHash = await computeFileHash(file);
            const configHash = await computeConfigHash(config);

            await this.cacheStore.put({
                key: buildCacheKey(imageHash, configHash),
                imageHash,
                configHash,
                resultBlob,
                mimeType: resultBlob.type || "image/png",
                byteSize: resultBlob.size,
                createdAt: Date.now(),
                lastAccessedAt: Date.now(),
            });
        } catch {
            // IndexedDB / fetch 失败时静默降级，不影响主流程
        }
    }
}

export const translationCacheService = new TranslationCacheService(new TranslationCacheStore());