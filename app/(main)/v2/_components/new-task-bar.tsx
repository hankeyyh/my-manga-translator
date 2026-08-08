"use client";

import { useRef } from "react";
import Link from "next/link";
import {
    ChevronsRight,
    Clock,
    Image as ImageIcon,
    Languages,
    Loader2,
    Plus,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/components/utils";
import { TaskStatus } from "@/types/do/translation-task";
import { SessionTask } from "@/types/web/session-task";

const ACCEPT =
    ".jpg,.jpeg,.png,.webp,.gif,.avif,.heic,.pdf,.epub,.cbz,.zip,image/*,application/pdf,application/epub+zip,application/zip";

/** 槽位状态底色（终态） */
function statusBgClass(status: TaskStatus): string | undefined {
    switch (status) {
        case "completed":
            return "bg-lime-100 text-lime-700 border-lime-500";
        case "failed":
            return "bg-red-100 text-red-700 border-red-500";
        case "partial":
            return "bg-orange-100 text-orange-700 border-orange-500";
        default:
            return undefined;
    }
}

function slotTitle(task: SessionTask): string {
    const pageCount = task.pages.length;
    if (task.status === null) return `草稿 · ${pageCount} 页`;
    return `${task.taskId ?? task.localId.slice(0, 8)} · ${pageCount} 页 · ${task.status}`;
}

function TaskSlotIcon({ status, active }: { status: TaskStatus | null; active: boolean }) {
    const statusClass = status ? statusBgClass(status) : undefined;
    const iconClass = "size-3.5";

    let icon = <ImageIcon className={iconClass} strokeWidth={1.75} aria-hidden />;
    if (status === "pending") {
        icon = <Clock className={iconClass} strokeWidth={1.75} aria-hidden />;
    } else if (status === "processing") {
        icon = <Loader2 className={cn(iconClass, "animate-spin")} strokeWidth={1.75} aria-hidden />;
    }

    return (
        <span
            className={cn(
                "flex size-7 items-center justify-center overflow-hidden rounded-md border transition-all",
                "text-muted-foreground",
                statusClass,
                active && "scale-110 "
            )}
        >
            {icon}
        </span>
    );
}

export function NewTaskBar(props: {
    tasks: SessionTask[];
    activeLocalId: string | null;
    /** 最新任务已提交后才可开启新任务 */
    canCreateNewTask: boolean;
    showTranslated: boolean;
    onShowTranslatedChange: (value: boolean) => void;
    /** 当前选中 task 有完成译图时展示语言开关 */
    showLanguageSwitch: boolean;
    onSelectTask: (localId: string) => void;
    onNewTaskFiles: (files: File[]) => void;
    onClearAll: () => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);

    const openPicker = () => {
        if (!props.canCreateNewTask) return;
        inputRef.current?.click();
    };

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        e.target.value = "";
        if (files.length > 0) {
            props.onNewTaskFiles(files);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!props.canCreateNewTask}
                className={cn(
                    "h-8 shrink-0 gap-1 px-2.5 text-xs",
                    !props.canCreateNewTask && "opacity-50",
                )}
                onClick={openPicker}
            >
                <Plus className="size-3.5" />
                New Task
            </Button>

            <div className="flex items-center gap-1.5">
                {props.tasks.map((task) => {
                    const active = task.localId === props.activeLocalId;
                    return (
                        <button
                            key={task.localId}
                            type="button"
                            title={slotTitle(task)}
                            aria-label={slotTitle(task)}
                            aria-pressed={active}
                            onClick={() => props.onSelectTask(task.localId)}
                            className="rounded-md p-0.5"
                        >
                            <TaskSlotIcon status={task.status} active={active} />
                        </button>
                    );
                })}
            </div>

            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 text-muted-foreground"
                asChild
            >
                <Link href="/v2/home/history" title="查看更多任务" aria-label="查看更多任务">
                    <ChevronsRight className="size-4" />
                </Link>
            </Button>

            <div className="flex-1" />

            <div className="flex shrink-0 items-center gap-3">
                {props.showLanguageSwitch && (
                    <div className="flex items-center gap-1.5">
                        <Languages
                            className={`size-3.5 ${props.showTranslated ? "text-foreground" : "text-muted-foreground"}`}
                            aria-hidden
                        />
                        <Switch
                            checked={props.showTranslated}
                            onCheckedChange={props.onShowTranslatedChange}
                            aria-label={props.showTranslated ? "查看翻译图" : "查看原图"}
                        />
                    </div>
                )}
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 text-muted-foreground"
                    onClick={props.onClearAll}
                >
                    <X className="size-3" />
                    全部清除
                </Button>
            </div>

            <input
                ref={inputRef}
                type="file"
                accept={ACCEPT}
                multiple
                className="hidden"
                onChange={onChange}
            />
        </div>
    );
}
