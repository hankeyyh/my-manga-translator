import { Download, Loader2, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ApiGetTranslationTaskResponse } from "@/types/api/translation-task";

export type TaskBarActionsProps = {
    pageCount: number;
    submitLoading: boolean;
    polling: boolean;
    submitError: string | null;
    resultError: string | null;
    taskStatus: ApiGetTranslationTaskResponse | null;
    onSubmit: () => void;
    onNewTask: () => void;
};

export function TaskBarActions({
    pageCount,
    submitLoading,
    polling,
    submitError,
    resultError,
    taskStatus,
    onSubmit,
    onNewTask,
}: TaskBarActionsProps) {
    const isBusy = submitLoading || polling;

    return (
        <div className="flex w-48 flex-col gap-2">
            <Button
                className="flex-1 justify-start gap-3 rounded-xl bg-[#0053dd] text-xs font-bold text-white hover:bg-[#0053dd]/90"
                disabled={pageCount === 0 || isBusy}
                onClick={onSubmit}
            >
                {isBusy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Phone className="h-4 w-4" />
                )}
                Start All
            </Button>
            <Button
                className="flex-1 justify-start gap-3 rounded-xl border-[#dee3e7] text-xs font-bold text-[#5a6064] hover:border-[#0053dd] hover:text-[#0053dd]"
                variant="outline"
            >
                <Download className="h-4 w-4" />
                Download All
            </Button>
            <Button
                className="flex-1 justify-start gap-3 rounded-xl border-[#dee3e7] text-xs font-bold text-[#5a6064] hover:border-[#0053dd] hover:text-[#0053dd]"
                onClick={onNewTask}
                variant="outline"
            >
                New Task
            </Button>
            {(submitError || resultError) && (
                <p className="line-clamp-2 text-[10px] text-red-500">
                    {submitError ?? resultError}
                </p>
            )}
            {taskStatus && (
                <p className="line-clamp-2 text-[10px] text-[#5a6064]">
                    {taskStatus.completed_images}/{taskStatus.total_images} • {taskStatus.progress}%
                </p>
            )}
        </div>
    );
}
