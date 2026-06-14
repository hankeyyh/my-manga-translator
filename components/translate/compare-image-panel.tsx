import Image from "next/image";

import { cn } from "@/components/utils";

export type CompareImagePanelProps = {
    label: string;
    imageUrl: string | null;
    imageAlt: string;
    zoom: number;
    transformOrigin: "left center" | "right center";
    labelClassName?: string;
    align: "start" | "end";
};

export function CompareImagePanel({
    label,
    imageUrl,
    imageAlt,
    zoom,
    transformOrigin,
    labelClassName = "text-[#5a6064]",
    align,
}: CompareImagePanelProps) {
    const justify = align === "end" ? "justify-end" : "justify-start";
    const items = align === "end" ? "items-end" : "items-start";

    return (
        <div className={cn("flex min-h-0 min-w-0 flex-1", justify)}>
            <div
                className={cn(
                    "flex h-full min-h-0 w-full max-w-full flex-col gap-2",
                    items,
                    align === "end" ? "justify-end" : "justify-start",
                )}
            >
                <span
                    className={cn(
                        "shrink-0 font-headline text-[10px] font-bold uppercase tracking-widest",
                        labelClassName,
                    )}
                >
                    {label}
                </span>
                <div
                    className="relative flex min-h-0 w-full min-w-0 flex-1 items-center justify-center overflow-hidden rounded-lg bg-[#ebeef1]"
                    style={{
                        transform: `scale(${zoom / 100})`,
                        transformOrigin,
                    }}
                >
                    {imageUrl ? (
                        <Image
                            alt={imageAlt}
                            className="object-contain"
                            fetchPriority="high"
                            fill
                            priority
                            sizes="50vw"
                            src={imageUrl}
                            unoptimized
                        />
                    ) : null}
                </div>
            </div>
        </div>
    );
}
