export function openIndexedDB(
    name: string,
    version: number,
    onUpgrade: (db: IDBDatabase) => void,
): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(name, version);
        request.onerror = () => reject(request.error ?? new Error("Failed to open IndexedDB"));
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = () => onUpgrade(request.result);
    });
}

export function idbGet<T>(db: IDBDatabase, storeName: string, key: string): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.get(key);
        request.onerror = () => reject(request.error ?? new Error("Failed to read IndexedDB"));
        request.onsuccess = () => resolve(request.result as T | undefined);
    });
}

export function idbPut<T>(db: IDBDatabase, storeName: string, value: T): Promise<void> {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.put(value);
        request.onerror = () => reject(request.error ?? new Error("Failed to write IndexedDB"));
        request.onsuccess = () => resolve();
    });
}

export function idbGetAll<T>(db: IDBDatabase, storeName: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        request.onerror = () => reject(request.error ?? new Error("Failed to read IndexedDB"));
        request.onsuccess = () => resolve((request.result ?? []) as T[]);
    });
}

export function idbDelete(db: IDBDatabase, storeName: string, key: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.delete(key);
        request.onerror = () => reject(request.error ?? new Error("Failed to delete IndexedDB entry"));
        request.onsuccess = () => resolve();
    });
}
