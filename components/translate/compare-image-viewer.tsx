import { CompareImagePanel } from "./compare-image-panel";

export type CompareImageViewerProps = {
    sourceLang: string;
    targetLang: string;
    originalImageUrl: string | null;
    translatedImageUrl: string | null;
    zoom: number;
};

export function CompareImageViewer({
    sourceLang,
    targetLang,
    originalImageUrl,
    translatedImageUrl,
    zoom,
}: CompareImageViewerProps) {
    return (
        <div className="flex min-h-0 flex-1 gap-2 overflow-hidden bg-[#ebeef1] px-4 py-8">
            <CompareImagePanel
                align="end"
                imageAlt="Original Comic Panel"
                imageUrl={originalImageUrl}
                label={`Original (${sourceLang})`}
                transformOrigin="right center"
                zoom={zoom}
            />
            <CompareImagePanel
                align="start"
                imageAlt="Translated Comic Panel"
                imageUrl={translatedImageUrl}
                label={`Translated (${targetLang})`}
                labelClassName="text-[#0053dd]"
                transformOrigin="left center"
                zoom={zoom}
            />
        </div>
    );
}
