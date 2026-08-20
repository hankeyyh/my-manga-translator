"use client";

import * as React from "react";
import { Check } from "lucide-react";

import { cn } from "@/components/utils";

export interface CcCheckboxProps {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
    className?: string;
    "aria-label"?: string;
}

export function CcCheckbox({
    checked = false,
    onCheckedChange,
    disabled,
    className,
    ...props
}: CcCheckboxProps) {
    return (
        <button
            type="button"
            role="checkbox"
            aria-checked={checked}
            disabled={disabled}
            className={cn(
                "flex size-4 shrink-0 items-center justify-center rounded-sm border shadow-[var(--cc-shadow-sm)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cc-brand-primary)] disabled:cursor-not-allowed disabled:opacity-50",
                checked
                    ? "border-[var(--cc-brand-primary)] bg-[var(--cc-brand-primary)] text-[var(--cc-text-on-brand)]"
                    : "border-[var(--cc-brand-primary)] bg-[var(--cc-surface-white)]",
                className,
            )}
            onClick={() => onCheckedChange?.(!checked)}
            {...props}
        >
            {checked && <Check className="size-3" strokeWidth={3} />}
        </button>
    );
}
