import * as React from "react";
import { X } from "lucide-react";

import { cn } from "@/components/utils";
import { CcButton } from "./cc-button";

export interface CcDialogProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string;
    description?: string;
    footer?: React.ReactNode;
}

/** Visual dialog preview for the design system — not a portal overlay. */
export function CcDialog({
    title,
    description,
    footer,
    className,
    children,
    ...props
}: CcDialogProps) {
    return (
        <div
            className={cn(
                "relative grid w-full max-w-lg gap-4 rounded-xl border border-[var(--cc-border-default)] bg-[var(--cc-surface-white)] p-6 shadow-[var(--cc-shadow-panel)]",
                className,
            )}
            {...props}
        >
            <div className="flex flex-col gap-1.5">
                <h3 className="font-headline text-lg font-bold text-[var(--cc-text-primary)]">
                    {title}
                </h3>
                {description && (
                    <p className="font-body text-sm text-[var(--cc-text-secondary)]">
                        {description}
                    </p>
                )}
            </div>
            {children}
            {footer ?? (
                <div className="flex justify-end gap-2">
                    <CcButton size="sm" variant="secondary">
                        取消
                    </CcButton>
                    <CcButton size="sm">确认</CcButton>
                </div>
            )}
            <button
                type="button"
                className="absolute right-4 top-4 rounded-sm text-[var(--cc-text-muted)] transition-colors hover:text-[var(--cc-brand-primary)]"
                aria-label="Close"
            >
                <X className="size-4" />
            </button>
        </div>
    );
}
