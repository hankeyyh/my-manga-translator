"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { cn } from "@/components/utils";

export interface CcAccordionItemProps {
    question: string;
    answer: string;
    open?: boolean;
    onToggle?: () => void;
    className?: string;
}

export function CcAccordionItem({
    question,
    answer,
    open = false,
    onToggle,
    className,
}: CcAccordionItemProps) {
    return (
        <div className={cn("border-b border-[var(--cc-border-light)]", className)}>
            <button
                type="button"
                className="flex h-auto w-full items-center justify-between gap-4 px-4 py-4 text-start font-body text-sm font-medium text-[var(--cc-text-primary)] transition-colors hover:bg-[var(--cc-brand-tint)]"
                onClick={onToggle}
                aria-expanded={open}
            >
                <span>{question}</span>
                <Plus
                    className={cn(
                        "size-4 shrink-0 text-[var(--cc-brand-primary)] transition-transform",
                        open && "rotate-45",
                    )}
                />
            </button>
            {open && (
                <p className="px-4 pb-4 font-body text-sm text-[var(--cc-text-secondary)]">
                    {answer}
                </p>
            )}
        </div>
    );
}

export interface CcAccordionProps {
    items: { question: string; answer: string }[];
    className?: string;
}

export function CcAccordion({ items, className }: CcAccordionProps) {
    const [openIndex, setOpenIndex] = React.useState<number | null>(0);

    return (
        <div
            className={cn(
                "overflow-hidden rounded-xl border border-[var(--cc-border-default)] bg-[var(--cc-surface-white)]",
                className,
            )}
        >
            {items.map((item, index) => (
                <CcAccordionItem
                    key={item.question}
                    question={item.question}
                    answer={item.answer}
                    open={openIndex === index}
                    onToggle={() => setOpenIndex(openIndex === index ? null : index)}
                />
            ))}
        </div>
    );
}
