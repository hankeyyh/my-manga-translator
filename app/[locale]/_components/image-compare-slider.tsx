"use client";

import { useCallback, useRef, useState } from "react";
import { ChevronsLeftRight } from "lucide-react";

import { cn } from "@/components/utils";

type ImageCompareSliderProps = {
    beforeSrc: string;
    afterSrc: string;
    beforeAlt?: string;
    afterAlt?: string;
    initialPosition?: number;
    className?: string;
};

export function ImageCompareSlider({
    beforeSrc,
    afterSrc,
    beforeAlt = "原图",
    afterAlt = "翻译后",
    initialPosition = 50,
    className,
}: ImageCompareSliderProps) {
    const [position, setPosition] = useState(initialPosition);
    const containerRef = useRef<HTMLDivElement>(null);

    const updateFromClientX = useCallback((clientX: number) => {
        const el = containerRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        if (rect.width <= 0) return;
        const next = ((clientX - rect.left) / rect.width) * 100;
        setPosition(Math.min(100, Math.max(0, next)));
    }, []);

    return (
        <div
            ref={containerRef}
            className={cn(
                "relative max-w-full cursor-col-resize touch-none select-none overflow-hidden",
                className,
            )}
            onPointerMove={(event) => updateFromClientX(event.clientX)}
            onPointerDown={(event) => {
                // 触控：按下后继续跟踪手指
                event.currentTarget.setPointerCapture(event.pointerId);
                updateFromClientX(event.clientX);
            }}
            role="slider"
            aria-label="翻译前后对比"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(position)}
            tabIndex={0}
            onKeyDown={(event) => {
                if (event.key === "ArrowLeft") {
                    event.preventDefault();
                    setPosition((p) => Math.max(0, p - 2));
                } else if (event.key === "ArrowRight") {
                    event.preventDefault();
                    setPosition((p) => Math.min(100, p + 2));
                }
            }}
        >
            <img
                src={beforeSrc}
                alt={beforeAlt}
                className="block h-auto max-w-full"
                draggable={false}
            />
            <div
                className="absolute inset-0 overflow-hidden"
                style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
            >
                <img
                    src={afterSrc}
                    alt={afterAlt}
                    className="absolute left-0 top-0 h-full w-full object-cover object-left-top"
                    draggable={false}
                />
            </div>
            <div
                aria-hidden
                className="pointer-events-none absolute inset-y-0 z-10"
                style={{ left: `${position}%` }}
            >
                <div className="absolute inset-y-0 left-0 w-px -translate-x-1/2 bg-cc-brand-primary" />
                <div className="absolute top-1/2 left-0 flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-cc-border bg-cc-surface-white shadow-[var(--cc-shadow-card)]">
                    <ChevronsLeftRight className="size-4 text-cc-brand-primary" />
                </div>
            </div>
        </div>
    );
}
