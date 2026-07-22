import * as React from "react";

import { cn } from "@/components/utils";

export interface CcSectionHeadingProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string;
    description?: string;
    align?: "left" | "center";
}

export function CcSectionHeading({
    title,
    description,
    align = "center",
    className,
    children,
    ...props
}: CcSectionHeadingProps) {
    return (
        <div
            className={cn(
                align === "center" && "text-center",
                className,
            )}
            {...props}
        >
            <h2 className="mb-4 font-headline text-4xl font-bold text-[var(--cc-text-primary)] md:text-5xl">
                {title}
            </h2>
            {description && (
                <p className="mx-auto max-w-2xl text-lg text-[var(--cc-text-secondary)]">
                    {description}
                </p>
            )}
            {children}
        </div>
    );
}
