"use client";

import { useEffect, useRef, useState } from "react";
import {
    ChevronDown,
    Download,
    Languages,
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
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { ThumbNail } from "@/components/v2/thumbnail";
import { MangaPage } from "@/types/web/manga-page";
import { ImagePreview } from "@/components/v2/image-preview";
import { UploadZone } from "@/components/v2/upload-zone";
import { TranslationConfig, Translator } from "@/types/do/translation-config";
import { toast } from "sonner";
import { ApiGetTranslationTaskLiteResponse } from "@/types/api/translation-task";
import { TASK_ENDED_STATUSES, TaskStatus } from "@/types/do/translation-task";

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

/**
 * TODO fontstyle 没有使用. 
 * TODO 根据srclang, tarlang 决定翻译方向
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
            inpainter: "lama_mpe",
        },
        ocr: {
            ocr: "48px",
            // 目前算法对目标语言=chs，cht，jp，会根据原文方向渲染翻译文字方向，这要求不能开启'use_mocr_merge'
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
    const [pages, setPages] = useState<MangaPage[]>([]);
    const pagesRef = useRef<MangaPage[]>([]);
    const [previewIndex, setPreviewIndex] = useState<number | null>(null);
    const [targetLang, setTargetLang] = useState<{ code: string, label: string; }>(SUPPORTED_LANGS[0]);
    const [translateMode, setTranslateMode] = useState<string>(SUPPORTED_MODE[0]);
    const [fontStyle, setFontStyle] = useState<string>(SUPPORTED_FONT_STYLE[0]);
    const [submitLoading, setSubmitLoading] = useState<boolean>(false);
    const [retryLoading, setRetryLoading] = useState<boolean>(false);
    const [polling, setPolling] = useState<boolean>(false);
    const pollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [taskId, setTaskId] = useState<string | null>(null);
    const [taskStatus, setTaskStatus] = useState<TaskStatus | null>(null);
    const [showTranslated, setShowTranslated] = useState(true);
    const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

    // 选择图片
    const onFilesSelected = (files: File[]): void => {
        setPages((prev) => {
            const next = [...prev];
            const seen = new Set(prev.map(p => p.name));
            for (const file of files) {
                if (seen.has(file.name)) {
                    continue;
                }
                // 添加上限
                if (next.length > 20) {
                    break;
                }
                seen.add(file.name);
                next.push({
                    name: file.name,
                    originalFile: file,
                    originalUrl: URL.createObjectURL(file),
                    originalSize: formatFileSize(file.size),
                });
            }
            return next;
        });
    };

    const revokeAllObjectUrls = () => {
        for (const page of pagesRef.current) {
            URL.revokeObjectURL(page.originalUrl);
        }
    };

    const clearPollTimeout = (): void => {
        if (pollTimeoutRef.current !== null) {
            clearTimeout(pollTimeoutRef.current);
            pollTimeoutRef.current = null;
        }
    };

    // 为了释放object url，需要保存pages引用
    useEffect(() => {
        pagesRef.current = pages;
    }, [pages]);

    // 退出页面，清理资源
    useEffect(() => {
        return () => {
            revokeAllObjectUrls();
            clearPollTimeout();
        };
    }, []);

    // 重置工作区状态
    const resetWorkspace = (): void => {
        revokeAllObjectUrls();
        setPages([]);
        setPreviewIndex(null);
        setTaskId(null);
        setTaskStatus(null);
        setSubmitLoading(false);
        setRetryLoading(false);
        setPolling(false);
        setShowTranslated(true);
        clearPollTimeout();
    };

    const onClearAll = (): void => {
        if (taskId && !isTaskEnded(taskStatus)) {
            setClearConfirmOpen(true);
        } else {
            resetWorkspace();
        }
    };

    // 删除单张图片
    const removePage = (name: string): void => {
        setPages((prev) => {
            const targetIndex = prev.findIndex((p) => p.name === name);
            if (targetIndex < 0) return prev;

            URL.revokeObjectURL(prev[targetIndex].originalUrl);
            const next = prev.filter((p) => p.name !== name);

            setPreviewIndex((current) => {
                if (current === null) return null;
                if (next.length === 0) return null;
                if (targetIndex < current) return current - 1;
                if (targetIndex === current) return Math.min(current, next.length - 1);
                return current;
            });

            if (next.length === 0) {
                setTaskId(null);
                setTaskStatus(null);
                setPolling(false);
                setSubmitLoading(false);
                setRetryLoading(false);
                clearPollTimeout();
            }

            return next;
        });
    };

    // 提交翻译
    const submitTask = async () => {
        if (pages.length === 0 || submitLoading || polling) {
            return;
        }
        setSubmitLoading(true);
        try {
            const conf = buildTranslationConfig(targetLang, translateMode, fontStyle);
            setPages((prev) => prev.map((value) => {
                return {
                    ...value,
                    status: "pending",
                };
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
            setTaskId(data.taskId!);
            setTaskStatus("pending");
            setPolling(true);
        } catch (err) {
            const errMsg = err instanceof Error ? err.message : "Unknown Error";
            toast.error(errMsg);
            console.error(errMsg);
            setPages((prev) => prev.map((value) => {
                if (value.status === "completed") {
                    return value;
                } else {
                    return {
                        ...value,
                        status: "failed",
                    };
                }
            }));
        } finally {
            setSubmitLoading(false);
        }
    };

    /**
     * TODO 如果重试的时候变换了config无法生效，retry默认使用提交时的task配置
     */
    // 重试翻译
    const retryTaskImages = async (taskId: string | null, imageIds: string[]) => {
        if (!taskId || imageIds.length === 0 || retryLoading) {
            return;
        }
        setRetryLoading(true);
        const retryIdSet = new Set(imageIds);
        setPages((prev) => prev.map((value) => {
            return value.imageId && retryIdSet.has(value.imageId) ? {
                ...value,
                status: "pending",
            } : value;
        }));
        try {
            const response = await fetch("/api/translate/retry", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ taskId, imageIds })
            });
            if (!response.ok) {
                const { error } = await response.json() as { error: string; };
                throw new Error(error);
            }
            setPolling(true);
            setTaskStatus("pending");
        } catch (err) {
            const errMsg = err instanceof Error ? err.message : "Unknown Error";
            toast.error(errMsg);
            console.error(errMsg);
            setPages((prev) => prev.map((value) => {
                return value.imageId && retryIdSet.has(value.imageId) ? {
                    ...value,
                    status: "failed",
                } : value;
            }));
        } finally {
            setRetryLoading(false);
        }
    };

    // 串行轮询：上一次结束后再调度下一次，避免 setInterval 叠请求
    useEffect(() => {
        if (!taskId || !polling) {
            return;
        }

        // 当开启新任务，查之前任务的fetch需要中止，防止造成写竞态
        const abortController = new AbortController();
        let cancelled = false;
        const startedAt = Date.now();
        const POLL_INTERVAL_MS = 1000;

        const scheduleNext = () => {
            if (cancelled) return;
            clearPollTimeout();
            pollTimeoutRef.current = setTimeout(() => {
                void poll();
            }, POLL_INTERVAL_MS);
        };

        const poll = async () => {
            if (cancelled) return;
            // limit 5min
            if (Date.now() - startedAt > 5 * 60 * 1000) {
                clearPollTimeout();
                setPolling(false);
                toast.error("翻译超时，请重试");
                console.error("Translation timeout");
                // 标记剩余图片失败
                setPages((prev) => prev.map((page) => {
                    return page.status !== "completed" ? { ...page, status: "stalled" } : page;
                }));
                return;
            }
            try {
                const response = await fetch(`/api/translate/task-lite/${taskId}`, { signal: abortController.signal });
                const data = await response.json() as { error?: string; } & ApiGetTranslationTaskLiteResponse;
                if (!response.ok) {
                    throw new Error(data.error);
                }
                setTaskStatus(data.status);
                setPages((prev) => {
                    return prev.map((page) => {
                        // 需要保证前后端图片顺序一致
                        const img = data.images.find((value) => value.filename === page.name);
                        // 跳过已完成图片，避免resultUrl因签名不同，导致重复下载资源
                        if (!img || page.status === "completed") return page;
                        return {
                            ...page,
                            status: img.status,
                            resultUrl: img.resultImageUrl,
                            imageId: img.id,
                        };
                    });
                });
                // 任务结束
                if (isTaskEnded(data.status)) {
                    clearPollTimeout();
                    setPolling(false);
                    return;
                }
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
    }, [taskId, polling]);

    return (
        <section id="tool" className="scroll-mt-16 border-t bg-muted/40 py-12">
            <div className="mx-auto max-w-5xl space-y-4 px-4">
                <UploadZone uploaded={pages.length} maxPages={20} onFilesSelected={onFilesSelected} />

                {pages.length > 0 && (
                    <>
                        <div className="space-y-2">
                            <div className="flex items-center justify-end gap-3">
                                {hasCompletedResults(pages) && (
                                    <div className="flex items-center gap-1.5">
                                        <Languages
                                            className={`size-3.5 ${showTranslated ? "text-foreground" : "text-muted-foreground"}`}
                                            aria-hidden
                                        />
                                        <Switch
                                            checked={showTranslated}
                                            onCheckedChange={setShowTranslated}
                                            aria-label={showTranslated ? "查看翻译图" : "查看原图"}
                                        />
                                    </div>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-muted-foreground"
                                    onClick={onClearAll}
                                >
                                    <X className="size-3" />
                                    全部清除
                                </Button>
                            </div>
                            <div className="grid grid-cols-5 items-start gap-3">
                                {pages.map((page, index) => (
                                    <ThumbNail
                                        key={page.name}
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
                                        <AlertDialogAction onClick={resetWorkspace}>
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
                                        <Button variant="outline" className="w-full justify-between">
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
                                        <Button variant="outline" className="w-full justify-between">
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
                                        <Button variant="outline" className="w-full justify-between">
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
                                <Button className="w-full" onClick={submitTask}>
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
