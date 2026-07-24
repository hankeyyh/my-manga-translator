import { zipSync, type Zippable } from 'fflate';

export async function packZip(items: { fileName: string, blob: Blob; }[]): Promise<Uint8Array<ArrayBuffer>> {
    const zippable: Zippable = {};
    for (const item of items) {
        zippable[item.fileName] = [await item.blob.bytes(), { level: 0 }];
    }
    return zipSync(zippable);
}