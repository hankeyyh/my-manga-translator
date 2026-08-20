"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
    Check,
    CircleAlert,
    Clock,
    Download,
    Languages,
    List,
    Plus,
    Upload,
    X,
} from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    CcButton,
    CcCard,
    CcCardTitle,
    CcLabel,
    CcSelectTrigger,
    CcSwitch,
} from "@/design/design-system/components";
import { ThumbNail } from "@/components/thumbnail";
import { ImagePreview } from "@/components/image-preview";
import { UploadZone } from "@/app/(main)/_components/upload-zone";
import { MangaPage } from "@/types/web/manga-page";
import { TranslationConfig, Translator } from "@/types/do/translation-config";
import { toast } from "sonner";
import { ApiSubmitTaskResponse } from "@/types/api/translation-task";
import { ApiTranslationTaskLiteImage } from "@/types/api/translation-image";
import { cn } from "@/components/utils";
import { LangOption, WorkspaceTask } from "@/types/web/workspace-task";

const SUPPORTED_LANGS = [
    { code: "CHS", label: "简体中文" },
    { code: "CHT", label: "繁體中文" },
    { code: "ENG", label: "English" },
    { code: "JPN", label: "日本語" },
    { code: "KOR", label: "한국어" },
];
const SUPPORTED_MODE = ["快速翻译 (1 credit)", "精确翻译 (2 credits)"];
const SUPPORTED_FONT_STYLE = ["漫画", "手写", "印刷"];
const MAX_PAGES = 20;
const POLL_INTERVAL_MS = 1000;
const POLL_TIMEOUT_MS = 5 * 60 * 1000;

const WORKSPACE_BG = "bg-[var(--cc-surface-page)]";
const EAR_LEFT =
    "pointer-events-none absolute bottom-0 -left-3 size-3 rounded-br-xl shadow-[6px_6px_0_6px_var(--cc-surface-page)]";
const EAR_RIGHT =
    "pointer-events-none absolute bottom-0 -right-3 size-3 rounded-bl-xl shadow-[-6px_6px_0_6px_var(--cc-surface-page)]";

type TaskKind = "draft" | "processing" | "completed" | "failed" | "stalled";
type CloseConfirm =
    | { type: "task"; localId: string; }
    | { type: "others"; };

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isPagePollable(page: MangaPage): boolean {
    return Boolean(page.imageId) && (page.status === "pending" || page.status === "processing");
}

function isPageInFlight(page: MangaPage): boolean {
    return page.status === "pending" || page.status === "processing" || page.status === "stalled";
}

function pagesAllStatus(pages: MangaPage[], status: NonNullable<MangaPage["status"]>): boolean {
    return pages.length > 0 && pages.every((page) => page.status === status);
}

function deriveTaskKind(task: WorkspaceTask): TaskKind {
    if (!task.serverTaskId) {
        return "draft";
    }
    if (task.submitLoading) {
        return "processing";
    }
    if (pagesAllStatus(task.pages, "failed")) {
        return "failed";
    }
    if (pagesAllStatus(task.pages, "stalled")) {
        return "stalled";
    }
    if (task.pages.some(isPageInFlight)) {
        return "processing";
    }
    return "completed";
}

function collectPollIds(tasks: WorkspaceTask[]): string[] {
    return tasks.flatMap((task) => task.pages).filter(isPagePollable).map((page) => page.imageId!);
}

function filesToPages(files: File[], existingNames: Set<string>): MangaPage[] {
    const pages: MangaPage[] = [];
    const seen = new Set(existingNames);
    for (const file of files) {
        if (seen.has(file.name)) {
            continue;
        }
        if (pages.length + existingNames.size >= MAX_PAGES) {
            break;
        }
        seen.add(file.name);
        pages.push({
            name: file.name,
            originalFile: file,
            originalUrl: URL.createObjectURL(file),
            originalSize: formatFileSize(file.size),
        });
    }
    return pages;
}

// UploadZone，任务栏新增任务会触发
function createDraftTask(files: File[] = []): WorkspaceTask {
    return {
        localId: crypto.randomUUID(),
        serverTaskId: null,
        pages: filesToPages(files, new Set()),
        targetLang: SUPPORTED_LANGS[0],
        translateMode: SUPPORTED_MODE[0],
        fontStyle: SUPPORTED_FONT_STYLE[0],
        submitLoading: false,
        retryLoading: false,
        showTranslated: true,
        pollStartedAt: null,
    };
}

function revokePageUrls(pages: MangaPage[]): void {
    for (const page of pages) {
        if (page.originalUrl.startsWith("blob:")) {
            URL.revokeObjectURL(page.originalUrl);
        }
    }
}

function shortTaskLabel(task: WorkspaceTask): string {
    if (!task.serverTaskId) {
        return `草稿 · ${task.pages.length} 页`;
    }
    return `任务 ${task.serverTaskId.slice(0, 8)}`;
}

function hasCompletedResults(pages: MangaPage[]): boolean {
    return pages.some((page) => page.status === "completed");
}

/**
 * TODO fontstyle 没有使用.
 * TODO 根据srclang, tarlang 决定翻译方向
 */
function buildTranslationConfig(selLang: LangOption, selMode: string, _selFontStyle: string): TranslationConfig {
    let company: Translator;
    let modelName: string;

    if (selMode === SUPPORTED_MODE[0]) {
        company = "deepseek";
        modelName = "deepseek-v4-flash";
    } else {
        company = "chatgpt";
        modelName = "gpt-5.5";
    }

    return {
        translator: {
            translator: company,
            model_name: modelName,
            target_lang: selLang.code,
        },
        render: {
            font_name: "Anime Ace 3.0",
            fit_to_box: true,
        },
        detector: {
            detector: "ctd",
        },
        inpainter: {
            inpainter: "lama_large",
        },
        ocr: {
            ocr: "48px",
        },
        upscale: {
            upscaler: "esrgan",
            upscale_ratio: 2,
            revert_upscaling: true,
        },
    };
}

function onDownload(pages: MangaPage[]) {
    const imageIds = pages
        .filter((page) => page.imageId && page.status === "completed")
        .map((page) => page.imageId);
    if (imageIds.length === 0) {
        return;
    }
    window.location.href = `${window.origin}/api/download?imageIds=${imageIds.join(",")}`;
}

function mergeLiteImages(pages: MangaPage[], images: ApiTranslationTaskLiteImage[]): MangaPage[] {
    const byId = new Map(images.map((img) => [img.id, img]));
    return pages.map((page) => {
        if (!page.imageId || page.status === "completed") {
            return page;
        }
        const img = byId.get(page.imageId);
        if (!img) {
            return page;
        }
        const next: MangaPage = {
            ...page,
            status: img.status,
            imageId: img.id,
            taskId: img.taskId || page.taskId,
        };
        if (img.status === "completed" && img.resultImageUrl) {
            next.resultUrl = img.resultImageUrl;
        }
        return next;
    });
}

function TaskStatusIcon({ kind }: { kind: TaskKind; }) {
    if (kind === "completed") {
        return (
            <span className="flex size-4 items-center justify-center rounded-full bg-[var(--cc-status-success)] text-white">
                <Check className="size-2.5" strokeWidth={3} />
            </span>
        );
    }
    if (kind === "failed") {
        return (
            <CircleAlert className="size-4 text-[var(--cc-status-error)]" strokeWidth={2.5} />
        );
    }
    if (kind === "stalled") {
        return (
            <span className="flex size-4 items-center justify-center rounded-full bg-[var(--cc-status-warning)] text-white">
                <Clock className="size-2.5" />
            </span>
        );
    }
    if (kind === "processing") {
        return (
            <span className="flex size-4 items-center justify-center rounded-full bg-[var(--cc-brand-primary)] text-white">
                <Clock className="size-2.5" />
            </span>
        );
    }
    return (
        <span className="flex size-4 items-center justify-center rounded-full bg-[var(--cc-text-muted)] text-white">
            <Clock className="size-2.5" />
        </span>
    );
}

export function TranslateSection() {
    const [tasks, setTasks] = useState<WorkspaceTask[]>([]);
    const tasksRef = useRef<WorkspaceTask[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [previewIndex, setPreviewIndex] = useState<number | null>(null);
    const [polling, setPolling] = useState(false);
    const [closeConfirm, setCloseConfirm] = useState<CloseConfirm | null>(null);
    const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const addInputRef = useRef<HTMLInputElement>(null);

    const activeTask = tasks.find((task) => task.localId === activeId) ?? tasks[0] ?? null;
    const activeKind = activeTask ? deriveTaskKind(activeTask) : null;
    const pages = activeTask?.pages ?? [];
    const configLocked = activeKind !== "draft";
    const activeIndex = activeTask ? tasks.findIndex((task) => task.localId === activeTask.localId) : -1;

    useEffect(() => {
        tasksRef.current = tasks;
    }, [tasks]);

    const clearPollTimeout = (): void => {
        if (pollTimeoutRef.current !== null) {
            clearTimeout(pollTimeoutRef.current);
            pollTimeoutRef.current = null;
        }
    };

    useEffect(() => {
        return () => {
            for (const task of tasksRef.current) {
                revokePageUrls(task.pages);
            }
            clearPollTimeout();
        };
    }, []);

    const updateTask = (localId: string, updater: (task: WorkspaceTask) => WorkspaceTask) => {
        setTasks((prev) => {
            const next = prev.map((task) => (task.localId === localId ? updater(task) : task));
            tasksRef.current = next;
            return next;
        });
    };

    const selectTask = (localId: string) => {
        setActiveId(localId);
        setPreviewIndex(null);
    };

    const appendFilesToTask = (localId: string, files: File[]) => {
        updateTask(localId, (task) => {
            if (deriveTaskKind(task) !== "draft") {
                return task;
            }
            const added = filesToPages(files, new Set(task.pages.map((page) => page.name)));
            if (added.length === 0) {
                return task;
            }
            return { ...task, pages: [...task.pages, ...added] };
        });
    };

    const onFilesSelected = (files: File[]): void => {
        if (activeTask && deriveTaskKind(activeTask) === "draft") {
            appendFilesToTask(activeTask.localId, files);
            return;
        }
        const existingDraft = tasksRef.current.find((task) => deriveTaskKind(task) === "draft");
        if (existingDraft) {
            appendFilesToTask(existingDraft.localId, files);
            selectTask(existingDraft.localId);
            return;
        }
        const draft = createDraftTask(files);
        if (draft.pages.length === 0) {
            return;
        }
        setTasks((prev) => {
            const next = [...prev, draft];
            tasksRef.current = next;
            return next;
        });
        selectTask(draft.localId);
    };

    /**
     * 关于何时从tasks读取，何时从ref读取：
     * - 这次读取会不会跨过一次「render 边界」？
     * - 这次读取要不要和「即将写入的setTasks」一致？
     *      - 如果随后有setTasks，且使用函数式更新，要读tasksRef，和之后的prev对齐
     * - 这次读取是不是为了纯展示？
     */
    const ensureDraftTask = (): string => {
        // 随后setTasks函数式更新，所以这里使用tasksRef保证读取最新，和prev对齐
        const existingDraft = tasksRef.current.find((task) => deriveTaskKind(task) === "draft");
        if (existingDraft) {
            selectTask(existingDraft.localId);
            return existingDraft.localId;
        }
        const draft = createDraftTask();
        setTasks((prev) => {
            const next = [...prev, draft];
            tasksRef.current = next;
            return next;
        });
        selectTask(draft.localId);
        return draft.localId;
    };

    /**
     * 删除操作
     * - 关闭单个任务
     * - 关闭其他任务
     * - 关闭进行中的任务，需要确认
     * - 清空草稿
     * - 删除任务中的图片
     */
    const removeTask = (localId: string) => {
        const target = tasksRef.current.find((task) => task.localId === localId);
        if (target) {
            revokePageUrls(target.pages);
        }
        setPreviewIndex(null);
        setTasks((prev) => {
            const next = prev.filter((task) => task.localId !== localId);
            tasksRef.current = next;
            if (activeId === localId) {
                setActiveId(next[0]?.localId ?? null);
            }
            return next;
        });
        setCloseConfirm(null);
    };

    const closeTask = (localId: string) => {
        const target = tasksRef.current.find((task) => task.localId === localId);
        if (!target) {
            return;
        }
        const kind = deriveTaskKind(target);
        if (kind === "processing" || kind === "stalled") {
            setCloseConfirm({ type: "task", localId });
            return;
        }
        removeTask(localId);
    };

    const closeOtherTasks = () => {
        if (!activeTask) {
            return;
        }
        const others = tasksRef.current.filter((task) => task.localId !== activeTask.localId);
        if (others.some((task) => {
            const kind = deriveTaskKind(task);
            return kind === "processing" || kind === "stalled";
        })) {
            setCloseConfirm({ type: "others" });
            return;
        }
        for (const task of others) {
            revokePageUrls(task.pages);
        }
        setTasks((prev) => {
            const next = prev.filter((task) => task.localId === activeTask.localId);
            tasksRef.current = next;
            return next;
        });
        setPreviewIndex(null);
    };

    const confirmClose = () => {
        if (!closeConfirm) {
            return;
        }
        if (closeConfirm.type === "task") {
            removeTask(closeConfirm.localId);
            return;
        }
        if (!activeTask) {
            setCloseConfirm(null);
            return;
        }
        const others = tasksRef.current.filter((task) => task.localId !== activeTask.localId);
        for (const task of others) {
            revokePageUrls(task.pages);
        }
        setTasks((prev) => {
            const next = prev.filter((task) => task.localId === activeTask.localId);
            tasksRef.current = next;
            return next;
        });
        setPreviewIndex(null);
        setCloseConfirm(null);
    };

    const clearDraft = () => {
        if (!activeTask || deriveTaskKind(activeTask) !== "draft") {
            return;
        }
        revokePageUrls(activeTask.pages);
        updateTask(activeTask.localId, (task) => ({
            ...task,
            pages: [],
        }));
        setPreviewIndex(null);
    };

    const removePage = (name: string): void => {
        if (!activeTask || deriveTaskKind(activeTask) !== "draft") {
            return;
        }
        updateTask(activeTask.localId, (task) => {
            const targetIndex = task.pages.findIndex((page) => page.name === name);
            if (targetIndex < 0) {
                return task;
            }
            URL.revokeObjectURL(task.pages[targetIndex].originalUrl);
            const nextPages = task.pages.filter((page) => page.name !== name);
            setPreviewIndex((current) => {
                if (current === null) return null;
                if (nextPages.length === 0) return null;
                if (targetIndex < current) return current - 1;
                if (targetIndex === current) return Math.min(current, nextPages.length - 1);
                return current;
            });
            return { ...task, pages: nextPages };
        });
    };

    // 提交翻译
    const submitTask = async (localId: string) => {
        const task = tasksRef.current.find((item) => item.localId === localId);
        if (!task || deriveTaskKind(task) !== "draft" || task.submitLoading || task.pages.length === 0) {
            return;
        }
        updateTask(localId, (current) => ({
            ...current,
            submitLoading: true,
            pages: current.pages.map((page) => ({ ...page, status: "pending" as const })),
        }));
        try {
            const conf = buildTranslationConfig(task.targetLang, task.translateMode, task.fontStyle);
            const formData = new FormData();
            for (const page of task.pages) {
                if (page.originalFile) {
                    formData.append("images", page.originalFile);
                }
            }
            formData.set("config", JSON.stringify(conf));
            const response = await fetch("/api/translate/submit", {
                method: "POST",
                body: formData,
            });
            const data: ApiSubmitTaskResponse & { error?: string; } = await response.json();
            if (!response.ok || data.error) {
                throw new Error(data.error);
            }
            updateTask(localId, (current) => ({
                ...current,
                serverTaskId: data.taskId,
                submitLoading: false,
                pollStartedAt: Date.now(),
                pages: current.pages.map((page, i) => ({
                    ...page,
                    imageId: data.imageIds[i],
                    taskId: data.taskId,
                    status: "pending" as const,
                })),
            }));
            setPolling(true);
        } catch (err) {
            const errMsg = err instanceof Error ? err.message : "Unknown Error";
            toast.error(errMsg);
            console.error(errMsg);
            updateTask(localId, (current) => ({
                ...current,
                submitLoading: false,
                pages: current.pages.map((page) => (
                    page.status === "completed" ? page : { ...page, status: "failed" as const }
                )),
            }));
        }
    };

    // 重试
    const retryTaskImages = async (serverTaskId: string | null, imageIds: string[]) => {
        if (!serverTaskId || imageIds.length === 0) {
            return;
        }
        const owner = tasksRef.current.find((task) => task.serverTaskId === serverTaskId);
        if (!owner || owner.retryLoading) {
            return;
        }
        const retryIdSet = new Set(imageIds);
        updateTask(owner.localId, (current) => ({
            ...current,
            retryLoading: true,
            pages: current.pages.map((page) => (
                page.imageId && retryIdSet.has(page.imageId)
                    ? { ...page, status: "pending" as const }
                    : page
            )),
        }));
        try {
            const response = await fetch("/api/translate/retry", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ taskId: serverTaskId, imageIds }),
            });
            if (!response.ok) {
                const { error } = await response.json() as { error: string; };
                throw new Error(error);
            }
            updateTask(owner.localId, (current) => ({
                ...current,
                retryLoading: false,
                pollStartedAt: Date.now(),
            }));
            setPolling(true);
        } catch (err) {
            const errMsg = err instanceof Error ? err.message : "Unknown Error";
            toast.error(errMsg);
            console.error(errMsg);
            updateTask(owner.localId, (current) => ({
                ...current,
                retryLoading: false,
                pages: current.pages.map((page) => (
                    page.imageId && retryIdSet.has(page.imageId)
                        ? { ...page, status: "failed" as const }
                        : page
                )),
            }));
        }
    };

    // 继续等待
    const continueWait = (localId: string) => {
        updateTask(localId, (current) => ({
            ...current,
            pollStartedAt: Date.now(),
            pages: current.pages.map((page) => (
                page.status === "stalled" ? { ...page, status: "pending" as const } : page
            )),
        }));
        setPolling(true);
    };

    // 轮询未结束图片；新任务只并入 poll set，不拆掉当前循环
    useEffect(() => {
        if (!polling) {
            return;
        }

        const abortController = new AbortController();
        let cancelled = false;

        // poll->scheduleNext->poll循环，不setTimeout(scheduleNext)，是因为：
        // 终止轮询的条件有多个：图片处理结束，超时，abort signal。如果写成setTimeout(scheduleNext)，
        // 需要poll在每种终止情况下，都显示设置cancelled=true，如果后续增加终止分支，也要设置
        // 而将是否进行下一轮的决定权交给poll，只需要在决定轮询的地方调用scheduleNext即可。关键在：谁有权决定还要不要下一轮
        const scheduleNext = () => {
            if (cancelled) return;
            clearPollTimeout();
            pollTimeoutRef.current = setTimeout(() => void poll(), POLL_INTERVAL_MS);
        };

        const applyTimeout = (current: WorkspaceTask[], now: number): { next: WorkspaceTask[]; timedOut: boolean; } => {
            let timedOut = false;
            const next = current.map((task) => {
                if (
                    !task.pollStartedAt ||
                    now - task.pollStartedAt <= POLL_TIMEOUT_MS ||
                    !task.pages.some((page) => page.status === "pending" || page.status === "processing")
                ) {
                    return task;
                }
                timedOut = true;
                return {
                    ...task,
                    pages: task.pages.map((page) => (
                        page.status === "completed" || page.status === "failed"
                            ? page
                            : { ...page, status: "stalled" as const }
                    )),
                };
            });
            return { next, timedOut };
        };

        const poll = async () => {
            if (cancelled) return;

            const imageIds = collectPollIds(tasksRef.current);
            if (imageIds.length === 0) {
                clearPollTimeout();
                setPolling(false);
                return;
            }

            try {
                const response = await fetch(
                    `/api/translate/batch-image-lite?imageIds=${encodeURIComponent(imageIds.join(","))}`,
                    { signal: abortController.signal },
                );
                const data = await response.json() as { error?: string; images?: ApiTranslationTaskLiteImage[]; };
                if (!response.ok) {
                    throw new Error(data.error);
                }
                const images = data.images ?? [];
                // 合并，更新page.status，如果成功，更新resultUrl
                const merged = tasksRef.current.map((task) => ({
                    ...task,
                    pages: mergeLiteImages(task.pages, images),
                }));
                // 检查是否有任务是否超时，如果超时page.status=stalled
                const applied = applyTimeout(merged, Date.now());
                tasksRef.current = applied.next;
                /**
                 * 注意区分两种setTasks:
                 * - poll闭包外，其他代码都使用函数式更新，本质是以上一份React state为源
                 * - poll闭包中，不使用函数式更新，本质是以tasksRef为源，tasks是setup那一刻的旧状态，不能以它为源
                 */
                setTasks(applied.next);
                if (applied.timedOut) {
                    toast.error("翻译超时，请重试");
                    console.error("Translation timeout");
                }
                // 所有图片处理结束
                if (collectPollIds(applied.next).length === 0) {
                    clearPollTimeout();
                    setPolling(false);
                    return;
                }
                // 还有图片在处理中，需要继续轮询
                scheduleNext();
            } catch (err) {
                if (err instanceof Error && err.name === "AbortError") {
                    return;
                }
                const errMsg = err instanceof Error ? err.message : "Unknown Error";
                toast.error(errMsg);
                console.error(errMsg);
                clearPollTimeout();
                setPolling(false);
            }
        };

        void poll();

        return () => {
            cancelled = true;
            clearPollTimeout();
            abortController.abort();
        };
    }, [polling]);

    return (
        <section id="tool" className="scroll-mt-16 border-t border-cc-border/40 bg-cc-surface-page py-12">
            <div className="mx-auto max-w-7xl space-y-4 px-4">
                <UploadZone
                    uploaded={activeTask ? activeTask.pages.length : 0}
                    maxPages={MAX_PAGES}
                    compact={tasks.length > 0}
                    onFilesSelected={onFilesSelected}
                />

                {activeTask && (
                    <div>
                        {/* 任务栏 */}
                        <div className="flex items-end gap-2">
                            <div className="flex min-w-0 flex-1 items-end gap-1 overflow-x-auto">
                                {tasks.map((item, index) => {
                                    const kind = deriveTaskKind(item);
                                    const active = item.localId === activeTask.localId;
                                    const firstActive = active && index === 0;
                                    return (
                                        <div
                                            key={item.localId}
                                            className={cn(
                                                "relative inline-flex h-9 shrink-0 items-center text-sm",
                                                active
                                                    ? cn("z-10 rounded-t-xl font-medium text-cc-text-primary", WORKSPACE_BG)
                                                    : "mb-px rounded-t-lg text-cc-text-muted hover:bg-[var(--cc-brand-tint-strong)]",
                                            )}
                                        >
                                            {active && !firstActive && <span aria-hidden className={EAR_LEFT} />}
                                            {active && <span aria-hidden className={EAR_RIGHT} />}
                                            <button
                                                type="button"
                                                className="inline-flex h-full items-center gap-1.5 px-3"
                                                onClick={() => selectTask(item.localId)}
                                            >
                                                <TaskStatusIcon kind={kind} />
                                                {shortTaskLabel(item)}
                                            </button>
                                            <button
                                                type="button"
                                                className="pr-2 text-cc-text-muted hover:text-cc-brand-primary"
                                                aria-label={`关闭${shortTaskLabel(item)}`}
                                                onClick={() => closeTask(item.localId)}
                                            >
                                                <X className="size-3" />
                                            </button>
                                        </div>
                                    );
                                })}
                                <CcButton
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="mb-0.5 size-8 shrink-0 text-cc-text-muted"
                                    onClick={() => ensureDraftTask()}
                                >
                                    <Plus />
                                </CcButton>
                            </div>
                            <CcButton
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="mb-0.5 shrink-0 text-cc-text-muted"
                                disabled={tasks.length <= 1}
                                onClick={closeOtherTasks}
                            >
                                关闭其他
                            </CcButton>
                            <CcButton
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="mb-0.5 size-8 shrink-0 text-cc-text-muted"
                                asChild
                            >
                                <Link href="/home/history">
                                    <List />
                                </Link>
                            </CcButton>
                        </div>

                        <div
                            className={cn(
                                "-mt-px space-y-4 rounded-b-xl rounded-tr-xl p-4",
                                WORKSPACE_BG,
                                activeIndex !== 0 && "rounded-tl-xl",
                            )}
                        >
                            {/* 操作区 */}
                            <CcCard className="gap-4 p-5 lg:p-6" variant="elevated">
                                <CcCardTitle className="text-base">操作设置</CcCardTitle>
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                                        <div className="flex-1 space-y-1">
                                            <CcLabel>翻译为</CcLabel>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <CcSelectTrigger disabled={configLocked}>
                                                        {activeTask.targetLang.label}
                                                    </CcSelectTrigger>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    {SUPPORTED_LANGS.map((lang) => (
                                                        <DropdownMenuItem
                                                            key={lang.code}
                                                            onSelect={() => updateTask(activeTask.localId, (task) => ({
                                                                ...task,
                                                                targetLang: lang,
                                                            }))}
                                                        >
                                                            {lang.label}
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <CcLabel>翻译模式</CcLabel>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <CcSelectTrigger disabled={configLocked}>
                                                        {activeTask.translateMode}
                                                    </CcSelectTrigger>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    {SUPPORTED_MODE.map((mode) => (
                                                        <DropdownMenuItem
                                                            key={mode}
                                                            onSelect={() => updateTask(activeTask.localId, (task) => ({
                                                                ...task,
                                                                translateMode: mode,
                                                            }))}
                                                        >
                                                            {mode}
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <CcLabel>字体风格</CcLabel>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <CcSelectTrigger disabled={configLocked}>
                                                        {activeTask.fontStyle}
                                                    </CcSelectTrigger>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    {SUPPORTED_FONT_STYLE.map((style) => (
                                                        <DropdownMenuItem
                                                            key={style}
                                                            onSelect={() => updateTask(activeTask.localId, (task) => ({
                                                                ...task,
                                                                fontStyle: style,
                                                            }))}
                                                        >
                                                            {style}
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                        {activeKind !== "draft" && activeKind !== "processing" ? (
                                            <CcButton
                                                variant="outline"
                                                className="w-full sm:w-40"
                                                disabled={!hasCompletedResults(pages)}
                                                onClick={() => onDownload(pages)}
                                            >
                                                <Download />
                                                下载全部
                                            </CcButton>
                                        ) : (
                                            <CcButton
                                                className="w-full sm:w-40"
                                                disabled={activeKind === "processing" || activeTask.submitLoading || pages.length === 0}
                                                onClick={() => void submitTask(activeTask.localId)}
                                            >
                                                <Upload />
                                                提交翻译
                                            </CcButton>
                                        )}
                                    </div>
                            </CcCard>

                            {/* 预览区 */}
                            <CcCard className="gap-4 p-5 lg:p-6" variant="elevated">
                                <div className="flex flex-row items-center justify-between gap-2">
                                    <CcCardTitle className="text-base">
                                        图片预览（共 {pages.length} 张）
                                    </CcCardTitle>
                                    <div className="flex items-center gap-2">
                                        {activeKind === "completed" && hasCompletedResults(pages) && (
                                            <div className="flex items-center gap-1.5">
                                                <Languages
                                                    className={cn(
                                                        "size-3.5",
                                                        activeTask.showTranslated ? "text-cc-brand-primary" : "text-cc-text-muted",
                                                    )}
                                                />
                                                <CcSwitch
                                                    checked={activeTask.showTranslated}
                                                    onCheckedChange={(checked) => updateTask(activeTask.localId, (task) => ({
                                                        ...task,
                                                        showTranslated: checked,
                                                    }))}
                                                    aria-label={activeTask.showTranslated ? "查看翻译图" : "查看原图"}
                                                />
                                            </div>
                                        )}
                                        <CcButton
                                            variant="ghost"
                                            size="sm"
                                            disabled={configLocked}
                                            onClick={clearDraft}
                                        >
                                            <X className="size-3" />
                                            全部清除
                                        </CcButton>
                                    </div>
                                </div>
                                    <div className="grid grid-cols-2 items-stretch gap-3 sm:grid-cols-4 lg:grid-cols-6">
                                        {pages.map((page, index) => (
                                            <ThumbNail
                                                key={`${activeTask.localId}-${page.name}`}
                                                {...page}
                                                showTranslated={activeTask.showTranslated}
                                                onRemove={activeKind === "draft" ? () => removePage(page.name) : undefined}
                                                onPreview={() => setPreviewIndex(index)}
                                                onRetry={page.imageId && page.taskId
                                                    ? () => void retryTaskImages(page.taskId!, [page.imageId!])
                                                    : undefined}
                                                onContinueWait={() => continueWait(activeTask.localId)}
                                                onDownload={page.status === "completed" ? () => onDownload([page]) : undefined}
                                            />
                                        ))}
                                        {activeKind === "draft" && pages.length < MAX_PAGES && (
                                            <button
                                                type="button"
                                                className="flex h-full min-h-40 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-cc-brand-primary/30 text-cc-text-muted hover:border-cc-brand-primary hover:bg-[var(--cc-brand-tint)]"
                                                onClick={() => addInputRef.current?.click()}
                                            >
                                                <span className="flex size-8 items-center justify-center rounded-full border border-cc-border">
                                                    <Plus className="size-4 text-cc-brand-primary" />
                                                </span>
                                                <span className="text-sm">添加图片</span>
                                            </button>
                                        )}
                                    </div>
                                    <input
                                        ref={addInputRef}
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.webp,.gif,.avif,.heic,image/*"
                                        multiple
                                        className="hidden"
                                        onChange={(e) => {
                                            // e.target.files 是input实时视图，如果用户选择新一批文件，target.files会跟随改变，所以需要转为File[]快照
                                            const files = Array.from(e.target.files ?? []);
                                            e.target.value = ""; // 如果不清空，连续选择同一个文件，value不变不会触发onChange
                                            if (files.length > 0 && activeTask) {
                                                appendFilesToTask(activeTask.localId, files);
                                            }
                                        }}
                                    />
                            </CcCard>
                        </div>
                    </div>
                )}

                <p className="text-center text-xs text-cc-text-muted">
                    ✦ AI 自动识别日语、中文、英语、韩语等多种语言
                </p>
            </div>

            {previewIndex !== null && activeTask && (
                <ImagePreview
                    pages={pages}
                    index={previewIndex}
                    showTranslated={activeTask.showTranslated}
                    onClose={() => setPreviewIndex(null)}
                    onIndexChange={setPreviewIndex}
                />
            )}

            <AlertDialog open={closeConfirm !== null} onOpenChange={(open) => !open && setCloseConfirm(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>确认关闭进行中的任务？</AlertDialogTitle>
                        <AlertDialogDescription>
                            翻译任务仍在进行中。关闭后仅会从当前工作区移除，后台翻译不会中止，已消耗的额度也不会退回。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmClose}>确认关闭</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </section>
    );
}
