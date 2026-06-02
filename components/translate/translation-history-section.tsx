import { Loader2 } from "lucide-react";
import { ApiTranslationTaskImage } from "@/types/api/translation-image";
import { TranslationHistoryGrid } from "./translation-history-grid";
import { TranslationHistoryHeader } from "./translation-history-header";

export type TranslationHistorySectionProps = {
    images: ApiTranslationTaskImage[];
    loading: boolean;
    error: string | null;
};

export function TranslationHistorySection({images, loading, error }: TranslationHistorySectionProps) {
    return (
        <div className="shrink-0 rounded-2xl bg-[#e8edf0] p-5">
            <TranslationHistoryHeader />

            {loading ? (
                <div className="flex h-40 items-center justify-center rounded-xl bg-[#dfe5ea]">
                    <Loader2 className="h-5 w-5 animate-spin text-[#5a6064]" />
                </div>
            ) : error ? (
                <p className="rounded-xl bg-[#dfe5ea] p-4 text-sm text-red-500">{error}</p>
            ) : images.length === 0 ? (
                <p className="rounded-xl bg-[#dfe5ea] p-4 text-sm text-[#5a6064]">
                    暂无翻译历史
                </p>
            ) : (
                <TranslationHistoryGrid images={images} />
            )}
        </div>
    );
}
