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

const WEBP_QUALITY = 0.9;

function isWebpFile(file: File): boolean {
    return file.type === "image/webp" || getFileExtension(file) === "webp";
}

async function encodeBitmapToWebp(bitmap: ImageBitmap, quality: number): Promise<Blob> {
    if (typeof OffscreenCanvas !== "undefined") {
        const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            throw new Error("Failed to get canvas context");
        }
        ctx.drawImage(bitmap, 0, 0);
        return canvas.convertToBlob({ type: "image/webp", quality });
    }
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
        throw new Error("Failed to get canvas context");
    }
    ctx.drawImage(bitmap, 0, 0);
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => (blob ? resolve(blob) : reject(new Error("Failed to encode webp"))),
            "image/webp",
            quality,
        );
    });
}

/** 将图片转为 WebP File；已是 webp 则原样返回 */
export async function toWebpFile(file: File, quality = WEBP_QUALITY): Promise<File> {
    if (isWebpFile(file)) {
        return file;
    }
    let bitmap: ImageBitmap;
    try {
        bitmap = await createImageBitmap(file);
    } catch {
        throw new Error(`Failed to convert ${file.name} to webp`);
    }
    try {
        const blob = await encodeBitmapToWebp(bitmap, quality);
        return new File([blob], replaceFileExtension(file.name, "webp"), {
            type: "image/webp",
            lastModified: file.lastModified,
        });
    } catch {
        throw new Error(`Failed to convert ${file.name} to webp`);
    } finally {
        bitmap.close();
    }
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
