"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MangaPage } from "@/types/web/manga-page";
import { useTranslations } from "next-intl";

const MIN_ZOOM = 50;
const MAX_ZOOM = 400;
const ZOOM_STEP = 25;
const overlayBtnClass =
    "size-10 rounded-full border border-white/15 bg-black/50 text-white shadow-none hover:bg-black/70 hover:text-white disabled:pointer-events-auto disabled:bg-black/30 disabled:text-white/40 disabled:opacity-100 [&_svg]:size-5";

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
    const imageKey = `${index}:${imageUrl}`;
    const [mounted, setMounted] = useState(false);
    const [zoom, setZoom] = useState(100);
    const [fitSize, setFitSize] = useState({ width: 0, height: 0 });
    const [zoomReady, setZoomReady] = useState(false);
    const [loadedKey, setLoadedKey] = useState(imageKey);

    if (loadedKey !== imageKey) {
        setLoadedKey(imageKey);
        setZoom(100);
        setFitSize({ width: 0, height: 0 });
        setZoomReady(false);
    }
    const viewportRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const zoomOriginRef = useRef<{ x: number; y: number } | null>(null);

    const updateFitSize = useCallback(() => {
        const viewport = viewportRef.current;
        const scroller = scrollRef.current;
        const image = imageRef.current;
        if (!viewport || !scroller || !image?.naturalWidth) return;

        const padding = getComputedStyle(scroller);
        const availW =
            viewport.clientWidth - parseFloat(padding.paddingLeft) - parseFloat(padding.paddingRight);
        const availH =
            viewport.clientHeight - parseFloat(padding.paddingTop) - parseFloat(padding.paddingBottom);
        if (availW <= 0 || availH <= 0) return;

        const fit = Math.min(availW / image.naturalWidth, availH / image.naturalHeight);
        setFitSize({
            width: image.naturalWidth * fit,
            height: image.naturalHeight * fit,
        });
    }, []);

    const captureZoomOrigin = useCallback(() => {
        const image = imageRef.current;
        if (!image) return;
        const rect = image.getBoundingClientRect();
        zoomOriginRef.current = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
        };
    }, []);

    const zoomIn = useCallback(() => {
        captureZoomOrigin();
        setZoom((value) => Math.min(MAX_ZOOM, value + ZOOM_STEP));
    }, [captureZoomOrigin]);

    const zoomOut = useCallback(() => {
        captureZoomOrigin();
        setZoom((value) => Math.max(MIN_ZOOM, value - ZOOM_STEP));
    }, [captureZoomOrigin]);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        zoomOriginRef.current = null;
        const scroller = scrollRef.current;
        if (scroller) {
            scroller.scrollLeft = 0;
            scroller.scrollTop = 0;
        }
        const image = imageRef.current;
        if (image?.complete && image.naturalWidth) {
            updateFitSize();
        }
    }, [imageKey, updateFitSize]);

    useEffect(() => {
        if (!fitSize.width) {
            setZoomReady(false);
            return;
        }
        const id = requestAnimationFrame(() => setZoomReady(true));
        return () => cancelAnimationFrame(id);
    }, [fitSize.width, imageKey]);

    useEffect(() => {
        const viewport = viewportRef.current;
        if (!viewport) return;
        const observer = new ResizeObserver(() => updateFitSize());
        observer.observe(viewport);
        return () => observer.disconnect();
    }, [mounted, updateFitSize]);

    const scale = zoom / 100;
    const displayWidth = fitSize.width * scale;
    const displayHeight = fitSize.height * scale;

    useLayoutEffect(() => {
        const origin = zoomOriginRef.current;
        const scroller = scrollRef.current;
        const image = imageRef.current;
        zoomOriginRef.current = null;
        if (!origin || !scroller || !image || displayWidth <= 0) return;

        const rect = image.getBoundingClientRect();
        scroller.scrollLeft += rect.left + rect.width / 2 - origin.x;
        scroller.scrollTop += rect.top + rect.height / 2 - origin.y;
    }, [zoom, displayWidth, displayHeight]);

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
                zoomIn();
                return;
            }
            if (e.key === "-" || e.key === "_") {
                e.preventDefault();
                zoomOut();
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [index, onClose, onIndexChange, page, pages.length, zoomIn, zoomOut]);

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
                className={`absolute end-5 top-5 z-10 ${overlayBtnClass}`}
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
            >
                <X strokeWidth={1.75} />
            </Button>
            {pages.length > 1 && (
                <div
                    className="absolute top-1/2 left-3 z-10 -translate-y-1/2"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label={t("prev")}
                        disabled={index === 0}
                        className={overlayBtnClass}
                        onClick={() => index > 0 && onIndexChange(index - 1)}
                    >
                        <ChevronLeft strokeWidth={1.75} />
                    </Button>
                </div>
            )}
            {pages.length > 1 && (
                <div
                    className="absolute top-1/2 right-3 z-10 -translate-y-1/2"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label={t("next")}
                        disabled={index >= pages.length - 1}
                        className={overlayBtnClass}
                        onClick={() => index < pages.length - 1 && onIndexChange(index + 1)}
                    >
                        <ChevronRight strokeWidth={1.75} />
                    </Button>
                </div>
            )}
            <div ref={viewportRef} className="relative min-h-0 flex-1">
                <div ref={scrollRef} className="absolute inset-0 overflow-auto px-16 py-4">
                    <div
                        className="flex items-center justify-center"
                        style={{
                            minWidth: "100%",
                            minHeight: "100%",
                            width: displayWidth || "100%",
                            height: displayHeight || "100%",
                        }}
                    >
                        <img
                            key={imageKey}
                            ref={imageRef}
                            src={imageUrl}
                            alt={page.name}
                            className={
                                fitSize.width
                                    ? `max-w-none origin-center ${zoomReady ? "transition-transform duration-200 ease-out motion-reduce:transition-none" : ""}`
                                    : "max-h-full max-w-full object-contain"
                            }
                            style={{
                                width: fitSize.width || undefined,
                                height: fitSize.height || undefined,
                                transform: fitSize.width ? `scale(${scale})` : undefined,
                            }}
                            onLoad={updateFitSize}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            </div>
            <div
                className="flex shrink-0 justify-center pb-6 pt-2"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex select-none items-center gap-3 rounded-full bg-black/60 px-4 py-1.5 text-white shadow-lg backdrop-blur-sm">
                    <span className="text-sm font-medium tabular-nums">
                        {index + 1} / {pages.length}
                    </span>
                    <span className="h-4 w-px bg-white/40" aria-hidden />
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label={t("zoomOut")}
                        disabled={zoom <= MIN_ZOOM}
                        className="size-7 rounded-full text-white hover:bg-white/10 hover:text-white disabled:pointer-events-auto disabled:text-white/30"
                        onClick={zoomOut}
                    >
                        <ZoomOut className="size-4" />
                    </Button>
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label={t("zoomIn")}
                        disabled={zoom >= MAX_ZOOM}
                        className="size-7 rounded-full text-white hover:bg-white/10 hover:text-white disabled:pointer-events-auto disabled:text-white/30"
                        onClick={zoomIn}
                    >
                        <ZoomIn className="size-4" />
                    </Button>
                </div>
            </div>
        </div>,
        document.body,
    );
}
