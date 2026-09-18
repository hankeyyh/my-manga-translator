import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { CircleAlert, Info, CheckCircle2 } from "lucide-react";

import { cn } from "@/components/utils";

const ccAlertVariants = cva(
    "flex items-start gap-3 rounded-xl border px-4 py-3 font-body text-sm",
    {
        variants: {
            variant: {
                info: "border-[var(--cc-brand-primary)]/20 bg-[var(--cc-status-info-bg)] text-[var(--cc-brand-primary)]",
                error: "border-[var(--cc-status-error)]/20 bg-[var(--cc-status-error-bg)] text-[var(--cc-status-error)]",
                success:
                    "border-[var(--cc-status-success)]/20 bg-[var(--cc-status-success-bg)] text-[var(--cc-status-success)]",
                warning:
                    "border-[var(--cc-status-warning)]/20 bg-[var(--cc-status-warning-bg)] text-[var(--cc-status-warning)]",
            },
        },
        defaultVariants: {
            variant: "info",
        },
    },
);

const ICONS = {
    info: Info,
    error: CircleAlert,
    success: CheckCircle2,
    warning: CircleAlert,
} as const;

export interface CcAlertProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof ccAlertVariants> {}

export function CcAlert({ className, variant = "info", children, ...props }: CcAlertProps) {
    const Icon = ICONS[variant ?? "info"];
    return (
        <div className={cn(ccAlertVariants({ variant }), className)} role="alert" {...props}>
            <Icon className="mt-0.5 size-4 shrink-0" />
            <div className="min-w-0">{children}</div>
        </div>
    );
}

export { ccAlertVariants };
