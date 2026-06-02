"use client";

import { useState } from "react";

import { CompareImageViewer } from "./compare-image-viewer";
import { WorkbenchToolRail } from "./workbench-tool-rail";
import { WorkbenchZoomControls } from "./workbench-zoom-controls";
import { ApiPricingConfig } from "@/types/api/pricing-config";

export type TranslateWorkbenchProps = {
    originalImageUrl: string | null;
    translatedImageUrl: string | null;
    sourceLang: string;
    targetLang: string;
    translateModel: string;
    style: string;
    translateConfigs: ApiPricingConfig[];
    onSourceLangChange: (value: string) => void;
    onTargetLangChange: (value: string) => void;
    onTranslateModelChange: (value: string) => void;
    onStyleChange: (value: string) => void;
};

export function TranslateWorkbench({
    originalImageUrl,
    translatedImageUrl,
    sourceLang,
    targetLang,
    translateModel,
    style,
    translateConfigs,
    onSourceLangChange,
    onTargetLangChange,
    onTranslateModelChange,
    onStyleChange,
}: TranslateWorkbenchProps) {
    const [zoom, setZoom] = useState(100);
    const zoomIn = () => setZoom((z) => Math.min(z + 25, 200));
    const zoomOut = () => setZoom((z) => Math.max(z - 25, 50));

    return (
        <div className="relative flex h-[75vh] min-h-[420px] shrink-0 flex-col overflow-hidden rounded-3xl border border-white/40 bg-[#f1f4f7] shadow-sm">
            <WorkbenchToolRail
                translateModel={translateModel}
                sourceLang={sourceLang}
                style={style}
                targetLang={targetLang}
                translateConfigs={translateConfigs}
                onTranslateModelChange={onTranslateModelChange}
                onSourceLangChange={onSourceLangChange}
                onStyleChange={onStyleChange}
                onTargetLangChange={onTargetLangChange}
            />
            <WorkbenchZoomControls onZoomIn={zoomIn} onZoomOut={zoomOut} zoom={zoom} />
            <CompareImageViewer
                originalImageUrl={originalImageUrl}
                sourceLang={sourceLang}
                targetLang={targetLang}
                translatedImageUrl={translatedImageUrl}
                zoom={zoom}
            />
        </div>
    );
}
