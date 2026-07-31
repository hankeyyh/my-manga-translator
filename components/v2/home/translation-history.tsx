"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    DateRangeFilter,
    type DateRangeValue,
} from "@/components/v2/home/date-range-filter";
import { TranslationHistoryEmpty } from "@/components/v2/home/translation-history-empty";
import { TranslationHistoryLoading } from "@/components/v2/home/translation-history-loading";
import { TranslationHistoryTaskItem } from "@/components/v2/home/translation-history-task-item";
import type { ApiGetTranslationTaskResponse } from "@/types/api/translation-task";
import type { TaskStatus } from "@/types/do/translation-task";

const STATUS_FILTERS: Array<"全部" | TaskStatus> = [
    "全部",
    "pending",
    "processing",
    "completed",
    "failed",
    "partial",
];

export function TranslationHistory() {
    const [statusFilter, setStatusFilter] = useState<"全部" | TaskStatus>("全部");
    const [dateRange, setDateRange] = useState<DateRangeValue>("all");
    const [tasks, setTasks] = useState<ApiGetTranslationTaskResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const abortController = new AbortController();

        async function fetchHistory() {
            setLoading(true);

            try {
                const params = new URLSearchParams();
                if (statusFilter !== "全部") {
                    params.set("status", statusFilter);
                }
                params.set("range", dateRange);

                const response = await fetch(`/api/translate/history2?${params}`, {
                    signal: abortController.signal,
                });
                const { error, data } = (await response.json()) as {
                    error: string | null;
                    data: ApiGetTranslationTaskResponse[] | null;
                };
                if (!response.ok) {
                    throw new Error(error ?? "Unknown Error");
                }
                setTasks(data!);
            } catch (err) {
                if (err instanceof DOMException && err.name === "AbortError") {
                    return;
                }
                const errMsg = err instanceof Error ? err.message : "Unknown Error";
                setTasks([]);
                toast(errMsg);
            } finally {
                if (!abortController.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        void fetchHistory();
        return () => abortController.abort();
    }, [statusFilter, dateRange]);

    function clearFilters() {
        setStatusFilter("全部");
        setDateRange("all");
    }

    let content;
    if (loading) {
        content = <TranslationHistoryLoading />;
    } else if (tasks.length === 0) {
        content = <TranslationHistoryEmpty onClearFilters={clearFilters} />;
    } else {
        content = (
            <ul className="space-y-3">
                {tasks.map((task) => (
                    <TranslationHistoryTaskItem key={task.id} task={task} />
                ))}
            </ul>
        );
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

            {content}
        </div>
    );
}
