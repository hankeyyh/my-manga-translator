"use client";

import { ChevronDown, ChevronUp, Clock, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ImagePreview } from "@/components/v2/image-preview";
import { ThumbNail } from "@/components/v2/thumbnail";
import type { ApiGetTranslationTaskResponse } from "@/types/api/translation-task";
import type { ApiTranslationTaskImage } from "@/types/api/translation-image";
import type { TaskStatus } from "@/types/do/translation-task";
import type { MangaPage } from "@/types/web/manga-page";
import { useState } from "react";

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

function statusBadgeClassName(status: TaskStatus) {
    switch (status) {
        case "completed":
            return "border-transparent bg-green-100 text-green-700 hover:bg-green-100";
        case "failed":
            return "border-transparent bg-red-100 text-red-700 hover:bg-red-100";
        case "pending":
            return "border-transparent bg-yellow-100 text-yellow-700 hover:bg-yellow-100";
        case "processing":
            return "border-transparent bg-blue-100 text-blue-700 hover:bg-blue-100";
        case "partial":
            return "border-transparent bg-orange-100 text-orange-700 hover:bg-orange-100";
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
    task: ApiGetTranslationTaskResponse;
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
            <Card className="gap-0 py-4 shadow-none">
                <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 px-4 py-0">
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <CardTitle className="text-sm">
                                {SOURCE_LANG} → {targetCode}
                            </CardTitle>
                            <Badge
                                variant="outline"
                                className={statusBadgeClassName(task.status)}
                            >
                                {task.status}
                            </Badge>
                        </div>
                        <CardDescription className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                            <span className="inline-flex items-center gap-1">
                                <Clock className="size-3 text-muted-foreground" />
                                {formatDate(task.created_at)}
                            </span>
                            <span>{task.total_images} 页</span>
                        </CardDescription>
                    </div>
                    <div className="flex shrink-0 gap-2">
                        <Button
                            size="sm"
                            type="button"
                            variant="ghost"
                            disabled={!downloadable}
                            onClick={() => onDownloadTask(task.id)}
                        >
                            <Download className="size-3.5" />
                        </Button>
                        <Button
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
                        </Button>
                    </div>
                </CardHeader>

                {isShowDetail && pages.length > 0 && (
                    <CardContent className="px-4 pt-4 pb-0">
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                            {pages.map((page, index) => (
                                <ThumbNail
                                    key={page.imageId ?? page.name}
                                    {...page}
                                    onPreview={() => setPreviewIndex(index)}
                                    onDownload={page.imageId ? () => onDownloadImage(page.imageId!) : undefined}
                                />
                            ))}
                        </div>
                    </CardContent>
                )}
            </Card>

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
