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
const TARGET_MAX_BYTES = 500 * 1024;
const MIN_QUALITY = 0.5;
/** 与算法 detection_size 对齐；更大的边对检测没有收益，只会撑大上传体积 */
const MAX_LONG_EDGE = 2048;
const MIN_LONG_EDGE = 1024;

function bitmapLongEdge(bitmap: ImageBitmap): number {
    return Math.max(bitmap.width, bitmap.height);
}

// 按长边等比缩小。已不超过目标长边时返回同一个 source（调用方需用引用相等判断是否新建了 bitmap）。
async function downscaleToLongEdge(source: ImageBitmap, targetLongEdge: number): Promise<ImageBitmap> {
    const current = bitmapLongEdge(source);
    if (current <= targetLongEdge) {
        return source;
    }
    const scale = targetLongEdge / current;
    return createImageBitmap(source, {
        resizeWidth: Math.max(1, Math.round(source.width * scale)),
        resizeHeight: Math.max(1, Math.round(source.height * scale)),
        resizeQuality: "high",
    });
}

/**
 * 把当前分辨率的 bitmap 编成 WebP。
 * Worker / 现代浏览器走 OffscreenCanvas；否则退回页面里的 HTMLCanvas（toBlob 是回调式 API）。
 */
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

/** 将图片转为 WebP；原文件已小于 500KB 则跳过，否则把输出压到 500KB 以下 */
export async function toWebpFile(file: File, quality = WEBP_QUALITY): Promise<File> {
    if (file.size < TARGET_MAX_BYTES) {
        return file;
    }
    const bitmaps: ImageBitmap[] = [];
    try {
        let bitmap = await createImageBitmap(file);
        bitmaps.push(bitmap);

        const capped = await downscaleToLongEdge(bitmap, MAX_LONG_EDGE);
        if (capped !== bitmap) {
            bitmaps.push(capped);
            bitmap = capped;
        }

        let q = quality;
        let blob = await encodeBitmapToWebp(bitmap, q);
        // 先降质量、不改分辨率：漫画检测对清晰度更敏感，quality 降到 MIN_QUALITY 通常已能进 500KB
        while (blob.size >= TARGET_MAX_BYTES && q > MIN_QUALITY) {
            q = Math.max(MIN_QUALITY, Math.round((q - 0.1) * 10) / 10);
            blob = await encodeBitmapToWebp(bitmap, q);
        }

        // 质量已到底仍超限，才缩小长边（不低于 MIN_LONG_EDGE），避免为体积牺牲过多文字细节
        while (blob.size >= TARGET_MAX_BYTES && bitmapLongEdge(bitmap) > MIN_LONG_EDGE) {
            const nextLong = Math.max(MIN_LONG_EDGE, Math.round(bitmapLongEdge(bitmap) * 0.85));
            const next = await downscaleToLongEdge(bitmap, nextLong);
            // 已达到最小尺寸，退出
            if (next === bitmap) {
                break;
            }
            bitmaps.push(next);
            bitmap = next;
            blob = await encodeBitmapToWebp(bitmap, MIN_QUALITY);
        }

        return new File([blob], replaceFileExtension(file.name, "webp"), {
            type: "image/webp",
            lastModified: file.lastModified,
        });
    } catch {
        throw new Error(`Failed to convert ${file.name} to webp`);
    } finally {
        for (const bitmap of bitmaps) {
            bitmap.close();
        }
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
