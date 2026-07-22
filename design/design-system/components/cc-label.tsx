import * as React from "react";

import { cn } from "@/components/utils";

export interface CcLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    uppercase?: boolean;
}

export function CcLabel({ className, uppercase = true, ...props }: CcLabelProps) {
    return (
        <label
            className={cn(
                "font-body text-xs font-bold text-[var(--cc-text-secondary)]",
                uppercase && "ml-2 uppercase tracking-widest",
                className,
            )}
            {...props}
        />
    );
}
