"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { getUserTranslationHistory } from "@/actions/get-user-translation-history";
import { CcButton } from "@/design/design-system/components";
import {
    DateRangeFilter,
    type DateRangeValue,
} from "@/app/[locale]/home/_components/date-range-filter";
import { TranslationHistoryEmpty } from "@/app/[locale]/home/history/_components/translation-history-empty";
import { TranslationHistoryTaskItem } from "@/app/[locale]/home/history/_components/translation-history-task-item";
import type { TaskStatus } from "@/types/do/translation-task";
import { SUCCESS_CODE } from "@/types/dto/response";
import { TranslationHistoryPage, TranslationTaskDetailView } from "@/types/dto/translation-task";
import { useTranslations } from "next-intl";

const STATUS_FILTERS = ["all", "pending", "processing", "completed", "failed", "partial"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

type Props = {
    initialPage: TranslationHistoryPage;
};

export function TranslationHistory({ initialPage }: Props) {
    const t = useTranslations("history");
    const tStatus = useTranslations("status");
    const tCommon = useTranslations("common");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
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
                status: statusFilter === "all" ? undefined : statusFilter,
                range: dateRange,
            });
            if (result.code !== SUCCESS_CODE || !result.data) {
                toast(result.message || tCommon("unknownError"));
                setTasks([]);
                setNextCursor(null);
                return;
            }
            startTransition(() => {
                setTasks(result.data!.tasks);
                setNextCursor(result.data!.nextCursor);
            });
        });
    }, [statusFilter, dateRange, tCommon]);

    function handleLoadMore() {
        if (!nextCursor || isPending) return;
        startTransition(async () => {
            const result = await getUserTranslationHistory({
                status: statusFilter === "all" ? undefined : statusFilter,
                range: dateRange,
                cursor: nextCursor,
            });
            if (result.code !== SUCCESS_CODE || !result.data) {
                toast(result.message || tCommon("unknownError"));
                return;
            }
            startTransition(() => {
                setTasks((prev) => [...prev, ...result.data!.tasks]);
                setNextCursor(result.data!.nextCursor);
            });
        });
    }

    function clearFilters() {
        setStatusFilter("all");
        setDateRange("all");
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="min-w-[200px] flex-1">
                    <div className="flex flex-wrap gap-1.5">
                        {STATUS_FILTERS.map((status) => (
                            <CcButton
                                key={status}
                                size="sm"
                                type="button"
                                variant={
                                    status === statusFilter ? "primary" : "secondary"
                                }
                                className="h-7 px-2.5 text-xs"
                                onClick={() => setStatusFilter(status)}
                            >
                                {tStatus(status)}
                            </CcButton>
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
                            <CcButton
                                size="sm"
                                type="button"
                                variant="outline"
                                disabled={isPending}
                                onClick={handleLoadMore}
                            >
                                {isPending ? t("loading") : t("loadMore")}
                            </CcButton>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
