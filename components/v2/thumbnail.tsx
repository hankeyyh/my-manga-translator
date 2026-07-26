"use client";

import { Clock, Download, Eye, Loader2, X } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { ImageStatus } from "@/types/do/translation-image";

export interface MangaPage {
    name: string,
    originalFile: File,
    originalUrl: string,
    originalSize: string,
    status?: ImageStatus,
    resultUrl?: string,
    imageId?: string,
}

export type ThumbNailProps = MangaPage & {
    showTranslated?: boolean;
    onRemove?: () => void;
    onPreview?: () => void;
    onRetry?: () => void;
};

function onDownload(page: MangaPage) {
    if (!page.imageId || page.status !== "completed") {
        return;
    }
    window.location.href = `${window.origin}/api/download?imageIds=${page.imageId}`;
}

export function ThumbNail({ showTranslated = true, onRemove, onPreview, onRetry, ...props }: ThumbNailProps) {
    const isPending = props.status === "pending";
    const isProcessing = props.status === "processing";
    const showStatusOverlay = isPending || isProcessing;
    const imageUrl = showTranslated && props.status === "completed" && props.resultUrl ? props.resultUrl : props.originalUrl;

    return (
        <Card className="group relative w-full gap-0 py-0">
            <CardContent className="p-2">
                <div className="relative overflow-hidden rounded-md">
                    <img
                        src={imageUrl}
                        alt={props.name}
                        className="aspect-[3/4] w-full object-cover"
                    />
                    {showStatusOverlay && (
                        <div
                            className="absolute inset-0 flex items-center justify-center bg-black/50"
                            aria-label={isPending ? "等待中" : "处理中"}
                        >
                            {isPending && (
                                <Clock className="size-8 text-white" strokeWidth={1.75} />
                            )}
                            {isProcessing && (
                                <Loader2 className="size-8 animate-spin text-white" strokeWidth={1.75} />
                            )}
                        </div>
                    )}
                    {!showStatusOverlay && (
                        <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/45 opacity-0 transition-opacity group-hover:opacity-100">
                            {onPreview && (
                                <Button
                                    type="button"
                                    size="icon"
                                    aria-label={`预览 ${props.name}`}
                                    className="size-10 rounded-full bg-white text-foreground shadow-sm hover:bg-white/90"
                                    onClick={onPreview}
                                >
                                    <Eye className="size-5" />
                                </Button>
                            )}
                            {onRemove && (
                                <Button
                                    type="button"
                                    size="icon"
                                    aria-label={`移除 ${props.name}`}
                                    className="size-10 rounded-full bg-red-500 text-white shadow-sm hover:bg-red-600"
                                    onClick={onRemove}
                                >
                                    <X className="size-5" />
                                </Button>
                            )}
                        </div>
                    )}
                </div>
                <div className="mt-2 flex items-start justify-between gap-1">
                    <div className="min-w-0">
                        <p className="truncate text-xs font-medium">
                            {props.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {props.originalSize}
                        </p>
                    </div>
                    {isPending && (
                        <span className="shrink-0 text-xs text-muted-foreground">
                            pending
                        </span>
                    )}
                    {isProcessing && (
                        <span className="shrink-0 text-xs text-muted-foreground">
                            processing
                        </span>
                    )}
                    {props.status === "failed" && (
                        <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={onRetry}>
                            重试
                        </Button>
                    )}
                    {props.status === "completed" && (
                        <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => onDownload(props)}>
                            下载
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
