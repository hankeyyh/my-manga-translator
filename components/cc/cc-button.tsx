import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/components/utils";

const ccButtonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-body transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cc-brand-primary)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
    {
        variants: {
            variant: {
                primary:
                    "bg-[var(--cc-brand-primary)] text-[var(--cc-text-on-brand)] hover:bg-[var(--cc-brand-primary-hover)]",
                accent:
                    "bg-gradient-to-br from-[var(--cc-brand-accent)] to-[var(--cc-brand-accent-secondary)] text-[var(--cc-text-on-brand)] shadow-[var(--cc-shadow-accent)] hover:opacity-90",
                outline:
                    "border border-[var(--cc-brand-primary)] bg-[var(--cc-surface-white)] font-semibold text-[var(--cc-brand-primary)] hover:bg-[var(--cc-brand-tint)]",
                secondary:
                    "border border-[var(--cc-border-default)] bg-[var(--cc-surface-white)] font-semibold text-[var(--cc-text-secondary)] hover:border-[var(--cc-brand-primary)] hover:bg-[var(--cc-brand-tint)] hover:text-[var(--cc-brand-primary)]",
                ghost:
                    "bg-transparent font-medium text-[var(--cc-text-primary)] hover:bg-[var(--cc-brand-tint)] hover:text-[var(--cc-brand-primary)]",
                link:
                    "font-semibold text-[var(--cc-brand-primary)] underline-offset-4 hover:underline",
                pill:
                    "rounded-full bg-[var(--cc-brand-primary)] font-bold text-[var(--cc-text-on-brand)] hover:bg-[var(--cc-brand-primary-hover)]",
                destructive:
                    "bg-[var(--cc-status-error)] text-[var(--cc-text-on-brand)] hover:bg-[#b91c1c]",
                soft:
                    "bg-[var(--cc-brand-tint)] font-semibold text-[var(--cc-brand-primary)] hover:bg-[var(--cc-brand-tint-strong)]",
            },
            size: {
                sm: "h-8 rounded-md px-3 text-xs [&_svg]:size-3.5",
                md: "h-9 rounded-lg px-4 text-sm [&_svg]:size-4",
                lg: "h-auto rounded-xl px-6 py-3 text-base [&_svg]:size-5",
                xl: "h-auto rounded-xl px-8 py-4 font-headline text-lg font-bold [&_svg]:size-6",
                icon: "size-10 rounded-full [&_svg]:size-5",
            },
        },
        defaultVariants: {
            variant: "primary",
            size: "md",
        },
    },
);

export interface CcButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof ccButtonVariants> {
    asChild?: boolean;
}

export const CcButton = React.forwardRef<HTMLButtonElement, CcButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button";
        return (
            <Comp
                className={cn(ccButtonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        );
    },
);
CcButton.displayName = "CcButton";

export { ccButtonVariants };
