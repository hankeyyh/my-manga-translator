"use client";

import { ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DATE_OPTIONS = [
    { value: "1d", label: "最近1天" },
    { value: "7d", label: "最近7天" },
    { value: "1m", label: "最近1月" },
    { value: "all", label: "全部" },
] as const;

export type DateRangeValue = (typeof DATE_OPTIONS)[number]["value"];

export function DateRangeFilter({
    value,
    onValueChange,
}: {
    value: DateRangeValue;
    onValueChange: (value: DateRangeValue) => void;
}) {
    const selected =
        DATE_OPTIONS.find((opt) => opt.value === value) ?? DATE_OPTIONS[3];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="justify-between gap-2">
                    {selected.label}
                    <ChevronDown className="size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
                {DATE_OPTIONS.map((opt) => (
                    <DropdownMenuItem
                        key={opt.value}
                        onSelect={() => onValueChange(opt.value)}
                    >
                        {opt.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
