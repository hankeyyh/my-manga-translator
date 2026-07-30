"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Download } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    DateRangeFilter,
    type DateRangeValue,
} from "@/components/v2/home/date-range-filter";
import type { TaskStatus } from "@/types/do/translation-task";

const STATUS_FILTERS: Array<"全部" | TaskStatus> = [
    "全部",
    "pending",
    "processing",
    "completed",
    "failed",
    "partial",
];

const DATE_RANGE_DAYS: Record<Exclude<DateRangeValue, "all">, number> = {
    "1d": 1,
    "7d": 7,
    "1m": 30,
};

/**
 * TODO web需要自定义一套task类型，包含cache+返回的图片
 */
export type HistoryTask = {
    id: string;
    sourceLang: string;
    sourceCode: string;
    targetLang: string;
    targetCode: string;
    totalImages: number;
    startedAt: string;
    status: TaskStatus;
};

function canDownload(status: TaskStatus) {
    return status === "completed" || status === "partial";
}

function statusBadgeVariant(
    status: TaskStatus,
): "default" | "secondary" | "destructive" | "outline" {
    switch (status) {
        case "completed":
            return "default";
        case "failed":
            return "destructive";
        case "processing":
            return "secondary";
        default:
            return "outline";
    }
}

function startOfDay(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isWithinDateRange(startedAt: string, range: DateRangeValue) {
    if (range === "all") return true;

    const taskDate = startOfDay(new Date(`${startedAt}T00:00:00`));
    const cutoff = startOfDay(new Date());
    cutoff.setDate(cutoff.getDate() - (DATE_RANGE_DAYS[range] - 1));
    return taskDate >= cutoff;
}

export function TranslationHistory({ tasks }: { tasks: HistoryTask[] }) {
    const [statusFilter, setStatusFilter] = useState<"全部" | TaskStatus>("全部");
    const [dateRange, setDateRange] = useState<DateRangeValue>("all");

    const filteredTasks = tasks.filter((task) => {
        const matchStatus = statusFilter === "全部" || task.status === statusFilter;
        const matchDate = isWithinDateRange(task.startedAt, dateRange);
        return matchStatus && matchDate;
    });

    function clearFilters() {
        setStatusFilter("全部");
        setDateRange("all");
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="min-w-[200px] flex-1">
                    <div className="flex flex-wrap gap-1.5">
                        {STATUS_FILTERS.map((status) => (
                            <Button
                                key={status}
                                size="sm"
                                type="button"
                                variant={
                                    status === statusFilter ? "default" : "outline"
                                }
                                className="h-7 px-2.5 text-xs"
                                onClick={() => setStatusFilter(status)}
                            >
                                {status}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="shrink-0 text-right">
                    <DateRangeFilter value={dateRange} onValueChange={setDateRange} />
                </div>
            </div>

            {filteredTasks.length > 0 ? (
                <ul className="space-y-3">
                    {filteredTasks.map((task) => {
                        const downloadable = canDownload(task.status);
                        return (
                            <li key={task.id}>
                                <Card className="gap-0 py-4 shadow-none">
                                    <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 px-4 py-0">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <CardTitle className="text-sm">
                                                    {task.sourceCode} → {task.targetCode}
                                                </CardTitle>
                                                <Badge
                                                    variant={statusBadgeVariant(task.status)}
                                                >
                                                    {task.status}
                                                </Badge>
                                            </div>
                                            <CardDescription className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                                                <span>
                                                    <span className="text-muted-foreground">
                                                        源语言{" "}
                                                    </span>
                                                    {task.sourceLang} {task.sourceCode}
                                                </span>
                                                <span>
                                                    <span className="text-muted-foreground">
                                                        目标语言{" "}
                                                    </span>
                                                    {task.targetLang} {task.targetCode}
                                                </span>
                                                <span>
                                                    <span className="text-muted-foreground">
                                                        翻译页数{" "}
                                                    </span>
                                                    {task.totalImages} 页
                                                </span>
                                                <span>
                                                    <span className="text-muted-foreground">
                                                        开始日期{" "}
                                                    </span>
                                                    {task.startedAt}
                                                </span>
                                            </CardDescription>
                                        </div>
                                        <div className="flex shrink-0 gap-2">
                                            <Button
                                                size="sm"
                                                type="button"
                                                variant="ghost"
                                                disabled={!downloadable}
                                            >
                                                <Download className="size-3.5" />
                                            </Button>
                                            <Button size="sm" type="button" variant="ghost">
                                                <ChevronDown className="size-3.5" />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                </Card>
                            </li>
                        );
                    })}
                </ul>
            ) : (
                <Card className="gap-0 py-10 shadow-none">
                    <CardContent className="flex flex-col items-center gap-3 px-4 text-center">
                        <p className="text-sm text-muted-foreground">
                            暂无翻译历史 / 无匹配结果
                        </p>
                        <div className="flex gap-2">
                            <Button asChild size="sm">
                                <Link href="/v2">去翻译</Link>
                            </Button>
                            <Button
                                size="sm"
                                type="button"
                                variant="outline"
                                onClick={clearFilters}
                            >
                                清除筛选
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
