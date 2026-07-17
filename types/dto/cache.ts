import { LocalPage } from "./local-page";

/** IndexedDB 单条缓存记录 */
export interface CachedTranslationEntry {
    key: string;                  // `${imageHash}:${configHash}`
    imageHash: string;
    configHash: string;
    resultBlob: Blob;
    mimeType: string;               // "image/png" | "image/jpeg"
    byteSize: number;               // resultBlob.size，用于容量统计
    createdAt: number;
    lastAccessedAt: number;
}

/** 查缓存时的命中结果 */
export interface CacheLookupHit {
    key: string;
    resultBlob: Blob;
    mimeType: string;
}

/** partition 输出：按原始 index 分组 */
export interface PartitionResult {
    /** 命中缓存的页：保留原始 index */
    cached: Array<{
        originalIndex: number;
        page: LocalPage;
        hit: CacheLookupHit;
    }>;
    /** 未命中的页：保留原始 index，用于提交 */
    uncached: Array<{
        originalIndex: number;
        page: LocalPage;
    }>;
}
