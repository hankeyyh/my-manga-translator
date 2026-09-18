import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/components/utils";

const ccCardVariants = cva("flex flex-col font-body text-[var(--cc-text-primary)]", {
    variants: {
        variant: {
            elevated:
                "rounded-[var(--cc-radius-2xl)] border border-[var(--cc-border-light)] bg-[var(--cc-surface-white)] p-8 shadow-[var(--cc-shadow-card)] lg:p-12",
            outlined:
                "rounded-[var(--cc-radius-2xl)] border border-[var(--cc-border-default)] bg-[var(--cc-surface-white)] p-10 shadow-[var(--cc-shadow-sm)] transition-shadow hover:shadow-[var(--cc-shadow-card)]",
            featured:
                "rounded-[var(--cc-radius-2xl)] border-2 border-[var(--cc-brand-primary)] bg-[var(--cc-surface-white)] p-10 shadow-[var(--cc-shadow-accent)]",
            panel:
                "rounded-[var(--cc-radius-2xl)] bg-[var(--cc-surface-muted)] p-5",
            workbench:
                "overflow-hidden rounded-[var(--cc-radius-2xl)] border border-[var(--cc-border-light)] bg-[var(--cc-surface-white)] shadow-[var(--cc-shadow-sm)]",
        },
    },
    defaultVariants: {
        variant: "elevated",
    },
});

export interface CcCardProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof ccCardVariants> {}

export function CcCard({ className, variant, ...props }: CcCardProps) {
    return <div className={cn(ccCardVariants({ variant }), className)} {...props} />;
}

export function CcCardTitle({
    className,
    ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h3
            className={cn(
                "font-headline text-xl font-bold text-[var(--cc-text-primary)]",
                className,
            )}
            {...props}
        />
    );
}

export function CcCardDescription({
    className,
    ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
    return (
        <p
            className={cn(
                "font-body text-sm font-medium text-[var(--cc-text-secondary)]",
                className,
            )}
            {...props}
        />
    );
}

export { ccCardVariants };
