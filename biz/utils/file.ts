const MIME_TO_EXT: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/avif": "avif",
};

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

/** 取路径最后一段的扩展名，如 `a/b/c.png` → `png` */
export function extensionFromPath(path: string): string | undefined {
    const name = path.split("/").pop() ?? path;
    const lastDot = name.lastIndexOf(".");
    if (lastDot <= 0 || lastDot === name.length - 1) {
        return undefined;
    }
    return name.slice(lastDot + 1).toLowerCase();
}

export function extensionFromMime(mime: string | undefined): string | undefined {
    if (!mime) {
        return undefined;
    }
    const key = mime.split(";")[0].trim().toLowerCase();
    return MIME_TO_EXT[key];
}

/** `page.webp` + `png` → `page.png`；无扩展名则直接追加 */
export function replaceFileExtension(filename: string, ext: string): string {
    const normalized = ext.replace(/^\./, "").toLowerCase();
    const lastDot = filename.lastIndexOf(".");
    const base = lastDot > 0 ? filename.slice(0, lastDot) : filename;
    return `${base}.${normalized}`;
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
