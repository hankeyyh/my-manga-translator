"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "../ui/button";
import { MangaPage } from "./thumbnail";

export type ImagePreviewProps = {
    pages: MangaPage[];
    index: number;
    onClose: () => void;
    onIndexChange: (index: number) => void;
};

export function ImagePreview({ pages, index, onClose, onIndexChange }: ImagePreviewProps) {
    const page = pages[index];

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

    if (!page) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label={page.name}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={onClose}
        >
            <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label="关闭预览"
                className="absolute top-4 right-4 size-9 rounded-full text-white hover:bg-white/10 hover:text-white"
                onClick={onClose}
            >
                <X className="size-5" />
            </Button>
            <img
                src={page.status === "completed" ? page.resultUrl : page.originalUrl}
                alt={page.name}
                className="max-h-full max-w-full object-contain"
                onClick={(e) => e.stopPropagation()} />
        </div>
    );
}
