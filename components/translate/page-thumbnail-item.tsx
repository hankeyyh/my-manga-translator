import Image from "next/image";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/components/utils";

import type { PageThumbnail } from "./types";

export type PageThumbnailItemProps = {
    thumbnail: PageThumbnail;
    selected: boolean;
    onSelect: () => void;
};

export function PageThumbnailItem({ thumbnail, selected, onSelect }: PageThumbnailItemProps) {
    return (
        <Button
            className={cn(
                "group relative flex h-full w-24 shrink-0 flex-col items-stretch justify-start gap-0 rounded-xl p-1.5 font-normal text-left shadow-none transition-all hover:bg-white hover:text-inherit focus-visible:ring-offset-0",
                selected
                    ? "border-2 border-[#0053dd] bg-white"
                    : "border border-transparent bg-white hover:border-[#dee3e7]",
            )}
            onClick={onSelect}
            type="button"
            variant="ghost"
        >
            <div
                className={cn(
                    "relative mb-1 flex-1 overflow-hidden rounded-lg",
                    thumbnail.status === "completed" && "grayscale group-hover:grayscale-0",
                )}
            >
                {thumbnail.status === "processing" && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40">
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                    </div>
                )}
                <Image
                    alt=""
                    className="h-full w-full object-cover"
                    fetchPriority="low"
                    height={96}
                    sizes="96px"
                    src={thumbnail.image}
                    unoptimized
                    width={96}
                />
            </div>
            {thumbnail.status !== "active" && (
                <div className="pointer-events-none absolute inset-0 rounded-xl bg-[#0053dd]/5 opacity-0 transition-opacity group-hover:opacity-100" />
            )}
        </Button>
    );
}
