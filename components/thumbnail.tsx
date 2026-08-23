"use client";

import { Clock, Download, Eye, Loader2, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/components/utils";
import { MangaPage } from "@/types/web/manga-page";
import { useTranslations } from "next-intl";

export type ThumbNailProps = MangaPage & {
    showTranslated?: boolean;
    onRemove?: () => void;
    onPreview?: () => void;
    onRetry?: () => void;
    onContinueWait?: () => void;
    onDownload?: () => void;
};

const statusFrameClass: Partial<Record<NonNullable<MangaPage["status"]>, string>> = {
    completed: "border-[3px] border-lime-500 p-0.5",
    failed: "border-[3px] border-red-500 p-0.5",
    stalled: "border-[3px] border-orange-400 p-0.5",
};

export function ThumbNail({ showTranslated = true, onRemove, onPreview, onRetry, onContinueWait, onDownload, ...props }: ThumbNailProps) {
    const t = useTranslations("thumbnail");
    const isPending = props.status === "pending";
    const isProcessing = props.status === "processing";
    const showStatusOverlay = isPending || isProcessing;
    const imageUrl = showTranslated && props.status === "completed" && props.resultUrl ? props.resultUrl : props.originalUrl;
    const frameClass = props.status ? statusFrameClass[props.status] : undefined;

    return (
        <Card className="group relative w-full gap-0 py-0">
            <div className={cn("rounded-lg", frameClass)}>
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
                                aria-label={isPending ? t("waiting") : t("processing")}
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
                                        aria-label={t("preview", { name: props.name })}
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
                                        aria-label={t("remove", { name: props.name })}
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
                                {t("waiting")}
                            </span>
                        )}
                        {isProcessing && (
                            <span className="shrink-0 text-xs text-muted-foreground">
                                {t("processing")}
                            </span>
                        )}
                        {props.status === "stalled" && onContinueWait && (
                            <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                aria-label={t("continueWait")}
                                className="size-7"
                                onClick={onContinueWait}
                            >
                                <Clock className="size-3.5" />
                            </Button>
                        )}
                        {props.status === "failed" && onRetry && (
                            <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                aria-label={t("retry")}
                                className="size-7"
                                onClick={onRetry}
                            >
                                <RotateCcw className="size-3.5" />
                            </Button>
                        )}
                        {props.status === "completed" && onDownload && (
                            <Button
                                type="button"
                                size="icon"
                                variant="outline"
                                aria-label={t("download")}
                                className="size-7"
                                onClick={onDownload}
                            >
                                <Download className="size-3.5" />
                            </Button>
                        )}
                    </div>
                </CardContent>
            </div>
        </Card>
    );
}
