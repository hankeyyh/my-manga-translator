"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { getUserTranslationHistory } from "@/actions/history";
import { Button } from "@/components/ui/button";
import {
    DateRangeFilter,
    type DateRangeValue,
} from "@/app/(main)/v2/home/_components/date-range-filter";
import { TranslationHistoryEmpty } from "@/app/(main)/v2/home/history/_components/translation-history-empty";
import { TranslationHistoryTaskItem } from "@/app/(main)/v2/home/history/_components/translation-history-task-item";
import type { TaskStatus } from "@/types/do/translation-task";
import { SUCCESS_CODE } from "@/types/dto/response";
import { TranslationHistoryPage, TranslationTaskDetailView } from "@/types/dto/translation-task";

const STATUS_FILTERS: Array<"全部" | TaskStatus> = [
    "全部",
    "pending",
    "processing",
    "completed",
    "failed",
    "partial",
];

type Props = {
    initialPage: TranslationHistoryPage;
};

export function TranslationHistory({ initialPage }: Props) {
    const [statusFilter, setStatusFilter] = useState<"全部" | TaskStatus>("全部");
    const [dateRange, setDateRange] = useState<DateRangeValue>("all");
    const [tasks, setTasks] = useState<TranslationTaskDetailView[]>(initialPage.tasks);
    const [nextCursor, setNextCursor] = useState<string | null>(initialPage.nextCursor);
    const [isPending, startTransition] = useTransition();
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        startTransition(async () => {
            const result = await getUserTranslationHistory({
                status: statusFilter === "全部" ? undefined : statusFilter,
                range: dateRange,
            });
            if (result.code !== SUCCESS_CODE || !result.data) {
                toast(result.message || "Unknown Error");
                setTasks([]);
                setNextCursor(null);
                return;
            }
            startTransition(() => {
                setTasks(result.data!.tasks);
                setNextCursor(result.data!.nextCursor);
            });
        });
    }, [statusFilter, dateRange]);

    function handleLoadMore() {
        if (!nextCursor || isPending) return;
        startTransition(async () => {
            const result = await getUserTranslationHistory({
                status: statusFilter === "全部" ? undefined : statusFilter,
                range: dateRange,
                cursor: nextCursor,
            });
            if (result.code !== SUCCESS_CODE || !result.data) {
                toast(result.message || "Unknown Error");
                return;
            }
            startTransition(() => {
                setTasks((prev) => [...prev, ...result.data!.tasks]);
                setNextCursor(result.data!.nextCursor);
            });
        });
    }

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

            {tasks.length === 0 ? (
                <TranslationHistoryEmpty onClearFilters={clearFilters} />
            ) : (
                <>
                    <ul className="space-y-3">
                        {tasks.map((task) => (
                            <TranslationHistoryTaskItem key={task.id} task={task} />
                        ))}
                    </ul>
                    {nextCursor && (
                        <div className="flex justify-center">
                            <Button
                                size="sm"
                                type="button"
                                variant="outline"
                                disabled={isPending}
                                onClick={handleLoadMore}
                            >
                                {isPending ? "加载中…" : "加载更多"}
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
