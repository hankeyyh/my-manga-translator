"use client";

import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";

import { CcButton } from "@/design/design-system/components";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DATE_OPTIONS = ["1d", "7d", "1m", "all"] as const;

export type DateRangeValue = (typeof DATE_OPTIONS)[number];

export function DateRangeFilter({
    value,
    onValueChange,
}: {
    value: DateRangeValue;
    onValueChange: (value: DateRangeValue) => void;
}) {
    const t = useTranslations("history.dateRange");
    const selected = DATE_OPTIONS.includes(value) ? value : "all";

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <CcButton variant="secondary" className="justify-between gap-2">
                    {t(selected)}
                    <ChevronDown className="size-4" />
                </CcButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
                {DATE_OPTIONS.map((opt) => (
                    <DropdownMenuItem
                        key={opt}
                        onSelect={() => onValueChange(opt)}
                    >
                        {t(opt)}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
