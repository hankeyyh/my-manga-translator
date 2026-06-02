"use client";

import { Manrope, Inter } from "next/font/google";
import { useEffect, useMemo, useRef, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import {
    TRANSLATION_STYLES,
    TranslationHistorySection,
    TranslateTaskBar,
    TranslateWorkbench,
} from "@/components/translate";
import { TASK_ENDED_STATUSES } from "@/types/do/translation-task";
import { TranslationConfig } from "@/types/do/translation-config";
import { ApiGetTranslationTaskResponse } from "@/types/api/translation-task";
import { ApiTranslationTaskImage } from "@/types/api/translation-image";
import { cn } from "@/components/utils";
import { ApiPricingConfig } from "@/types/api/pricing-config";

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

const POLL_INTERVAL_MS = 5000;
const POLL_MAX_WAIT_MS = 5 * 60 * 1000;

interface LocalPage {
    id: string;
    file: File;
    previewUrl: string;
}

function isTaskEnded(task: Pick<ApiGetTranslationTaskResponse, "status">) {
    return TASK_ENDED_STATUSES.includes(task.status);
}

export default function TranslatePage() {
    const [translateModel, setTranslateModel] = useState<string>("");
    const [sourceLang, setSourceLang] = useState("JPN");
    const [targetLang, setTargetLang] = useState("ENG");
    const [style, setStyle] = useState<string>(TRANSLATION_STYLES[0]);
    const [activeTab, setActiveTab] = useState(0);

    const pagesRef = useRef<LocalPage[]>([]);
    const [pages, setPages] = useState<LocalPage[]>([]);
    const [taskId, setTaskId] = useState<string | null>(null);
    const [taskStatus, setTaskStatus] = useState<ApiGetTranslationTaskResponse | null>(null);
    const [resultImages, setResultImages] = useState<ApiTranslationTaskImage[]>([]);
    const [historyImages, setHistoryImages] = useState<ApiTranslationTaskImage[]>([]);
    const [loadingResult, setLoadingResult] = useState(false);
    const [resultError, setResultError] = useState<string | null>(null);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState<string | null>(null);
    const [polling, setPolling] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const [translateConfigs, setTranslateConfigs] = useState<ApiPricingConfig[]>([]);

    // 选择待翻译图片
    const onPickFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
        const picked = Array.from(event.target.files ?? []);
        if (picked.length === 0) {
            return;
        }

        setPages((prev) => {
            const next = [...prev];
            for (const file of picked) {
                // 内存url，类似 blob:http://127.0.0.1:3001/b52458d4-b4e8-4889-bfa2-c590518f5eee
                const previewUrl = URL.createObjectURL(file);
                next.push({
                    id: crypto.randomUUID(),
                    file,
                    previewUrl: previewUrl,
                });
            }
            return next;
        });

        event.target.value = "";
    };

    // 回收blob url
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

    // 点选任务栏图片，展示翻译后结果
    const translatedSrc = useMemo(() => {
        if (selectedPage && resultImages[activeTab]) {
            return resultImages[activeTab].resultImageUrl;
        }
        return null;
    }, [activeTab, resultImages, selectedPage]);

    const fetchHistoryImages = async () => {
        setHistoryLoading(true);
        setHistoryError(null);

        try {
            const response = await fetch("/api/translate/history");
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch translation history");
            }
            setHistoryImages(data.images);
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
            // TODO 可配置
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

    // 轮询拉取任务结果
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
                const data: ApiGetTranslationTaskResponse & { error?: string; } =
                    await response.json();
                if (!response.ok) {
                    throw new Error(data.error || "Failed to poll task status");
                }
                setTaskStatus(data);
                setResultImages(data.images);
                setLoadingResult(true);

                if (isTaskEnded(data)) {
                    setPolling(false);
                    clearInterval(interval);
                    setLoadingResult(false);
                    await fetchHistoryImages();
                }
            } catch (error) {
                setPolling(false);
                clearInterval(interval);
                setLoadingResult(false);
                setResultError(error instanceof Error ? error.message : "Unknown error");
            }
        }, POLL_INTERVAL_MS);

        return () => clearInterval(interval);
    }, [polling, taskId]);

    useEffect(() => {
        void fetchHistoryImages();
    }, []);

    const fetchTranslationConfig = async () => {
        try {
            const response = await fetch("/api/translate/config");
            const json: { data?: ApiPricingConfig[]; error?: string; } = await response.json();
            if (!response.ok) {
                throw new Error(json.error || "Failed to fetch translation config");
            }
            const configs = json.data ?? [];
            setTranslateConfigs(configs);
            if (configs[0]?.modelName) {
                setTranslateModel(configs[0].modelName);
            }
        } catch (err) {
            console.error("fetchTranslationConfig failed:", err);
        }
    };

    useEffect(() => {
        void fetchTranslationConfig();
    }, []);

    const thumbnails = useMemo(() => {
        return pages.map((page, index) => {
            const hasResult = Boolean(resultImages[index]);
            const isProcessing = polling || submitLoading;
            return {
                id: page.id,
                status: hasResult
                    ? ("completed" as const)
                    : isProcessing
                        ? ("processing" as const)
                        : ("active" as const),
                image: page.previewUrl,
            };
        });
    }, [pages, resultImages, polling, submitLoading, taskStatus?.progress]);

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
                    <TranslateWorkbench
                        originalImageUrl={selectedPage?.previewUrl ?? null}
                        translatedImageUrl={translatedSrc}
                        translateModel={translateModel}
                        sourceLang={sourceLang}
                        targetLang={targetLang}
                        style={style}
                        translateConfigs={translateConfigs}
                        onTranslateModelChange={setTranslateModel}
                        onSourceLangChange={setSourceLang}
                        onStyleChange={setStyle}
                        onTargetLangChange={setTargetLang}
                    />

                    <TranslateTaskBar
                        onNewTask={() => setPages([])}
                        onPickFiles={onPickFiles}
                        onSelectThumbnail={setActiveTab}
                        onSubmit={submitTask}
                        pageCount={pages.length}
                        polling={polling}
                        resultError={resultError}
                        selectedIndex={activeTab}
                        submitError={submitError}
                        submitLoading={submitLoading}
                        taskStatus={taskStatus}
                        thumbnails={thumbnails}
                    />

                    <TranslationHistorySection
                        error={historyError}
                        images={historyImages}
                        loading={historyLoading}
                    />
                </div>
            </main>
        </div>
    );
}
