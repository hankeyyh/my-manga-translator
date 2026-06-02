"use client";

import { useRef } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/components/utils";

import { PageThumbnailItem } from "./page-thumbnail-item";
import type { PageThumbnail } from "./types";

export type PageThumbnailStripProps = {
    thumbnails: PageThumbnail[];
    selectedIndex: number;
    onSelectThumbnail: (index: number) => void;
    onPickFiles: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export function PageThumbnailStrip({
    thumbnails,
    selectedIndex,
    onSelectThumbnail,
    onPickFiles,
}: PageThumbnailStripProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const openFilePicker = () => fileInputRef.current?.click();

    return (
        <>
            <div
                className={cn(
                    "flex flex-1 gap-3 overflow-x-auto rounded-2xl bg-[#f1f4f7] p-2",
                    "[scrollbar-width:thin]",
                    "[&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#dee3e7]",
                )}
            >
                {thumbnails.map((thumb, index) => (
                    <PageThumbnailItem
                        key={thumb.id}
                        onSelect={() => onSelectThumbnail(index)}
                        selected={selectedIndex === index}
                        thumbnail={thumb}
                    />
                ))}

                <Button
                    className="group flex h-full w-24 shrink-0 flex-col gap-1 rounded-xl border-dashed border-[#dee3e7] bg-white shadow-none hover:border-[#0053dd] hover:bg-white"
                    onClick={openFilePicker}
                    type="button"
                    variant="outline"
                >
                    <Plus className="h-5 w-5 text-[#dee3e7] transition-colors group-hover:text-[#0053dd]" />
                    <span className="font-headline text-[9px] font-bold text-[#5a6064]">Add Page</span>
                </Button>
            </div>
            <input
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                multiple
                onChange={onPickFiles}
                type="file"
            />
        </>
    );
}
