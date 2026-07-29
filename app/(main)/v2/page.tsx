"use client";

import { useEffect, useRef, useState } from "react";
import {
    ChevronDown,
    Download,
    Languages,
    Moon,
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { ThumbNail } from "@/components/v2/thumbnail";
import { MangaPage } from "@/types/dto/manga-page";
import { ImagePreview } from "@/components/v2/image-preview";
import { UploadZone } from "@/components/v2/upload-zone";
import { TranslationConfig, Translator } from "@/types/do/translation-config";
import { toast } from "sonner";
import { ApiGetTranslationTaskResponse } from "@/types/api/translation-task";
import { TASK_ENDED_STATUSES, TaskStatus } from "@/types/do/translation-task";
import { translationCacheService } from "@/biz/services/translation-cache/translation-cache-service";
import { packZip } from "@/biz/utils/pack";

const PLACEHOLDER_HERO = "https://placehold.co/1200x480/e5e5e5/a3a3a3?text=Hero";
const PLACEHOLDER_WIDE = "https://placehold.co/800x400/e5e5e5/a3a3a3?text=Before+%2F+After";
const PLACEHOLDER_BLOG = "https://placehold.co/400x240/e5e5e5/a3a3a3?text=Blog";
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

const FAQ_ITEMS = [
    {
        q: "可以翻译日漫吗？",
        a: "可以。支持日语漫画自动识别与翻译，保留气泡排版与画风。",
    },
    {
        q: "可以翻译韩漫吗？",
        a: "可以。支持韩语竖向阅读漫画，并适配常见条漫版式。",
    },
    {
        q: "可以翻译中漫吗？",
        a: "可以。支持简体/繁体中文漫画的跨语言翻译。",
    },
    {
        q: "使用什么 AI？",
        a: "采用面向漫画场景优化的多模型流水线，覆盖文字检测、翻译与重绘。",
    },
    {
        q: "翻译需要多久？",
        a: "单页通常数秒到数十秒，具体取决于图片尺寸与队列负载。",
    },
    {
        q: "支持哪些格式？",
        a: "JPG、PNG、WebP、GIF、AVIF、HEIC、PDF、EPUB、CBZ、ZIP。",
    },
    {
        q: "页数会过期吗？",
        a: "按量购买的页数永不过期；订阅页数按账单周期刷新。",
    },
    {
        q: "支持哪些语言？",
        a: "支持 20+ 语言，包括日、中、英、韩等常见漫画语言。",
    },
    {
        q: "数据安全吗？",
        a: "上传内容仅用于翻译处理，不会用于公开训练或对外分享。",
    },
    {
        q: "如何退款？",
        a: "未使用的付费额度可按政策申请退款，详情见服务条款。",
    },
    {
        q: "有浏览器插件吗？",
        a: "浏览器插件即将推出，当前请使用网页版上传翻译。",
    },
];

const PAY_AS_NEEDED = [
    {
        name: "Basic",
        price: "$0",
        desc: "试用 · 无需账户",
        featured: false,
    },
    {
        name: "Pro",
        price: "$0.020/page",
        desc: "页数包 · 永不过期",
        featured: true,
    },
    {
        name: "Ultra",
        price: "$0.018/page",
        desc: "大额页数包",
        featured: false,
    },
];

const SUBSCRIPTION = [
    {
        name: "Basic",
        price: "$0.015/page",
        desc: "入门订阅",
        featured: false,
    },
    {
        name: "Pro",
        price: "$0.013/page",
        desc: "高频用户",
        featured: true,
    },
    {
        name: "Ultra",
        price: "$0.010/page",
        desc: "重度订阅",
        featured: false,
    },
];

const BLOG_POSTS = [
    { title: "如何用 AI 翻译日漫并保留原作风格", date: "2026-06-12" },
    { title: "漫画气泡检测与重绘原理简介", date: "2026-05-28" },
    { title: "多语言漫画本地化的常见坑", date: "2026-05-10" },
];

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

async function onDownload(pages: MangaPage[]) {
    // 缓存图在本地（blob URL），远端图是签名 URL；统一在浏览器 fetch，服务端拿不到本地缓存
    const completed = pages.filter(
        (page) => page.status === "completed" && page.resultUrl,
    );
    if (completed.length === 0) {
        return;
    }
    try {
        const items = await Promise.all(
            completed.map(async (page) => {
                const response = await fetch(page.resultUrl!);
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${page.name}`);
                }
                return { fileName: page.name, blob: await response.blob() };
            }),
        );

        let fileName: string;
        let blob: Blob;
        if (items.length === 1) {
            fileName = items[0].fileName;
            blob = items[0].blob;
        } else {
            const zipped = await packZip(items);
            const d = new Date();
            const pad = (n: number) => String(n).padStart(2, "0");
            fileName = `task-${[
                d.getFullYear(),
                pad(d.getMonth() + 1),
                pad(d.getDate()),
                pad(d.getHours()),
                pad(d.getMinutes()),
                pad(d.getSeconds()),
            ].join("-")}.zip`;
            blob = new Blob([zipped], { type: "application/zip" });
        }

        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = fileName;
        anchor.click();
        URL.revokeObjectURL(url);
    } catch (err) {
        const errMsg = err instanceof Error ? err.message : "Download failed";
        toast.error(errMsg);
        console.error(errMsg);
    }
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

export default function V2HomePage() {
    const [pricingTab, setPricingTab] = useState<"pay" | "sub">("sub");
    const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
    const plans = pricingTab === "pay" ? PAY_AS_NEEDED : SUBSCRIPTION;

    const [pages, setPages] = useState<MangaPage[]>([]);
    const pagesRef = useRef<MangaPage[]>([]);
    const [previewIndex, setPreviewIndex] = useState<number | null>(null);
    const [targetLang, setTargetLang] = useState<{ code: string, label: string; }>(SUPPORTED_LANGS[0]);
    const [translateMode, setTranslateMode] = useState<string>(SUPPORTED_MODE[0]);
    const [fontStyle, setFontStyle] = useState<string>(SUPPORTED_FONT_STYLE[0]);
    const [submitLoading, setSubmitLoading] = useState<boolean>(false);
    const [retryLoading, setRetryLoading] = useState<boolean>(false);
    const [polling, setPolling] = useState<boolean>(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [taskId, setTaskId] = useState<string | null>(null);
    const [taskStatus, setTaskStatus] = useState<TaskStatus | null>(null);
    const [showTranslated, setShowTranslated] = useState(true);
    const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
    const submitConfigRef = useRef<TranslationConfig | null>(null);

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
                    cached: false,
                });
            }
            return next;
        });
    };

    const revokeAllObjectUrls = () => {
        for (const page of pagesRef.current) {
            URL.revokeObjectURL(page.originalUrl);
            if (page.cached && page.resultUrl) {
                URL.revokeObjectURL(page.resultUrl);
            }
        }
    };

    const clearIntervalRef = (): void => {
        if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
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
            clearIntervalRef();
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
        clearIntervalRef();
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
            if (prev[targetIndex].cached && prev[targetIndex].resultUrl) {
                URL.revokeObjectURL(prev[targetIndex].resultUrl);
            }
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
                clearIntervalRef();
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
            submitConfigRef.current = conf;
            // 检查缓存
            const { cached, uncached } = await translationCacheService.partitionPagesByCacheV2(pages, conf);
            // 已缓存的图片补充翻译结果，其他待翻译图片pending
            setPages((prev) => prev.map((value) => {
                const target = cached.find((cachePage) => cachePage.mangaPage.name === value.name);
                if (target) {
                    return { ...value, status: "completed", resultUrl: URL.createObjectURL(target.cacheResultBlob), cached: true };
                } else {
                    return { ...value, status: "pending" };
                }
            }));
            if (uncached.length === 0) {
                return;
            }

            // 无缓存图片提交翻译
            const formData = new FormData();
            for (const page of uncached) {
                formData.append("images", page.mangaPage.originalFile);
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
                cached: false,
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

    // 轮询任务 
    // TODO 历史页
    useEffect(() => {
        if (!taskId || !polling) {
            return;
        }

        // 当开启新任务，查之前任务的fetch需要中止，防止造成写竞态
        const abortController = new AbortController();

        const startedAt = Date.now();
        const poll = async () => {
            // 轮询 limit 5min
            if (Date.now() - startedAt > 5 * 60 * 1000) {
                clearIntervalRef();
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
                const response = await fetch(`/api/translate/task/${taskId}`, { signal: abortController.signal });
                const data = await response.json() as { error?: string; } & ApiGetTranslationTaskResponse;
                if (!response.ok) {
                    throw new Error(data.error);
                }
                setTaskStatus(data.status);
                setPages((prev) => {
                    return prev.map((page) => {
                        // 缓存图片数据已完整，跳过
                        if (page.cached === true) {
                            return page;
                        }
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
                    clearIntervalRef();
                    setPolling(false);
                    // 写入缓存
                    const conf = submitConfigRef.current;
                    if (conf) {
                        for (const img of data.images) {
                            const targetPage = pagesRef.current.find((value) => value.name === img.filename);
                            if (img.status !== "completed" || !img.resultImageUrl || !targetPage) {
                                continue;
                            }
                            translationCacheService.saveFromResultUrl(targetPage.originalFile, conf, img.resultImageUrl);
                        }
                    }
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
    }, [taskId, polling]);

    return (
        <div className="min-h-screen bg-background">
            {/* 1 · Header */}
            <header className="sticky top-0 z-50 border-b bg-background">
                <div className="mx-auto flex h-14 max-w-5xl items-center gap-2 px-4">
                    <a href="/v2" className="shrink-0 text-sm font-semibold">
                        AI Manga Translator
                    </a>
                    <nav className="ml-4 hidden items-center gap-1 md:flex">
                        <Button variant="ghost" size="sm" asChild>
                            <a href="#tool">Manga Translate</a>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                            <a href="#pricing">Pricing</a>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                            <a href="#faq">FAQ</a>
                        </Button>
                        <Button variant="ghost" size="sm">
                            Discord
                        </Button>
                    </nav>
                    <div className="ml-auto flex items-center gap-2">
                        <Badge variant="secondary">Credits · 200</Badge>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    Lang
                                    <ChevronDown className="size-3" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>中文</DropdownMenuItem>
                                <DropdownMenuItem>English</DropdownMenuItem>
                                <DropdownMenuItem>日本語</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button variant="ghost" size="icon" aria-label="主题">
                            <Moon className="size-4" />
                        </Button>
                        <Button size="sm">Login</Button>
                    </div>
                </div>
            </header>

            <main>
                {/* 2 · Hero */}
                <section className="relative flex min-h-[50vh] items-center overflow-hidden">
                    <img
                        src={PLACEHOLDER_HERO}
                        alt=""
                        aria-hidden
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-background/60" />
                    <div className="relative mx-auto w-full max-w-5xl px-4 py-16 text-center">
                        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                            AI 漫画翻译，一键完成
                        </h1>
                        <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                            自动识别气泡文字，翻译并重绘到原图。支持日漫、韩漫、中漫，保留原作版式与字体风格。
                        </p>
                        <div className="mt-8 grid grid-cols-3 gap-4 sm:mx-auto sm:max-w-lg">
                            <div>
                                <p className="text-xl font-semibold">100,000+</p>
                                <p className="text-sm text-muted-foreground">页</p>
                            </div>
                            <div>
                                <p className="text-xl font-semibold">20+</p>
                                <p className="text-sm text-muted-foreground">语言</p>
                            </div>
                            <div>
                                <p className="text-xl font-semibold">99%</p>
                                <p className="text-sm text-muted-foreground">准确率</p>
                            </div>
                        </div>
                        <div className="mt-8 flex flex-wrap justify-center gap-3">
                            <Button asChild>
                                <a href="#tool">免费试用</a>
                            </Button>
                            <Button variant="outline" asChild>
                                <a href="#how">使用流程</a>
                            </Button>
                        </div>
                    </div>
                </section>

                {/* 3 · Translate Tool */}
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

                {/* 4 · 使用流程 */}
                <section id="how" className="scroll-mt-16 py-16">
                    <div className="mx-auto max-w-5xl px-4">
                        <h2 className="mb-8 text-center text-2xl font-semibold">使用流程</h2>
                        <div className="grid gap-4 md:grid-cols-3">
                            {[
                                { step: "①", title: "上传漫画", desc: "拖放图片或文档，支持批量上传。" },
                                { step: "②", title: "选择语言", desc: "选择目标语言与字体风格。" },
                                { step: "③", title: "查看与下载", desc: "预览结果并下载译后漫画。" },
                            ].map((item) => (
                                <Card key={item.title}>
                                    <CardHeader>
                                        <CardDescription>{item.step}</CardDescription>
                                        <CardTitle>{item.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 5 · 翻译效果展示 */}
                <section className="border-t bg-muted/40 py-16">
                    <div className="mx-auto max-w-5xl px-4 text-center">
                        <h2 className="mb-2 text-2xl font-semibold">翻译效果展示</h2>
                        <p className="mb-6 text-sm text-muted-foreground">
                            拖动滑块对比原图 / 翻译
                        </p>
                        <div className="overflow-hidden rounded-xl border bg-background">
                            <img
                                src={PLACEHOLDER_WIDE}
                                alt="翻译前后对比"
                                className="mx-auto h-auto w-full max-w-3xl object-cover"
                            />
                        </div>
                    </div>
                </section>

                {/* 6 · 价格 */}
                <section id="pricing" className="scroll-mt-16 py-16">
                    <div className="mx-auto max-w-5xl px-4">
                        <h2 className="mb-6 text-center text-2xl font-semibold">价格</h2>
                        <div className="mb-8 flex justify-center gap-2">
                            <Button
                                variant={pricingTab === "pay" ? "default" : "outline"}
                                onClick={() => setPricingTab("pay")}
                            >
                                Pay As Needed
                            </Button>
                            <Button
                                variant={pricingTab === "sub" ? "default" : "outline"}
                                onClick={() => setPricingTab("sub")}
                            >
                                Subscription
                            </Button>
                        </div>
                        <div className="grid gap-4 md:grid-cols-3">
                            {plans.map((plan) => (
                                <Card
                                    key={plan.name}
                                    className={plan.featured ? "border-2 border-foreground" : undefined}
                                >
                                    <CardHeader className="text-center">
                                        <CardTitle className="flex items-center justify-center gap-2">
                                            {plan.name}
                                            {plan.featured && <Badge>★</Badge>}
                                        </CardTitle>
                                        <p className="text-2xl font-bold">{plan.price}</p>
                                        <CardDescription>{plan.desc}</CardDescription>
                                    </CardHeader>
                                    <CardFooter>
                                        <Button
                                            className="w-full"
                                            variant={plan.featured ? "default" : "outline"}
                                        >
                                            Get Started
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 7 · FAQ */}
                <section id="faq" className="scroll-mt-16 border-t bg-muted/40 py-16">
                    <div className="mx-auto max-w-2xl px-4">
                        <h2 className="mb-8 text-center text-2xl font-semibold">常见问题</h2>
                        <div className="divide-y rounded-xl border bg-background">
                            {FAQ_ITEMS.map((item, index) => (
                                <div key={item.q}>
                                    <Button
                                        variant="ghost"
                                        className="h-auto w-full justify-between rounded-none px-4 py-4 text-left font-normal"
                                        onClick={() =>
                                            setExpandedFaq(expandedFaq === index ? null : index)
                                        }
                                    >
                                        <span>{item.q}</span>
                                        <Plus
                                            className={`size-4 shrink-0 transition-transform ${expandedFaq === index ? "rotate-45" : ""
                                                }`}
                                        />
                                    </Button>
                                    {expandedFaq === index && (
                                        <p className="px-4 pb-4 text-sm text-muted-foreground">
                                            {item.a}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 8 · Blog */}
                <section className="py-16">
                    <div className="mx-auto max-w-5xl px-4">
                        <h2 className="mb-8 text-center text-2xl font-semibold">最新博客</h2>
                        <div className="grid gap-4 md:grid-cols-3">
                            {BLOG_POSTS.map((post) => (
                                <Card key={post.title} className="overflow-hidden py-0">
                                    <img
                                        src={PLACEHOLDER_BLOG}
                                        alt={post.title}
                                        className="aspect-[5/3] w-full object-cover"
                                    />
                                    <CardHeader>
                                        <CardTitle className="text-base">{post.title}</CardTitle>
                                        <CardDescription>{post.date}</CardDescription>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                        <p className="mt-6 text-center">
                            <Button variant="link">查看所有文章 →</Button>
                        </p>
                    </div>
                </section>
            </main>

            {/* 9 · Footer */}
            <footer className="border-t py-10">
                <div className="mx-auto grid max-w-5xl gap-8 px-4 sm:grid-cols-3">
                    <div>
                        <p className="font-semibold">AI Manga Translator</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                            © 2026 All rights reserved.
                        </p>
                    </div>
                    <div className="flex flex-col gap-1 text-sm">
                        <Button variant="link" className="h-auto justify-start px-0">
                            Privacy
                        </Button>
                        <Button variant="link" className="h-auto justify-start px-0">
                            Terms
                        </Button>
                        <Button variant="link" className="h-auto justify-start px-0">
                            Support
                        </Button>
                    </div>
                    <div className="flex gap-2 sm:justify-end">
                        <Button variant="outline" size="icon" aria-label="Discord">
                            D
                        </Button>
                        <Button variant="outline" size="icon" aria-label="Twitter">
                            X
                        </Button>
                    </div>
                </div>
            </footer>
        </div>
    );
}
