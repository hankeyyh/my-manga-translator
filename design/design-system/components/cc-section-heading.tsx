import * as React from "react";

import { cn } from "@/components/utils";

export interface CcSectionHeadingProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string;
    description?: string;
    align?: "left" | "center";
    size?: "md" | "lg";
}

export function CcSectionHeading({
    title,
    description,
    align = "center",
    size = "lg",
    className,
    children,
    ...props
}: CcSectionHeadingProps) {
    return (
        <div
            className={cn(
                align === "center" && "text-center",
                align === "left" && "text-start",
                className,
            )}
            {...props}
        >
            <h2
                className={cn(
                    "mb-4 font-headline font-bold text-[var(--cc-text-primary)]",
                    size === "lg" ? "text-4xl md:text-5xl" : "text-2xl md:text-3xl",
                )}
            >
                {title}
            </h2>
            {description && (
                <p
                    className={cn(
                        "mx-auto max-w-2xl text-[var(--cc-text-secondary)]",
                        size === "lg" ? "text-lg" : "text-sm",
                    )}
                >
                    {description}
                </p>
            )}
            {children}
        </div>
    );
}
