import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/components/utils";

export interface CcSelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label?: string;
}

export const CcSelectTrigger = React.forwardRef<HTMLButtonElement, CcSelectTriggerProps>(
    ({ className, children, label, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "flex h-auto w-full items-center justify-between rounded-xl bg-[var(--cc-surface-muted)] px-4 py-3 font-body font-medium text-[var(--cc-text-primary)] transition-colors hover:bg-[var(--cc-surface-subtle)]",
                    className,
                )}
                type="button"
                aria-label={label}
                {...props}
            >
                <span>{children}</span>
                <ChevronDown className="size-5 text-[var(--cc-text-muted)]" />
            </button>
        );
    },
);
CcSelectTrigger.displayName = "CcSelectTrigger";
