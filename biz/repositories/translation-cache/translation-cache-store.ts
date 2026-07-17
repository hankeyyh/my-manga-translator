import {
    idbDelete,
    idbGet,
    idbGetAll,
    idbPut,
    openIndexedDB,
} from "@/biz/repositories/translation-cache/indexdb";
import {
    CachedTranslationEntry,
} from "@/types/dto/cache";

/** 容量上限常量 */
export const MAX_CACHE_BYTES = 200 * 1024 * 1024; // 200MB
export const DB_NAME = "manga-translator-cache";
export const DB_VERSION = 1;
export const STORE_NAME = "translations";


/** IndexedDB 底层封装，负责 CRUD + 容量控制 */
export class TranslationCacheStore {
    private db: IDBDatabase | null = null;

    async open(): Promise<void> {
        if (this.db) {
            return;
        }
        this.db = await openIndexedDB(DB_NAME, DB_VERSION, (db) => {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: "key" });
                store.createIndex("lastAccessedAt", "lastAccessedAt");
                store.createIndex("createdAt", "createdAt");
            }
        });
    }

    async get(key: string): Promise<CachedTranslationEntry | null> {
        await this.open();
        const entry = await idbGet<CachedTranslationEntry>(this.db!, STORE_NAME, key);
        if (!entry) {
            return null;
        }

        // LRU 时间戳更新失败不应阻断读取（视为命中）
        try {
            entry.lastAccessedAt = Date.now();
            await idbPut(this.db!, STORE_NAME, entry);
        } catch {
            // ignore
        }
        return entry;
    }

    async put(entry: CachedTranslationEntry): Promise<void> {
        await this.open();
        await this.evictIfNeeded(entry.byteSize, entry.key);
        await idbPut(this.db!, STORE_NAME, entry);
    }

    /** 写入前确保总容量 <= 200MB，按 lastAccessedAt 升序淘汰 */
    private async evictIfNeeded(incomingBytes: number, key: string): Promise<void> {
        const all = await idbGetAll<CachedTranslationEntry>(this.db!, STORE_NAME);
        const existing = all.find((entry) => entry.key === key);
        let totalBytes = all.reduce((sum, entry) => sum + entry.byteSize, 0);

        if (existing) {
            totalBytes -= existing.byteSize;
        }

        if (totalBytes + incomingBytes <= MAX_CACHE_BYTES) {
            return;
        }

        const sorted = [...all]
            .filter((entry) => entry.key !== key)
            .sort((a, b) => a.lastAccessedAt - b.lastAccessedAt);

        for (const entry of sorted) {
            if (totalBytes + incomingBytes <= MAX_CACHE_BYTES) {
                break;
            }
            await idbDelete(this.db!, STORE_NAME, entry.key);
            totalBytes -= entry.byteSize;
        }
    }

    async getTotalBytes(): Promise<number> {
        await this.open();
        const all = await idbGetAll<CachedTranslationEntry>(this.db!, STORE_NAME);
        return all.reduce((sum, entry) => sum + entry.byteSize, 0);
    }
};
