/**
 * 获取文件扩展名
 */
export function getFileExtension(file: File) {
    const extFromName = file.name.includes('.')
        ? file.name.split('.').pop()?.toLowerCase()
        : undefined;
    const extFromType = file.type.includes('/')
        ? file.type.split('/').pop()?.toLowerCase()
        : undefined;
    return extFromName || extFromType;
}

/** 对 File 原始字节计算 SHA-256 hex 字符串 */
export async function computeFileHash(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    return bytesToHex(new Uint8Array(hashBuffer));
}

export function bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}
