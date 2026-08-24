"use client";

import type { ReactNode } from "react";
import { CcBadge } from "@/design/design-system/components";
import { cn } from "@/components/utils";

export type BillingCycle = "monthly" | "yearly";

type Props = {
    value: BillingCycle;
    onChange: (value: BillingCycle) => void;
    monthlyLabel: string;
    yearlyLabel: string;
    saveLabel?: string | null;
    availableCycles: BillingCycle[];
};

export function BillingCycleTabs({
    value,
    onChange,
    monthlyLabel,
    yearlyLabel,
    saveLabel,
    availableCycles,
}: Props) {
    const showMonthly = availableCycles.includes("monthly");
    const showYearly = availableCycles.includes("yearly");
    if (!showMonthly && !showYearly) return null;

    return (
        <div className="relative inline-flex" role="tablist">
            <div className="absolute inset-x-0 bottom-0 h-px bg-[var(--cc-border-default)]" />
            {showMonthly ? (
                <CycleTab
                    active={value === "monthly"}
                    onClick={() => onChange("monthly")}
                >
                    {monthlyLabel}
                </CycleTab>
            ) : null}
            {showYearly ? (
                <CycleTab
                    active={value === "yearly"}
                    onClick={() => onChange("yearly")}
                >
                    {yearlyLabel}
                    {saveLabel ? (
                        <CcBadge
                            className="rounded-full px-1.5 py-0 text-[9px] font-bold tracking-wide"
                            variant="error"
                        >
                            {saveLabel}
                        </CcBadge>
                    ) : null}
                </CycleTab>
            ) : null}
        </div>
    );
}

function CycleTab({
    active,
    onClick,
    children,
}: {
    active: boolean;
    onClick: () => void;
    children: ReactNode;
}) {
    return (
        <button
            className={cn(
                "relative flex items-center gap-1.5 px-3.5 pb-2 pt-0.5 font-body text-sm transition-colors",
                active
                    ? "font-bold text-[var(--cc-text-primary)]"
                    : "font-medium text-[var(--cc-text-muted)] hover:text-[var(--cc-text-primary)]",
            )}
            onClick={onClick}
            role="tab"
            type="button"
            aria-selected={active}
        >
            {children}
            {active ? (
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[var(--cc-brand-primary)]" />
            ) : null}
        </button>
    );
}
