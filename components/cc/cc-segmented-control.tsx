"use client";

import * as React from "react";

import { cn } from "@/components/utils";

export type CcSegmentedOption<T extends string> = {
    value: T;
    label: string;
};

export interface CcSegmentedControlProps<T extends string> {
    options: CcSegmentedOption<T>[];
    value: T;
    onChange: (value: T) => void;
    className?: string;
}

export function CcSegmentedControl<T extends string>({
    options,
    value,
    onChange,
    className,
}: CcSegmentedControlProps<T>) {
    return (
        <div
            className={cn(
                "inline-flex rounded-full border border-[var(--cc-border-default)] bg-[var(--cc-brand-tint)] p-1",
                className,
            )}
            role="tablist"
        >
            {options.map((option) => {
                const isActive = option.value === value;
                return (
                    <button
                        key={option.value}
                        className={cn(
                            "rounded-full px-6 py-2 font-body text-sm font-bold transition-colors",
                            isActive
                                ? "bg-[var(--cc-brand-primary)] text-[var(--cc-text-on-brand)] shadow-[var(--cc-shadow-sm)]"
                                : "bg-transparent text-[var(--cc-text-secondary)] hover:text-[var(--cc-brand-primary)]",
                        )}
                        onClick={() => onChange(option.value)}
                        role="tab"
                        type="button"
                        aria-selected={isActive}
                    >
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
}
