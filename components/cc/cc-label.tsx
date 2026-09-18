import * as React from "react";

import { cn } from "@/components/utils";

export interface CcLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    uppercase?: boolean;
}

export function CcLabel({ className, uppercase = false, ...props }: CcLabelProps) {
    return (
        <label
            className={cn(
                "font-body text-sm font-medium text-[var(--cc-text-primary)]",
                uppercase && "text-xs font-bold uppercase tracking-widest text-[var(--cc-text-secondary)]",
                className,
            )}
            {...props}
        />
    );
}
