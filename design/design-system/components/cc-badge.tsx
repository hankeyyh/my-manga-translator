import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/components/utils";

const ccBadgeVariants = cva(
    "inline-flex items-center font-body font-semibold transition-colors",
    {
        variants: {
            variant: {
                brand:
                    "rounded-md border-transparent bg-[var(--cc-brand-primary)] px-2.5 py-0.5 text-xs text-[var(--cc-text-on-brand)]",
                accent:
                    "rounded-md border-transparent bg-[var(--cc-brand-tint)] px-2.5 py-0.5 text-xs text-[var(--cc-brand-primary)]",
                neutral:
                    "rounded-full border border-[var(--cc-border-default)] bg-[var(--cc-surface-white)] px-4 py-1 text-xs text-[var(--cc-text-secondary)]",
                outline:
                    "rounded-md border border-[var(--cc-border-default)] bg-[var(--cc-surface-white)] px-2.5 py-0.5 text-xs text-[var(--cc-text-secondary)]",
                success:
                    "rounded-md border-transparent bg-[var(--cc-status-success-bg)] px-2.5 py-0.5 text-xs text-[var(--cc-status-success)]",
                error:
                    "rounded-md border-transparent bg-[var(--cc-status-error-bg)] px-2.5 py-0.5 text-xs text-[var(--cc-status-error)]",
                warning:
                    "rounded-md border-transparent bg-[var(--cc-status-warning-bg)] px-2.5 py-0.5 text-xs text-[var(--cc-status-warning)]",
            },
        },
        defaultVariants: {
            variant: "brand",
        },
    },
);

export interface CcBadgeProps
    extends React.HTMLAttributes<HTMLSpanElement>,
        VariantProps<typeof ccBadgeVariants> {}

export function CcBadge({ className, variant, ...props }: CcBadgeProps) {
    return <span className={cn(ccBadgeVariants({ variant }), className)} {...props} />;
}

export { ccBadgeVariants };
