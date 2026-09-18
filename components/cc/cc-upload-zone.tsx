import * as React from "react";
import { UploadCloud } from "lucide-react";

import { cn } from "@/components/utils";

export interface CcUploadZoneProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    title?: string;
    description?: string;
}

export function CcUploadZone({
    title = "Drop comic panels here",
    description = "Support for JPG, PNG, and WebP. Max 20MB per file.",
    className,
    ...props
}: CcUploadZoneProps) {
    return (
        <button
            className={cn(
                "group flex min-h-[300px] w-full cursor-pointer flex-col items-center justify-center rounded-[var(--cc-radius-2xl)] border-2 border-dashed border-[var(--cc-brand-primary)]/30 bg-[var(--cc-surface-muted)] p-8 transition-all hover:border-[var(--cc-brand-primary)] hover:bg-[var(--cc-surface-white)]",
                className,
            )}
            type="button"
            {...props}
        >
            <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-[var(--cc-brand-tint)] transition-transform group-hover:scale-110">
                <UploadCloud className="size-10 text-[var(--cc-brand-primary)]" />
            </div>
            <p className="mb-2 font-headline text-xl font-bold text-[var(--cc-text-primary)]">
                {title}
            </p>
            <p className="max-w-[240px] text-center font-body text-[var(--cc-text-secondary)]">
                {description}
            </p>
        </button>
    );
}
