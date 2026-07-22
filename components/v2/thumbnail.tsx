"use client";

import { Eye, X } from "lucide-react";
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
}

export type ThumbNailProps = MangaPage & {
    onRemove?: () => void;
    onPreview?: () => void;
};

export function ThumbNail({ onRemove, onPreview, ...props }: ThumbNailProps) {
    return (
        <Card className="group relative w-full gap-0 py-0">
            <CardContent className="p-2">
                <div className="relative overflow-hidden rounded-md">
                    <img
                        src={props.status === "completed" ? props.resultUrl : props.originalUrl}
                        alt={props.name}
                        className="aspect-[3/4] w-full object-cover"
                    />
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
                    {props.status === "pending" && (
                        <span className="shrink-0 text-xs text-muted-foreground">
                            pending
                        </span>
                    )}
                    {props.status === "processing" && (
                        <span className="shrink-0 text-xs text-muted-foreground">
                            processing
                        </span>
                    )}
                    {props.status === "failed" && (
                        <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                            重试
                        </Button>
                    )}
                    {props.status === "completed" && (
                        <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                            下载
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
