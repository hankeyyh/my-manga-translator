"use client";

import { ChevronDown, ChevronUp, Clock, Download } from "lucide-react";
import {
    CcBadge,
    CcButton,
    CcCard,
    CcCardDescription,
    CcCardTitle,
} from "@/design/design-system/components";
import { ImagePreview } from "@/components/image-preview";
import { ThumbNail } from "@/components/thumbnail";
import type { ApiTranslationTaskImage } from "@/types/api/translation-image";
import type { TaskStatus } from "@/types/do/translation-task";
import type { MangaPage } from "@/types/web/manga-page";
import { useState } from "react";
import { TranslationTaskDetailView } from "@/types/dto/translation-task";

const SOURCE_LANG = "Auto";

function canDownload(status: TaskStatus) {
    return status === "completed" || status === "partial";
}

function onDownloadTask(taskId: string) {
    window.location.href = `${window.origin}/api/download?taskId=${taskId}`;
}

function onDownloadImage(imageId: string) {
    window.location.href = `${window.origin}/api/download?imageIds=${imageId}`;
}

function statusBadgeVariant(status: TaskStatus) {
    switch (status) {
        case "completed":
            return "success" as const;
        case "failed":
            return "error" as const;
        case "pending":
            return "warning" as const;
        case "processing":
            return "accent" as const;
        case "partial":
            return "warning" as const;
    }
}

function formatDate(iso: string) {
    return iso.slice(0, 10);
}

function toMangaPage(img: ApiTranslationTaskImage): MangaPage {
    return {
        name: img.filename,
        originalUrl: img.originalImageUrl,
        originalSize: "",
        status: img.status,
        resultUrl: img.resultImageUrl || undefined,
        imageId: img.id,
    };
}

type Props = {
    task: TranslationTaskDetailView;
};

export function TranslationHistoryTaskItem({ task }: Props) {
    const downloadable = canDownload(task.status);
    const targetCode = task.config.translator?.target_lang ?? "—";
    const [isShowDetail, setIsShowDetail] = useState(false);
    const [previewIndex, setPreviewIndex] = useState<number | null>(null);

    const pages = [...task.images]
        .sort((a, b) => a.imageIndex - b.imageIndex)
        .map(toMangaPage);

    return (
        <li>
            <CcCard className="rounded-[var(--cc-radius-lg)] p-4 lg:p-4" variant="outlined">
                <div className="flex flex-row items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <CcCardTitle className="text-sm">
                                {SOURCE_LANG} → {targetCode}
                            </CcCardTitle>
                            <CcBadge variant={statusBadgeVariant(task.status)}>
                                {task.status}
                            </CcBadge>
                        </div>
                        <CcCardDescription className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                            <span className="inline-flex items-center gap-1">
                                <Clock className="size-3 text-cc-text-muted" />
                                {formatDate(task.createdAt)}
                            </span>
                            <span>{task.totalImages} 页</span>
                        </CcCardDescription>
                    </div>
                    <div className="flex shrink-0 gap-2">
                        <CcButton
                            size="sm"
                            type="button"
                            variant="ghost"
                            disabled={!downloadable}
                            onClick={() => onDownloadTask(task.id)}
                        >
                            <Download className="size-3.5" />
                        </CcButton>
                        <CcButton
                            size="sm"
                            type="button"
                            variant="ghost"
                            onClick={() => setIsShowDetail((v) => !v)}
                        >
                            {isShowDetail ? (
                                <ChevronUp className="size-3.5" />
                            ) : (
                                <ChevronDown className="size-3.5" />
                            )}
                        </CcButton>
                    </div>
                </div>

                {isShowDetail && pages.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                        {pages.map((page, index) => (
                            <ThumbNail
                                key={page.imageId ?? page.name}
                                {...page}
                                onPreview={() => setPreviewIndex(index)}
                                onDownload={page.imageId ? () => onDownloadImage(page.imageId!) : undefined}
                            />
                        ))}
                    </div>
                )}
            </CcCard>

            {previewIndex !== null && (
                <ImagePreview
                    pages={pages}
                    index={previewIndex}
                    onClose={() => setPreviewIndex(null)}
                    onIndexChange={setPreviewIndex}
                />
            )}
        </li>
    );
}
