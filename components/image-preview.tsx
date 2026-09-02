"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Minus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MangaPage } from "@/types/web/manga-page";
import { useTranslations } from "next-intl";

const MIN_ZOOM = 50;
const MAX_ZOOM = 400;
const ZOOM_STEP = 25;

export type ImagePreviewProps = {
    pages: MangaPage[];
    index: number;
    showTranslated?: boolean;
    onClose: () => void;
    onIndexChange: (index: number) => void;
};

export function ImagePreview({
    pages,
    index,
    showTranslated = true,
    onClose,
    onIndexChange,
}: ImagePreviewProps) {
    const page = pages[index];
    const t = useTranslations("imagePreview");
    const imageUrl = showTranslated && page?.status === "completed" && page.resultUrl ? page.resultUrl : page?.originalUrl;
    const [mounted, setMounted] = useState(false);
    const [zoom, setZoom] = useState(100);

    const zoomIn = () => setZoom((value) => Math.min(MAX_ZOOM, value + ZOOM_STEP));
    const zoomOut = () => setZoom((value) => Math.max(MIN_ZOOM, value - ZOOM_STEP));

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        setZoom(100);
    }, [index, imageUrl]);

    useEffect(() => {
        if (!page || pages.length === 0) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
                return;
            }
            if (e.key === "ArrowLeft") {
                e.preventDefault();
                if (index > 0) onIndexChange(index - 1);
                return;
            }
            if (e.key === "ArrowRight") {
                e.preventDefault();
                if (index < pages.length - 1) onIndexChange(index + 1);
                return;
            }
            if (e.key === "+" || e.key === "=") {
                e.preventDefault();
                setZoom((value) => Math.min(MAX_ZOOM, value + ZOOM_STEP));
                return;
            }
            if (e.key === "-" || e.key === "_") {
                e.preventDefault();
                setZoom((value) => Math.max(MIN_ZOOM, value - ZOOM_STEP));
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [index, onClose, onIndexChange, page, pages.length]);

    if (!mounted || !page) return null;

    return createPortal(
        <div
            role="dialog"
            aria-modal="true"
            aria-label={page.name}
            className="fixed inset-0 z-[100] flex flex-col bg-black/80"
            onClick={onClose}
        >
            <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label={t("close")}
                className="absolute end-4 top-4 z-10 size-9 rounded-full text-white hover:bg-white/10 hover:text-white"
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
            >
                <X className="size-5" />
            </Button>
            {pages.length > 1 && (
                <div
                    className="absolute top-1/2 left-2 z-10 -translate-y-1/2"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label={t("prev")}
                        disabled={index === 0}
                        className="h-24 w-24 rounded-full text-white hover:bg-white/10 hover:text-white disabled:pointer-events-auto disabled:text-white/30 [&_svg]:size-16"
                        onClick={() => index > 0 && onIndexChange(index - 1)}
                    >
                        <ChevronLeft strokeWidth={1} />
                    </Button>
                </div>
            )}
            {pages.length > 1 && (
                <div
                    className="absolute top-1/2 right-2 z-10 -translate-y-1/2"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label={t("next")}
                        disabled={index >= pages.length - 1}
                        className="h-24 w-24 rounded-full text-white hover:bg-white/10 hover:text-white disabled:pointer-events-auto disabled:text-white/30 [&_svg]:size-16"
                        onClick={() => index < pages.length - 1 && onIndexChange(index + 1)}
                    >
                        <ChevronRight strokeWidth={1} />
                    </Button>
                </div>
            )}
            <div className="relative min-h-0 flex-1">
                <div className="absolute inset-0 overflow-auto px-32 py-4">
                    <div
                        className="flex items-center justify-center"
                        style={{
                            width: `${Math.max(100, zoom)}%`,
                            height: `${Math.max(100, zoom)}%`,
                        }}
                    >
                        <img
                            src={imageUrl}
                            alt={page.name}
                            className="object-contain"
                            style={{
                                maxWidth: zoom < 100 ? `${zoom}%` : "100%",
                                maxHeight: zoom < 100 ? `${zoom}%` : "100%",
                            }}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
                <div
                    className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="flex select-none items-center gap-4 rounded-full bg-black/60 px-4 py-1.5 text-white opacity-50 shadow-lg backdrop-blur-sm transition-opacity duration-200 hover:opacity-100">
                        <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            aria-label={t("zoomOut")}
                            disabled={zoom <= MIN_ZOOM}
                            className="size-7 rounded-full text-white hover:bg-white/10 hover:text-white disabled:pointer-events-auto disabled:text-white/30"
                            onClick={zoomOut}
                        >
                            <Minus className="size-4" />
                        </Button>
                        <span className="min-w-12 text-center text-sm font-medium tabular-nums">
                            {zoom}%
                        </span>
                        <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            aria-label={t("zoomIn")}
                            disabled={zoom >= MAX_ZOOM}
                            className="size-7 rounded-full text-white hover:bg-white/10 hover:text-white disabled:pointer-events-auto disabled:text-white/30"
                            onClick={zoomIn}
                        >
                            <Plus className="size-4" />
                        </Button>
                    </div>
                </div>
            </div>
            <p className="shrink-0 pb-6 text-center text-sm text-white">
                {index + 1} / {pages.length}
            </p>
        </div>,
        document.body,
    );
}
