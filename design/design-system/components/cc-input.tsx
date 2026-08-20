import * as React from "react";

import { cn } from "@/components/utils";

export interface CcInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const CcInput = React.forwardRef<HTMLInputElement, CcInputProps>(
    ({ className, type = "text", ...props }, ref) => {
        return (
            <input
                ref={ref}
                type={type}
                className={cn(
                    "flex h-11 w-full rounded-lg border border-[var(--cc-border-default)] bg-[var(--cc-surface-white)] px-3 py-1 font-body text-sm text-[var(--cc-text-primary)] shadow-[var(--cc-shadow-sm)] transition-colors placeholder:text-[var(--cc-text-muted)] focus-visible:border-[var(--cc-brand-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cc-brand-primary)]/20 disabled:cursor-not-allowed disabled:opacity-50",
                    className,
                )}
                {...props}
            />
        );
    },
);
CcInput.displayName = "CcInput";
