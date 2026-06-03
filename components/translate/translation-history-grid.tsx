import Image from "next/image";

import { ApiTranslationTaskImage } from "@/types/api/translation-image";
import { cn } from "@/components/utils";

export type TranslationHistoryGridProps = {
    images: ApiTranslationTaskImage[];
    selectedImageId: string | null;
    onSelectImage: (image: ApiTranslationTaskImage) => void;
};

export function TranslationHistoryGrid({
    images,
    selectedImageId,
    onSelectImage,
}: TranslationHistoryGridProps) {
    return (
        <div
            className={cn(
                "max-h-[720px] overflow-y-auto pr-1",
                "[scrollbar-width:thin]",
                "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#c9d1d8]",
            )}
        >
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                {images.map((item) => (
                    <div
                        key={item.id}
                        className={cn(
                            "group relative aspect-[3/4] cursor-pointer overflow-hidden rounded-lg border bg-white",
                            selectedImageId === item.id
                                ? "border-2 border-[#0053dd]"
                                : "border-[#d6dce1]",
                        )}
                        onClick={() => { onSelectImage(item); }}
                    >
                        <Image
                            alt={`History Image ${item.imageIndex + 1}`}
                            className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                            fill
                            loading="eager"
                            sizes="(max-width: 1024px) 33vw, 180px"
                            src={item.resultImageUrl}
                            unoptimized
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
