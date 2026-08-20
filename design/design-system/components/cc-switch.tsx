"use client";

import * as React from "react";

import { cn } from "@/components/utils";

export interface CcSwitchProps {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
    className?: string;
    "aria-label"?: string;
}

export function CcSwitch({
    checked = false,
    onCheckedChange,
    disabled,
    className,
    ...props
}: CcSwitchProps) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            className={cn(
                "inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cc-brand-primary)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                checked
                    ? "bg-[var(--cc-brand-primary)]"
                    : "bg-[var(--cc-border-subtle)]",
                className,
            )}
            onClick={() => onCheckedChange?.(!checked)}
            {...props}
        >
            <span
                className={cn(
                    "pointer-events-none block size-4 rounded-full bg-[var(--cc-surface-white)] shadow-[var(--cc-shadow-sm)] transition-transform",
                    checked ? "translate-x-4" : "translate-x-0",
                )}
            />
        </button>
    );
}
