"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MangaPage } from "@/types/web/manga-page";

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
    const imageUrl = showTranslated && page?.status === "completed" && page.resultUrl ? page.resultUrl : page?.originalUrl;
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

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
                aria-label="关闭预览"
                className="absolute top-4 right-4 z-10 size-9 rounded-full text-white hover:bg-white/10 hover:text-white"
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
                        aria-label="上一张，或按左方向键"
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
                        aria-label="下一张，或按右方向键"
                        disabled={index >= pages.length - 1}
                        className="h-24 w-24 rounded-full text-white hover:bg-white/10 hover:text-white disabled:pointer-events-auto disabled:text-white/30 [&_svg]:size-16"
                        onClick={() => index < pages.length - 1 && onIndexChange(index + 1)}
                    >
                        <ChevronRight strokeWidth={1} />
                    </Button>
                </div>
            )}
            <div className="flex min-h-0 flex-1 items-center justify-center px-32 py-4">
                <img
                    src={imageUrl}
                    alt={page.name}
                    className="max-h-full max-w-full object-contain"
                    onClick={(e) => e.stopPropagation()}
                />
            </div>
            <p className="shrink-0 pb-6 text-center text-sm text-white">
                {index + 1} / {pages.length}
            </p>
        </div>,
        document.body,
    );
}
