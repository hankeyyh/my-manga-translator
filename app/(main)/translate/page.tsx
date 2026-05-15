"use client";

import { Manrope, Inter } from "next/font/google";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    CheckCircle2,
    ChevronDown,
    Download,
    HelpCircle,
    History,
    Layers,
    Loader2,
    Minus,
    Phone,
    Plus,
    Settings,
    Wand2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteHeader } from "@/components/site-header";
import { TranslationConfig } from "@/lib/services/translate/translation-types";
import { cn } from "@/components/utils";
import { TaskStatus as TaskState } from "@/lib/services/translate/translation-types";

const manrope = Manrope({
    subsets: ["latin"],
    weight: ["200", "400", "600", "800"],
    variable: "--font-manrope",
});

const inter = Inter({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600"],
    variable: "--font-inter",
});

const ENGINES = ["GPT-4o Vision", "GPT-4o mini", "Claude 3.5 Sonnet"] as const;
const STYLES = ["WildWords BB", "Standard", "Artistic"] as const;
const POLL_INTERVAL_MS = 5000;
const POLL_MAX_WAIT_MS = 5 * 60 * 1000;

interface ResultImage {
    id: string;
    url: string;
}

interface HistoryImage extends ResultImage {
    taskId: string;
    imageIndex: number;
    createdAt?: string;
}

interface TaskStatusResponse {
    id: string;
    status: TaskState;
    total_images: number;
    completed_images: number;
    failed_images: number;
    progress: number;
    created_at: string;
    completed_at?: string;
}

interface LocalPage {
    id: string;
    label: string;
    file: File;
    previewUrl: string;
}

export default function TranslateWorkbench() {
    const [zoom, setZoom] = useState(100);
    const [showSettings, setShowSettings] = useState(false);
    const [engine, setEngine] = useState<string>(ENGINES[0]);
    const [sourceLang, setSourceLang] = useState("JPN");
    const [targetLang, setTargetLang] = useState("ENG");
    const [style, setStyle] = useState<string>(STYLES[0]);
    const [activeTab, setActiveTab] = useState(0);
    /** 左侧竖条：0 设置 1 历史 2 图层 3 魔法棒 4 帮助 */
    const [leftTool, setLeftTool] = useState(0);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const pagesRef = useRef<LocalPage[]>([]);
    const [pages, setPages] = useState<LocalPage[]>([]);
    const [taskId, setTaskId] = useState<string | null>(null);
    const [taskStatus, setTaskStatus] = useState<TaskStatusResponse | null>(null);
    const [resultImages, setResultImages] = useState<ResultImage[]>([]);
    const [historyImages, setHistoryImages] = useState<HistoryImage[]>([]);
    const [loadingResult, setLoadingResult] = useState(false);
    const [resultError, setResultError] = useState<string | null>(null);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState<string | null>(null);
    const [polling, setPolling] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const zoomIn = () => setZoom((z) => Math.min(z + 25, 200));
    const zoomOut = () => setZoom((z) => Math.max(z - 25, 50));

    const openFilePicker = () => fileInputRef.current?.click();

    const onPickFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
        const picked = Array.from(event.target.files ?? []);
        if (picked.length === 0) {
            return;
        }

        setPages((prev) => {
            const next = [...prev];
            for (const file of picked) {
                next.push({
                    id: crypto.randomUUID(),
                    label: `PAGE ${String(next.length + 1).padStart(2, "0")}`,
                    file,
                    previewUrl: URL.createObjectURL(file),
                });
            }
            return next;
        });

        event.target.value = "";
    };

    useEffect(() => {
        pagesRef.current = pages;
    }, [pages]);

    useEffect(() => {
        return () => {
            for (const page of pagesRef.current) {
                URL.revokeObjectURL(page.previewUrl);
            }
        };
    }, []);

    const selectedPage = pages[activeTab] ?? null;

    const translatedSrc = useMemo(() => {
        if (selectedPage && resultImages[activeTab]) {
            return resultImages[activeTab].url;
        }
        return null;
    }, [activeTab, resultImages, selectedPage]);

    const fetchResultImages = async (id: string) => {
        setLoadingResult(true);
        setResultError(null);

        try {
            const response = await fetch(`/api/translate/result/${id}`);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch result images");
            }
            setResultImages(data.resultImages ?? []);
        } catch (error) {
            setResultError(error instanceof Error ? error.message : "Unknown error");
        } finally {
            setLoadingResult(false);
        }
    };

    const fetchHistoryImages = async () => {
        setHistoryLoading(true);
        setHistoryError(null);

        try {
            const response = await fetch("/api/translate/history");
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch translation history");
            }
            setHistoryImages(data.images ?? []);
        } catch (error) {
            setHistoryError(error instanceof Error ? error.message : "Unknown error");
        } finally {
            setHistoryLoading(false);
        }
    };

    const submitTask = async () => {
        if (pages.length === 0 || submitLoading) {
            return;
        }

        setSubmitLoading(true);
        setSubmitError(null);
        setResultError(null);
        setResultImages([]);
        setTaskStatus(null);
        setTaskId(null);
        setPolling(false);

        try {
            const formData = new FormData();
            for (const page of pages) {
                formData.append("images", page.file);
            }
            const config: TranslationConfig = {
                translator: {
                    translator: "youdao",
                    target_lang: targetLang,
                },
            };
            formData.append("config", JSON.stringify(config));

            const response = await fetch("/api/translate/submit", {
                method: "POST",
                body: formData,
            });
            const data = await response.json();
            if (!response.ok || !data.taskId) {
                throw new Error(data.error || "Failed to submit translation");
            }

            setTaskId(data.taskId);
            setPolling(true);
            setActiveTab(0);
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : "Unknown error");
        } finally {
            setSubmitLoading(false);
        }
    };

    useEffect(() => {
        if (!polling || !taskId) {
            return;
        }

        const startedAt = Date.now();
        const interval = setInterval(async () => {
            if (Date.now() - startedAt >= POLL_MAX_WAIT_MS) {
                setPolling(false);
                setResultError("轮询超时（超过 5 分钟），请稍后重试。");
                clearInterval(interval);
                return;
            }

            try {
                const response = await fetch(`/api/translate/task/${taskId}`);
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || "Failed to poll task status");
                }
                setTaskStatus(data);

                if (data.status === "completed") {
                    setPolling(false);
                    clearInterval(interval);
                    await fetchResultImages(taskId);
                    await fetchHistoryImages();
                } else if (data.status === "failed") {
                    clearInterval(interval);
                    setPolling(false);
                }
            } catch (error) {
                setPolling(false);
                clearInterval(interval);
                setResultError(error instanceof Error ? error.message : "Unknown error");
            }
        }, POLL_INTERVAL_MS);

        return () => clearInterval(interval);
    }, [polling, taskId]);

    useEffect(() => {
        void fetchHistoryImages();
    }, []);

    const thumbnails = useMemo(() => {
        return pages.map((page, index) => {
            const hasResult = Boolean(resultImages[index]);
            const isProcessing = polling || submitLoading;
            return {
                id: page.id,
                label: page.label,
                status: hasResult
                    ? ("completed" as const)
                    : isProcessing
                        ? ("processing" as const)
                        : ("active" as const),
                progress: taskStatus?.progress,
                image: page.previewUrl,
            };
        });
    }, [pages, resultImages, polling, submitLoading, taskStatus?.progress]);

    const isThumbSelected = (index: number) => activeTab === index;

    return (
        <div
            className={cn(
                manrope.variable,
                inter.variable,
                "font-body text-[#2d3337]",
            )}
        >
            <main className="flex min-h-screen flex-col bg-[#f8f9fb] pt-16">
                <SiteHeader />

                <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-6">
                    {/* 结果展示区 */}
                    <div className="relative flex h-[75vh] min-h-[420px] shrink-0 flex-col overflow-hidden rounded-3xl border border-white/40 bg-[#f1f4f7] shadow-sm">
                        <div
                            className={cn(
                                "absolute left-5 top-1/2 z-20 flex -translate-y-1/2 items-start gap-0",
                            )}
                        >
                            <nav
                                aria-label="Workbench tools"
                                className="flex flex-col gap-1 rounded-[28px] border border-[#eef0f3] bg-white p-2 shadow-[0_4px_20px_rgba(15,23,42,0.08)]"
                            >
                                <Button
                                    className={cn(
                                        "h-11 w-11 shrink-0 rounded-xl",
                                        leftTool === 0
                                            ? "bg-[#0053dd] text-white shadow-sm hover:bg-[#0053dd]/90"
                                            : "text-[#5F6368] hover:bg-[#f1f3f5]",
                                    )}
                                    onClick={() => {
                                        setLeftTool(0);
                                        setShowSettings((s) => !s);
                                    }}
                                    size="icon"
                                    title="设置"
                                    type="button"
                                    variant="ghost"
                                >
                                    <Settings className="h-[22px] w-[22px]" />
                                </Button>
                                <Button
                                    className={cn(
                                        "h-11 w-11 shrink-0 rounded-xl",
                                        leftTool === 1
                                            ? "bg-[#0053dd] text-white shadow-sm hover:bg-[#0053dd]/90"
                                            : "text-[#5F6368] hover:bg-[#f1f3f5]",
                                    )}
                                    onClick={() => {
                                        setLeftTool(1);
                                        setShowSettings(false);
                                    }}
                                    size="icon"
                                    title="历史"
                                    type="button"
                                    variant="ghost"
                                >
                                    <History className="h-[22px] w-[22px]" strokeWidth={1.75} />
                                </Button>
                                <Button
                                    className={cn(
                                        "h-11 w-11 shrink-0 rounded-xl",
                                        leftTool === 2
                                            ? "bg-[#0053dd] text-white shadow-sm hover:bg-[#0053dd]/90"
                                            : "text-[#5F6368] hover:bg-[#f1f3f5]",
                                    )}
                                    onClick={() => {
                                        setLeftTool(2);
                                        setShowSettings(false);
                                    }}
                                    size="icon"
                                    title="图层"
                                    type="button"
                                    variant="ghost"
                                >
                                    <Layers className="h-[22px] w-[22px]" strokeWidth={1.75} />
                                </Button>
                                <Button
                                    className={cn(
                                        "h-11 w-11 shrink-0 rounded-xl",
                                        leftTool === 3
                                            ? "bg-[#0053dd] text-white shadow-sm hover:bg-[#0053dd]/90"
                                            : "text-[#5F6368] hover:bg-[#f1f3f5]",
                                    )}
                                    onClick={() => {
                                        setLeftTool(3);
                                        setShowSettings(false);
                                    }}
                                    size="icon"
                                    title="魔法 / 自动"
                                    type="button"
                                    variant="ghost"
                                >
                                    <Wand2 className="h-[22px] w-[22px]" strokeWidth={1.75} />
                                </Button>
                                <Button
                                    className={cn(
                                        "h-11 w-11 shrink-0 rounded-xl",
                                        leftTool === 4
                                            ? "bg-[#0053dd] text-white shadow-sm hover:bg-[#0053dd]/90"
                                            : "text-[#5F6368] hover:bg-[#f1f3f5]",
                                    )}
                                    onClick={() => {
                                        setLeftTool(4);
                                        setShowSettings(false);
                                    }}
                                    size="icon"
                                    title="帮助"
                                    type="button"
                                    variant="ghost"
                                >
                                    <HelpCircle className="h-[22px] w-[22px]" strokeWidth={1.75} />
                                </Button>
                            </nav>

                            <div
                                className={cn(
                                    "absolute left-full top-0 ml-3 min-w-[280px] transition-all duration-200 ease-out",
                                    showSettings && leftTool === 0
                                        ? "pointer-events-auto visible translate-y-0 opacity-100"
                                        : "pointer-events-none invisible -translate-y-2 opacity-0",
                                )}
                            >
                                <Card className="rounded-2xl border border-white bg-[#f8f9fb]/80 shadow-xl backdrop-blur-md">
                                    <CardContent className="flex flex-col gap-3 p-4">
                                        <div className="flex flex-col gap-0.5">
                                            <Label className="text-[10px] font-bold uppercase tracking-wider text-[#5a6064] opacity-60">
                                                Translation Engine
                                            </Label>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        className="h-auto justify-between px-0 py-0 font-headline text-sm font-bold text-[#0053dd] hover:bg-transparent hover:text-[#0053dd]"
                                                        variant="ghost"
                                                    >
                                                        {engine}
                                                        <ChevronDown className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="start" className="w-56">
                                                    <DropdownMenuLabel>Engine</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuRadioGroup
                                                        onValueChange={setEngine}
                                                        value={engine}
                                                    >
                                                        {ENGINES.map((e) => (
                                                            <DropdownMenuRadioItem key={e} value={e}>
                                                                {e}
                                                            </DropdownMenuRadioItem>
                                                        ))}
                                                    </DropdownMenuRadioGroup>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>

                                        <div className="flex gap-8 border-t border-[#dee3e7] pt-3">
                                            <div className="flex flex-col gap-0.5">
                                                <Label className="text-[10px] font-bold uppercase tracking-wider text-[#5a6064] opacity-60">
                                                    Languages
                                                </Label>
                                                <div className="flex items-center gap-2 text-sm font-bold">
                                                    <Input
                                                        className="h-8 w-12 border-[#dee3e7] bg-[#f8f9fb] px-1 text-center font-headline font-bold text-[#0053dd]"
                                                        onChange={(e) => setSourceLang(e.target.value)}
                                                        value={sourceLang}
                                                    />
                                                    <ChevronDown className="h-4 w-4 text-[#767b7f]" />
                                                    <Input
                                                        className="h-8 w-12 border-[#dee3e7] bg-[#f8f9fb] px-1 text-center font-headline font-bold text-[#0053dd]"
                                                        onChange={(e) => setTargetLang(e.target.value)}
                                                        value={targetLang}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-0.5">
                                                <Label className="text-[10px] font-bold uppercase tracking-wider text-[#5a6064] opacity-60">
                                                    Style
                                                </Label>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            className="h-8 justify-between border border-[#dee3e7] bg-[#f8f9fb] px-2 font-headline text-sm font-bold text-[#2d3337] hover:bg-[#f8f9fb]"
                                                            variant="outline"
                                                        >
                                                            {style}
                                                            <ChevronDown className="h-3 w-3 opacity-60" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="start">
                                                        {STYLES.map((s) => (
                                                            <DropdownMenuItem
                                                                key={s}
                                                                className="font-headline font-bold"
                                                                onClick={() => setStyle(s)}
                                                            >
                                                                {s}
                                                            </DropdownMenuItem>
                                                        ))}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        <div className="absolute right-4 top-4 z-10 flex items-center gap-1 rounded-lg border border-[#dee3e7] bg-white/90 px-1 py-0.5 shadow-sm backdrop-blur-sm">
                            <Button
                                className="h-8 w-8"
                                onClick={zoomOut}
                                size="icon"
                                type="button"
                                variant="ghost"
                            >
                                <Minus className="h-4 w-4" />
                            </Button>
                            <span className="min-w-[2.75rem] text-center font-headline text-xs font-bold text-[#5a6064]">
                                {zoom}%
                            </span>
                            <Button
                                className="h-8 w-8"
                                onClick={zoomIn}
                                size="icon"
                                type="button"
                                variant="ghost"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="flex min-h-0 flex-1 gap-2 overflow-hidden bg-[#ebeef1] px-4 py-8">
                            <div className="flex min-h-0 min-w-0 flex-1 justify-end">
                                <div className="flex h-full min-h-0 w-full max-w-full flex-col items-center justify-end gap-2">
                                    <span className="shrink-0 font-headline text-[10px] font-bold uppercase tracking-widest text-[#5a6064]">
                                        Original ({sourceLang})
                                    </span>
                                    <div
                                        className="relative flex min-h-0 w-full min-w-0 flex-1 items-center justify-center overflow-hidden rounded-lg bg-[#ebeef1]"
                                        style={{
                                            transform: `scale(${zoom / 100})`,
                                            transformOrigin: "right center",
                                        }}
                                    >
                                        {selectedPage?.previewUrl ? (
                                            <Image
                                                alt="Original Comic Panel"
                                                className="object-contain"
                                                fetchPriority="high"
                                                fill
                                                priority
                                                sizes="50vw"
                                                src={selectedPage.previewUrl}
                                                unoptimized
                                            />
                                        ) : null}
                                    </div>
                                </div>
                            </div>

                            <div className="flex min-h-0 min-w-0 flex-1 justify-start">
                                <div className="flex h-full min-h-0 w-full max-w-full flex-col items-center justify-start gap-2">
                                    <span className="shrink-0 font-headline text-[10px] font-bold uppercase tracking-widest text-[#0053dd]">
                                        Translated ({targetLang})
                                    </span>
                                    <div
                                        className="relative flex min-h-0 w-full min-w-0 flex-1 items-center justify-center overflow-hidden rounded-lg bg-[#ebeef1]"
                                        style={{
                                            transform: `scale(${zoom / 100})`,
                                            transformOrigin: "left center",
                                        }}
                                    >
                                        {translatedSrc ? (
                                            <Image
                                                alt="Translated Comic Panel"
                                                className="object-contain"
                                                fetchPriority="high"
                                                fill
                                                priority
                                                sizes="50vw"
                                                src={translatedSrc}
                                                unoptimized
                                            />
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 任务栏 */}
                    <div className="flex gap-4">
                        <div className="flex w-48 flex-col gap-2">
                            <Button
                                className="flex-1 justify-start gap-3 rounded-xl bg-[#0053dd] text-xs font-bold text-white hover:bg-[#0053dd]/90"
                                disabled={pages.length === 0 || submitLoading || polling}
                                onClick={submitTask}
                            >
                                {submitLoading || polling ? (
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
                                variant="outline"
                                onClick={() => { setPages([]); }}
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
                                    {taskStatus.completed_images}/{taskStatus.total_images} •{" "}
                                    {taskStatus.progress}%
                                </p>
                            )}
                        </div>

                        <div
                            className={cn(
                                "flex flex-1 gap-3 overflow-x-auto rounded-2xl bg-[#f1f4f7] p-2",
                                "[scrollbar-width:thin]",
                                "[&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#dee3e7]",
                            )}
                        >
                            {thumbnails.map((thumb, index) => (
                                <Button
                                    key={thumb.id}
                                    className={cn(
                                        "group relative flex h-full w-24 shrink-0 flex-col items-stretch justify-start gap-0 rounded-xl p-1.5 font-normal text-left shadow-none transition-all hover:bg-white hover:text-inherit focus-visible:ring-offset-0",
                                        isThumbSelected(index)
                                            ? "border-2 border-[#0053dd] bg-white"
                                            : "border border-transparent bg-white hover:border-[#dee3e7]",
                                    )}
                                    onClick={() => setActiveTab(index)}
                                    type="button"
                                    variant="ghost"
                                >
                                    <div
                                        className={cn(
                                            "relative mb-1 flex-1 overflow-hidden rounded-lg",
                                            thumb.status === "completed" &&
                                            "grayscale group-hover:grayscale-0",
                                        )}
                                    >
                                        {thumb.status === "processing" && (
                                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40">
                                                <Loader2 className="h-4 w-4 animate-spin text-white" />
                                            </div>
                                        )}
                                        <Image
                                            alt={thumb.label}
                                            className="h-full w-full object-cover"
                                            fetchPriority="low"
                                            height={96}
                                            sizes="96px"
                                            src={thumb.image}
                                            unoptimized
                                            width={96}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between px-0.5">
                                        <span
                                            className={cn(
                                                "font-headline text-[9px] font-bold uppercase",
                                                isThumbSelected(index)
                                                    ? "text-[#0053dd]"
                                                    : "text-[#5a6064]",
                                            )}
                                        >
                                            {thumb.label}
                                        </span>
                                        {thumb.status === "active" && isThumbSelected(index) && (
                                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#0053dd]" />
                                        )}
                                        {thumb.status === "completed" && (
                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        )}
                                        {thumb.status === "processing" && (
                                            <span className="font-headline text-[8px] font-bold italic text-[#5a6064]">
                                                {thumb.progress}%
                                            </span>
                                        )}
                                    </div>
                                    {thumb.status !== "active" && (
                                        <div className="pointer-events-none absolute inset-0 rounded-xl bg-[#0053dd]/5 opacity-0 transition-opacity group-hover:opacity-100" />
                                    )}
                                </Button>
                            ))}

                            <Button
                                className="group flex h-full w-24 shrink-0 flex-col gap-1 rounded-xl border-dashed border-[#dee3e7] bg-white shadow-none hover:border-[#0053dd] hover:bg-white"
                                onClick={openFilePicker}
                                type="button"
                                variant="outline"
                            >
                                <Plus className="h-5 w-5 text-[#dee3e7] transition-colors group-hover:text-[#0053dd]" />
                                <span className="font-headline text-[9px] font-bold text-[#5a6064]">
                                    Add Page
                                </span>
                            </Button>
                        </div>
                        <input
                            ref={fileInputRef}
                            accept="image/*"
                            className="hidden"
                            multiple
                            onChange={onPickFiles}
                            type="file"
                        />
                    </div>

                    {/* 翻译历史 */}
                    <div className="shrink-0 rounded-2xl bg-[#e8edf0] p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <h2 className="font-headline text-2xl font-bold text-[#2d3337]">
                                    Translation History
                                </h2>
                                <Button
                                    className="h-8 rounded-full border-[#d6dce1] bg-white px-4 text-xs font-semibold text-[#5a6064] hover:bg-white"
                                    variant="outline"
                                >
                                    Auto-delete after: 1 week
                                </Button>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    className="h-8 rounded-md border-[#d6dce1] bg-white px-4 text-xs font-semibold text-[#5a6064] hover:bg-white"
                                    variant="outline"
                                >
                                    Amount
                                </Button>
                                <Button className="h-8 rounded-md bg-[#0053dd] px-4 text-xs font-semibold text-white hover:bg-[#0053dd]/90">
                                    Bulk Download
                                </Button>
                            </div>
                        </div>

                        {historyLoading ? (
                            <div className="flex h-40 items-center justify-center rounded-xl bg-[#dfe5ea]">
                                <Loader2 className="h-5 w-5 animate-spin text-[#5a6064]" />
                            </div>
                        ) : historyError ? (
                            <p className="rounded-xl bg-[#dfe5ea] p-4 text-sm text-red-500">
                                {historyError}
                            </p>
                        ) : historyImages.length === 0 ? (
                            <p className="rounded-xl bg-[#dfe5ea] p-4 text-sm text-[#5a6064]">
                                暂无翻译历史
                            </p>
                        ) : (
                            <div
                                className={cn(
                                    "max-h-[720px] overflow-y-auto pr-1",
                                    "[scrollbar-width:thin]",
                                    "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#c9d1d8]",
                                )}
                            >
                                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                                    {historyImages.map((item, index) => (
                                        <div
                                            key={item.id}
                                            className="group relative aspect-[3/4] overflow-hidden rounded-lg border border-[#d6dce1] bg-white"
                                        >
                                            <Image
                                                alt={`History Image ${item.imageIndex + 1}`}
                                                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                                                fill
                                                loading="eager"
                                                sizes="(max-width: 1024px) 33vw, 180px"
                                                src={item.url}
                                                unoptimized
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
