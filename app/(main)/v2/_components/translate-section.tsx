"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
    ChevronDown,
    Download,
    Upload,
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
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThumbNail } from "@/components/v2/thumbnail";
import { MangaPage } from "@/types/web/manga-page";
import { ImagePreview } from "@/components/v2/image-preview";
import { UploadZone } from "@/components/v2/upload-zone";
import { TranslationConfig, Translator } from "@/types/do/translation-config";
import { toast } from "sonner";
import { ApiGetTranslationTaskResponse } from "@/types/api/translation-task";
import { TASK_ENDED_STATUSES, TaskStatus } from "@/types/do/translation-task";
import { MAX_SESSION_TASKS, SessionTask } from "@/types/web/session-task";
import { NewTaskBar } from "./new-task-bar";

const SUPPORTED_LANGS = [
    { code: "CHS", label: "简体中文" },
    { code: "CHT", label: "繁體中文" },
    { code: "ENG", label: "English" },
    { code: "JPN", label: "日本語" },
    { code: "KOR", label: "한국어" }
];
const SUPPORTED_MODE = ["快速翻译 (1 credit)", "精确翻译 (2 credits)"];
const SUPPORTED_FONT_STYLE = ["漫画", "手写", "印刷"];

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isTaskEnded(taskStatus: TaskStatus | null) {
    if (taskStatus === null) {
        return false;
    }
    return TASK_ENDED_STATUSES.includes(taskStatus);
}

function revokePages(pages: MangaPage[]) {
    for (const page of pages) {
        URL.revokeObjectURL(page.originalUrl);
    }
}

function mergeFilesIntoPages(prev: MangaPage[], files: File[]): MangaPage[] {
    const next = [...prev];
    const seen = new Set(prev.map((p) => p.name));
    for (const file of files) {
        if (seen.has(file.name)) continue;
        if (next.length >= 20) break;
        seen.add(file.name);
        next.push({
            name: file.name,
            originalFile: file,
            originalUrl: URL.createObjectURL(file),
            originalSize: formatFileSize(file.size),
        });
    }
    return next;
}

function createDraftTask(files: File[]): SessionTask {
    return {
        localId: crypto.randomUUID(),
        taskId: null,
        status: null,
        pages: mergeFilesIntoPages([], files),
        createdAt: Date.now(),
        showTranslated: true,
    };
}

/**
 * TODO fontstyle 没有使用
 */
function buildTranslationConfig(selLang: { code: string, label: string; }, selMode: string, selFontStyle: string): TranslationConfig {
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
            ocr: "mocr",
            use_mocr_merge: true,
        },
        upscale: {
            upscaler: "esrgan",
            upscale_ratio: 2,
            revert_upscaling: true,
        },
    };
}

function onDownload(pages: MangaPage[]) {
    const imageIds = pages.map((value) => {
        if (!value.imageId || value.status !== "completed") {
            return;
        }
        return value.imageId;
    });
    const imageIdsStr = imageIds.join(",");
    window.location.href = `${window.origin}/api/download?imageIds=${imageIdsStr}`;
}

function isAllPageEnded(pages: MangaPage[]) {
    if (pages.length === 0) {
        return false;
    }
    return pages.every(
        (page) => page.status === "completed" || page.status === "failed",
    );
}

function hasCompletedResults(pages: MangaPage[]) {
    const allEnded = isAllPageEnded(pages);
    const hasCompleted = pages.some((page) => page.status === "completed");
    return allEnded && hasCompleted;
}

export function TranslateSection() {
    const [sessionTasks, setSessionTasks] = useState<SessionTask[]>([]);
    const [activeLocalId, setActiveLocalId] = useState<string | null>(null);
    const sessionTasksRef = useRef<SessionTask[]>([]);
    const activeLocalIdRef = useRef<string | null>(null);

    const [previewIndex, setPreviewIndex] = useState<number | null>(null);
    const [targetLang, setTargetLang] = useState<{ code: string, label: string; }>(SUPPORTED_LANGS[0]);
    const [translateMode, setTranslateMode] = useState<string>(SUPPORTED_MODE[0]);
    const [fontStyle, setFontStyle] = useState<string>(SUPPORTED_FONT_STYLE[0]);
    const [submitLoading, setSubmitLoading] = useState<boolean>(false);
    const [retryLoading, setRetryLoading] = useState<boolean>(false);
    const [polling, setPolling] = useState<boolean>(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

    const activeTask = useMemo(
        () => sessionTasks.find((t) => t.localId === activeLocalId) ?? null,
        [sessionTasks, activeLocalId],
    );
    const pages = activeTask?.pages ?? [];
    const taskId = activeTask?.taskId ?? null;
    const taskStatus = activeTask?.status ?? null;
    const showTranslated = activeTask?.showTranslated ?? true;

    /** 存在未提交草稿时不可再 New Task；草稿不存在且已有任务时才可开新任务 */
    const draftTask = useMemo(
        () => sessionTasks.find((t) => t.taskId === null) ?? null,
        [sessionTasks],
    );
    const canCreateNewTask = sessionTasks.length > 0 && draftTask === null;

    const showNewTaskBar = sessionTasks.length > 0;

    /** 仅当前选中 task 有完成译图时显示语言开关 */
    const showLanguageSwitch = hasCompletedResults(pages);

    /** UploadZone 计数对齐「将写入的未提交 task」 */
    const uploadZoneCount = draftTask?.pages.length ?? 0;

    const updateActiveTask = (updater: (task: SessionTask) => SessionTask) => {
        setSessionTasks((prev) =>
            prev.map((task) => (task.localId === activeLocalIdRef.current ? updater(task) : task)),
        );
    };

    const setShowTranslated = (value: boolean) => {
        updateActiveTask((task) => ({ ...task, showTranslated: value }));
    };

    /** 开启新草稿并设为 active（UploadZone / New Task 共用） */
    const startNewDraftWithFiles = (files: File[]): void => {
        const draft = createDraftTask(files);
        setSessionTasks((prev) => {
            const next = [draft, ...prev];
            while (next.length > MAX_SESSION_TASKS) {
                const dropped = next.pop();
                if (dropped) revokePages(dropped.pages);
            }
            return next;
        });
        setActiveLocalId(draft.localId);
        setPreviewIndex(null);
        setSubmitLoading(false);
        setRetryLoading(false);
        setPolling(false);
        clearIntervalRef();
    };

    /**
     * UploadZone：始终写入当前未提交 task；
     * 若还没有未提交 task，行为与 New Task 相同（新建并激活）。
     */
    const onFilesSelected = (files: File[]): void => {
        if (files.length === 0) return;

        const draft = sessionTasksRef.current.find((t) => t.taskId === null);
        if (!draft) {
            startNewDraftWithFiles(files);
            return;
        }

        setSessionTasks((prev) =>
            prev.map((task) => {
                if (task.localId !== draft.localId) return task;
                return {
                    ...task,
                    pages: mergeFilesIntoPages(task.pages, files),
                };
            }),
        );

        if (activeLocalIdRef.current !== draft.localId) {
            setActiveLocalId(draft.localId);
            setPreviewIndex(null);
            setPolling(false);
            clearIntervalRef();
        }
    };

    /** New Task：无未提交草稿时，新建草稿并激活 */
    const onNewTaskFiles = (files: File[]): void => {
        if (files.length === 0 || !canCreateNewTask) return;
        startNewDraftWithFiles(files);
    };

    const onSelectTask = (localId: string): void => {
        if (localId === activeLocalIdRef.current) return;

        const target = sessionTasksRef.current.find((t) => t.localId === localId);
        if (!target) return;

        setActiveLocalId(localId);
        setPreviewIndex(null);
        clearIntervalRef();

        if (target.taskId && !isTaskEnded(target.status)) {
            setPolling(true);
        } else {
            setPolling(false);
        }
    };

    const clearIntervalRef = (): void => {
        if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    useEffect(() => {
        sessionTasksRef.current = sessionTasks;
    }, [sessionTasks]);

    useEffect(() => {
        activeLocalIdRef.current = activeLocalId;
    }, [activeLocalId]);

    // 退出页面，清理资源
    useEffect(() => {
        return () => {
            for (const task of sessionTasksRef.current) {
                revokePages(task.pages);
            }
            clearIntervalRef();
        };
    }, []);

    // 清除当前激活任务槽（会话内其余任务保留）
    const resetActiveWorkspace = (): void => {
        const activeId = activeLocalIdRef.current;
        clearIntervalRef();
        setPreviewIndex(null);
        setSubmitLoading(false);
        setRetryLoading(false);
        setPolling(false);

        setSessionTasks((prev) => {
            const active = prev.find((t) => t.localId === activeId);
            if (active) revokePages(active.pages);
            const next = prev.filter((t) => t.localId !== activeId);
            if (next.length === 0) {
                setActiveLocalId(null);
            } else {
                const nextActive = next[0];
                setActiveLocalId(nextActive.localId);
                if (nextActive.taskId && !isTaskEnded(nextActive.status)) {
                    setPolling(true);
                }
            }
            return next;
        });
    };

    const onClearAll = (): void => {
        if (taskId && !isTaskEnded(taskStatus)) {
            setClearConfirmOpen(true);
        } else {
            resetActiveWorkspace();
        }
    };

    // 删除单张图片
    const removePage = (name: string): void => {
        const activeId = activeLocalIdRef.current;
        if (!activeId) return;

        setSessionTasks((prev) => {
            const taskIndex = prev.findIndex((t) => t.localId === activeId);
            if (taskIndex < 0) return prev;

            const task = prev[taskIndex];
            const targetIndex = task.pages.findIndex((p) => p.name === name);
            if (targetIndex < 0) return prev;

            URL.revokeObjectURL(task.pages[targetIndex].originalUrl);
            const nextPages = task.pages.filter((p) => p.name !== name);

            setPreviewIndex((current) => {
                if (current === null) return null;
                if (nextPages.length === 0) return null;
                if (targetIndex < current) return current - 1;
                if (targetIndex === current) return Math.min(current, nextPages.length - 1);
                return current;
            });

            // 页被删空：移除该槽
            if (nextPages.length === 0) {
                const next = prev.filter((t) => t.localId !== activeId);
                if (next.length === 0) {
                    setActiveLocalId(null);
                    setPolling(false);
                    clearIntervalRef();
                } else {
                    const nextActive = next[0];
                    setActiveLocalId(nextActive.localId);
                    if (nextActive.taskId && !isTaskEnded(nextActive.status)) {
                        setPolling(true);
                    } else {
                        setPolling(false);
                        clearIntervalRef();
                    }
                }
                return next;
            }

            return prev.map((t, i) =>
                i === taskIndex ? { ...t, pages: nextPages } : t,
            );
        });
    };

    // 提交翻译
    const submitTask = async () => {
        if (pages.length === 0 || taskId || submitLoading || polling) {
            return;
        }
        setSubmitLoading(true);
        try {
            const conf = buildTranslationConfig(targetLang, translateMode, fontStyle);
            updateActiveTask((task) => ({
                ...task,
                pages: task.pages.map((value) => ({ ...value, status: "pending" })),
            }));

            const formData = new FormData();
            for (const page of pages) {
                if (page.originalFile) {
                    formData.append("images", page.originalFile);
                }
            }
            formData.set("config", JSON.stringify(conf));
            const response = await fetch("/api/translate/submit", {
                method: "POST",
                body: formData,
            });
            const data = await response.json() as { error?: string, taskId?: string; };
            if (!response.ok || data.error) {
                throw new Error(data.error);
            }
            updateActiveTask((task) => ({
                ...task,
                taskId: data.taskId!,
                status: "pending",
            }));
            setPolling(true);
        } catch (err) {
            const errMsg = err instanceof Error ? err.message : "Unknown Error";
            toast.error(errMsg);
            console.error(errMsg);
            updateActiveTask((task) => ({
                ...task,
                pages: task.pages.map((value) =>
                    value.status === "completed"
                        ? value
                        : { ...value, status: "failed" },
                ),
            }));
        } finally {
            setSubmitLoading(false);
        }
    };

    /**
     * TODO 如果重试的时候变换了config无法生效，retry默认使用提交时的task配置
     */
    // 重试翻译
    const retryTaskImages = async (retryTaskId: string | null, imageIds: string[]) => {
        if (!retryTaskId || imageIds.length === 0 || retryLoading) {
            return;
        }
        setRetryLoading(true);
        const retryIdSet = new Set(imageIds);
        updateActiveTask((task) => ({
            ...task,
            pages: task.pages.map((value) =>
                value.imageId && retryIdSet.has(value.imageId)
                    ? { ...value, status: "pending" }
                    : value,
            ),
        }));
        try {
            const response = await fetch("/api/translate/retry", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ taskId: retryTaskId, imageIds })
            });
            if (!response.ok) {
                const { error } = await response.json() as { error: string; };
                throw new Error(error);
            }
            setPolling(true);
            updateActiveTask((task) => ({
                ...task,
                status: "pending",
            }));
        } catch (err) {
            const errMsg = err instanceof Error ? err.message : "Unknown Error";
            toast.error(errMsg);
            console.error(errMsg);
            updateActiveTask((task) => ({
                ...task,
                pages: task.pages.map((value) =>
                    value.imageId && retryIdSet.has(value.imageId)
                        ? { ...value, status: "failed" }
                        : value,
                ),
            }));
        } finally {
            setRetryLoading(false);
        }
    };

    // 轮询当前激活任务
    // TODO 轮询多个任务
    useEffect(() => {
        if (!taskId || !polling) {
            return;
        }

        const polledTaskId = taskId;
        const polledLocalId = activeLocalId;
        const abortController = new AbortController();

        const startedAt = Date.now();
        const poll = async () => {
            if (Date.now() - startedAt > 5 * 60 * 1000) {
                clearIntervalRef();
                setPolling(false);
                toast.error("翻译超时，请重试");
                console.error("Translation timeout");
                setSessionTasks((prev) =>
                    prev.map((task) => {
                        if (task.localId !== polledLocalId) return task;
                        return {
                            ...task,
                            pages: task.pages.map((page) =>
                                page.status !== "completed" ? { ...page, status: "stalled" } : page,
                            ),
                        };
                    }),
                );
                return;
            }
            try {
                const response = await fetch(`/api/translate/task/${polledTaskId}`, {
                    signal: abortController.signal,
                });
                const data = await response.json() as { error?: string; } & ApiGetTranslationTaskResponse;
                if (!response.ok) {
                    throw new Error(data.error);
                }
                setSessionTasks((prev) =>
                    prev.map((task) => {
                        if (task.localId !== polledLocalId) return task;
                        return {
                            ...task,
                            status: data.status,
                            pages: task.pages.map((page) => {
                                const img = data.images.find((value) => value.filename === page.name);
                                if (!img || page.status === "completed") return page;
                                return {
                                    ...page,
                                    status: img.status,
                                    resultUrl: img.resultImageUrl,
                                    imageId: img.id,
                                };
                            }),
                        };
                    }),
                );
                if (isTaskEnded(data.status)) {
                    clearIntervalRef();
                    setPolling(false);
                }
            } catch (err) {
                if (err instanceof Error && err.name === "AbortError") {
                    return;
                }
                const errMsg = err instanceof Error ? err.message : "Unknown Error";
                toast.error(errMsg);
                console.error(errMsg);
                clearIntervalRef();
                setPolling(false);
            }
        };

        void poll();
        intervalRef.current = setInterval(() => void poll(), 1000);

        return () => {
            clearIntervalRef();
            abortController.abort();
        };
    }, [taskId, polling, activeLocalId]);

    return (
        <section id="tool" className="scroll-mt-16 border-t bg-muted/40 py-12">
            <div className="mx-auto max-w-5xl space-y-4 px-4">
                <UploadZone uploaded={uploadZoneCount} maxPages={20} onFilesSelected={onFilesSelected} />

                {showNewTaskBar && (
                    <NewTaskBar
                        tasks={sessionTasks}
                        activeLocalId={activeLocalId}
                        canCreateNewTask={canCreateNewTask}
                        showTranslated={showTranslated}
                        onShowTranslatedChange={setShowTranslated}
                        showLanguageSwitch={showLanguageSwitch}
                        onSelectTask={onSelectTask}
                        onNewTaskFiles={onNewTaskFiles}
                        onClearAll={onClearAll}
                    />
                )}

                {pages.length > 0 && (
                    <>
                        <div className="space-y-2">
                            <div className="grid grid-cols-5 items-start gap-3">
                                {pages.map((page, index) => (
                                    <ThumbNail
                                        key={`${activeLocalId}-${page.name}`}
                                        {...page}
                                        showTranslated={showTranslated}
                                        onRemove={() => removePage(page.name)}
                                        onPreview={() => setPreviewIndex(index)}
                                        onRetry={page.imageId ? () => void retryTaskImages(taskId, [page.imageId!]) : undefined}
                                        onContinueWait={() => void setPolling(true)}
                                        onDownload={() => void onDownload([page])}
                                    />
                                ))}
                            </div>
                            <AlertDialog open={clearConfirmOpen} onOpenChange={setClearConfirmOpen}>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>确认清除全部内容？</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            翻译任务仍在进行中。清除后仅会清空当前工作区，后台翻译不会中止，已消耗的额度也不会退回。
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>取消</AlertDialogCancel>
                                        <AlertDialogAction onClick={resetActiveWorkspace}>
                                            确认清除
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>

                        {previewIndex !== null && (
                            <ImagePreview
                                pages={pages}
                                index={previewIndex}
                                showTranslated={showTranslated}
                                onClose={() => setPreviewIndex(null)}
                                onIndexChange={setPreviewIndex}
                            />
                        )}

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium">翻译为</p>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="w-full justify-between" disabled={Boolean(taskId)}>
                                            {targetLang.label}
                                            <ChevronDown className="size-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56">
                                        {SUPPORTED_LANGS.map((lang) => (
                                            <DropdownMenuItem key={lang.code} onSelect={() => setTargetLang(lang)}>{lang.label}</DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium">翻译模式</p>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="w-full justify-between" disabled={Boolean(taskId)}>
                                            {translateMode}
                                            <ChevronDown className="size-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56">
                                        {SUPPORTED_MODE.map((mode) => (
                                            <DropdownMenuItem key={mode} onSelect={() => setTranslateMode(mode)}>{mode}</DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium">字体风格</p>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="w-full justify-between" disabled={Boolean(taskId)}>
                                            {fontStyle}
                                            <ChevronDown className="size-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56">
                                        {SUPPORTED_FONT_STYLE.map((style) => (
                                            <DropdownMenuItem key={style} onSelect={() => setFontStyle(style)}>{style}</DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <div className="flex w-full flex-col gap-2 sm:w-40">
                                <Button
                                    className="w-full"
                                    onClick={submitTask}
                                    disabled={Boolean(taskId) || submitLoading || pages.length === 0}
                                >
                                    <Upload className="size-4" />
                                    开始翻译
                                </Button>
                                <Button variant="outline" className="w-full" disabled={!hasCompletedResults(pages)} onClick={() => void onDownload(pages)}>
                                    <Download className="size-4" />
                                    下载全部
                                </Button>
                            </div>
                        </div>

                        <p className="text-center text-xs text-muted-foreground">
                            ✦ AI 自动识别日语、中文、英语、韩语等多种语言
                        </p>
                    </>
                )}
            </div>
        </section>
    );
}
