import { TaskBarActions } from "./task-bar-actions";
import { PageThumbnailStrip } from "./page-thumbnail-strip";
import type { PageThumbnail } from "./types";
import type { TaskBarActionsProps } from "./task-bar-actions";

export type TranslateTaskBarProps = Pick<
    TaskBarActionsProps,
    | "pageCount"
    | "submitLoading"
    | "polling"
    | "submitError"
    | "resultError"
    | "taskStatus"
    | "onSubmit"
    | "onNewTask"
> & {
    thumbnails: PageThumbnail[];
    selectedIndex: number;
    onSelectThumbnail: (index: number) => void;
    onPickFiles: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export function TranslateTaskBar({
    thumbnails,
    selectedIndex,
    onSelectThumbnail,
    onPickFiles,
    pageCount,
    submitLoading,
    polling,
    submitError,
    resultError,
    taskStatus,
    onSubmit,
    onNewTask,
}: TranslateTaskBarProps) {
    return (
        <div className="flex h-40 gap-4">
            <TaskBarActions
                onNewTask={onNewTask}
                onSubmit={onSubmit}
                pageCount={pageCount}
                polling={polling}
                resultError={resultError}
                submitError={submitError}
                submitLoading={submitLoading}
                taskStatus={taskStatus}
            />
            <PageThumbnailStrip
                onPickFiles={onPickFiles}
                onSelectThumbnail={onSelectThumbnail}
                selectedIndex={selectedIndex}
                thumbnails={thumbnails}
            />
        </div>
    );
}
