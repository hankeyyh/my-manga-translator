"use client";

import { Manrope, Inter } from "next/font/google";
import { useEffect, useMemo, useRef, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import {
    TranslationHistorySection,
    TranslateTaskBar,
    TranslateWorkbench,
} from "@/components/translate";
import { TASK_ENDED_STATUSES } from "@/types/do/translation-task";
import { FONT_NAME_OPTIONS, TranslationConfig, type FontName } from "@/types/do/translation-config";
import { ApiGetTranslationTaskResponse } from "@/types/api/translation-task";
import { ApiTranslationTaskImage } from "@/types/api/translation-image";
import { cn } from "@/components/utils";
import { ApiPricingConfig } from "@/types/api/pricing-config";
import { translationCacheService } from "@/biz/services/translation-cache/translation-cache-service";
import { LocalPage } from "@/types/dto/local-page";

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

const POLL_INTERVAL_MS = 1000;
const POLL_MAX_WAIT_MS = 5 * 60 * 1000;

function isTaskEnded(task: Pick<ApiGetTranslationTaskResponse, "status">) {
    return TASK_ENDED_STATUSES.includes(task.status);
}

function buildTranslationConfig(
    translateModel: string,
    targetLang: string,
    fontName: FontName,
    translateConfigs: ApiPricingConfig[],
): TranslationConfig {
    const selected = translateConfigs.find((c) => c.modelName === translateModel);
    return {
        translator: {
            translator: selected?.translator,
            model_name: translateModel,
            target_lang: targetLang,
        },
        render: {
            font_name: fontName,
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

function buildCachedResultImages(
    cached: Awaited<ReturnType<typeof translationCacheService.partitionPagesByCache>>["cached"],
    trackCachedResultUrl: (url: string) => void,
): ApiTranslationTaskImage[] {
    return cached.map(({ originalIndex, page, hit }) => {
        const resultImageUrl = URL.createObjectURL(hit.resultBlob);
        trackCachedResultUrl(resultImageUrl);
        return {
            id: `local-cache-${page.id}`,
            status: "completed",
            filename: "",
            imageIndex: originalIndex,
            taskId: "local-cache",
            originalImageUrl: page.previewUrl,
            resultImageUrl,
        };
    });
}

export default function TranslatePage() {
    const [translateModel, setTranslateModel] = useState<string>("");
    const [sourceLang, setSourceLang] = useState("JPN");
    const [targetLang, setTargetLang] = useState("ENG");
    const [fontName, setFontName] = useState<FontName>(FONT_NAME_OPTIONS[0]);
    const [activeTab, setActiveTab] = useState(0);
    const [selectionSource, setSelectionSource] = useState<"taskbar" | "history">("taskbar");
    const [selectImage, setSelectImage] = useState<ApiTranslationTaskImage | null>(null);

    const pagesRef = useRef<LocalPage[]>([]);
    // 跟踪本地缓存命中后创建的 Blob URL，方便之后统一回收
    const cachedResultUrlsRef = useRef<string[]>([]);
    const submitIndexMapRef = useRef<number[]>([]);
    const submitConfigRef = useRef<TranslationConfig | null>(null);
    const uncachedPagesRef = useRef<LocalPage[]>([]);
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

    const trackCachedResultUrl = (url: string) => {
        cachedResultUrlsRef.current.push(url);
    };

    const revokeCachedResultUrls = () => {
        for (const url of cachedResultUrlsRef.current) {
            URL.revokeObjectURL(url);
        }
        cachedResultUrlsRef.current = [];
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
            revokeCachedResultUrls();
        };
    }, []);

    // 用户选择历史&任务栏图片，展示翻译前后图片
    const workbenchImages = useMemo(() => {
        if (selectionSource === "history" && selectImage) {
            return {
                originalImageUrl: selectImage.originalImageUrl,
                translatedImageUrl: selectImage.resultImageUrl,
            };
        }

        const page = pages[activeTab] ?? null;
        const activeResult = resultImages.find((img) => img.imageIndex === activeTab);
        return {
            originalImageUrl: page?.previewUrl ?? null,
            translatedImageUrl: activeResult?.status === "completed" ? activeResult.resultImageUrl : null,
        };
    }, [selectionSource, selectImage, activeTab, pages, resultImages]);

    const handleSelectTaskbarThumbnail = (index: number) => {
        setSelectionSource("taskbar");
        setActiveTab(index);
    };

    const handleSelectHistoryImage = (image: ApiTranslationTaskImage) => {
        setSelectionSource("history");
        setSelectImage(image);
    };

    const handleNewTask = () => {
        for (const page of pages) {
            URL.revokeObjectURL(page.previewUrl);
        }
        revokeCachedResultUrls();
        setPages([]);
        setResultImages([]);
        setTaskId(null);
        setTaskStatus(null);
        setPolling(false);
        setSubmitError(null);
        setResultError(null);
        setActiveTab(0);
        setSelectionSource("taskbar");
        setSelectImage(null);
        submitIndexMapRef.current = [];
        submitConfigRef.current = null;
        uncachedPagesRef.current = [];
    };

    const fetchHistoryImages = async () => {
        setHistoryLoading(true);
        setHistoryError(null);

        try {
            const response = await fetch("/api/translate/history");
            const data = (await response.json()) as { error?: string, images?: ApiTranslationTaskImage[]; };
            if (!response.ok) {
                throw new Error(data.error || "Failed to fetch translation history");
            }
            setHistoryImages(data.images!);
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
        revokeCachedResultUrls();
        submitIndexMapRef.current = [];
        submitConfigRef.current = null;
        uncachedPagesRef.current = [];

        try {
            const config = buildTranslationConfig(
                translateModel,
                targetLang,
                fontName,
                translateConfigs,
            );
            const { cached, uncached } = await translationCacheService.partitionPagesByCache(
                pages,
                config,
            );
            const cachedResults = buildCachedResultImages(cached, trackCachedResultUrl);

            if (uncached.length === 0) {
                setResultImages(cachedResults);
                setActiveTab(0);
                return;
            }

            const indexMap = uncached.map((item) => item.originalIndex);
            submitIndexMapRef.current = indexMap;
            submitConfigRef.current = config;
            uncachedPagesRef.current = uncached.map((item) => item.page);

            const formData = new FormData();
            for (const { page } of uncached) {
                formData.append("images", page.file);
            }
            formData.append("config", JSON.stringify(config));

            const response = await fetch("/api/translate/submit", {
                method: "POST",
                body: formData,
            });
            const data = (await response.json()) as { error?: string, taskId?: string; };
            if (!response.ok || !data.taskId) {
                throw new Error(data.error || "Failed to submit translation");
            }

            setResultImages(cachedResults);
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
                setLoadingResult(true);

                const indexMap = submitIndexMapRef.current;
                const config = submitConfigRef.current;
                const uncachedPages = uncachedPagesRef.current;
                // 用服务端 imageIndex（提交批次内下标）对齐，禁止依赖数组顺序
                const serverResults: ApiTranslationTaskImage[] = data.images.map((img) => ({
                    ...img,
                    imageIndex: indexMap[img.imageIndex] ?? img.imageIndex,
                }));

                setResultImages((prevCached) => {
                    const merged = [...prevCached];
                    for (const serverResult of serverResults) {
                        const existingIndex = merged.findIndex(
                            (item) => item.imageIndex === serverResult.imageIndex,
                        );
                        if (existingIndex >= 0) {
                            merged[existingIndex] = serverResult;
                        } else {
                            merged.push(serverResult);
                        }
                    }
                    merged.sort((a, b) => a.imageIndex - b.imageIndex);
                    return merged;
                });

                if (isTaskEnded(data)) {
                    setPolling(false);
                    clearInterval(interval);
                    setLoadingResult(false);

                    // 翻译结果写入缓存
                    if (config) {
                        for (const img of data.images) {
                            const page = uncachedPages[img.imageIndex];
                            if (img.status !== "completed" || !img.resultImageUrl || !page) {
                                continue;
                            }
                            void translationCacheService.saveFromResultUrl(
                                page.file,
                                config,
                                img.resultImageUrl,
                            );
                        }
                    }

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

    // 进入页面时，加载历史图片
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

    // 进入页面时，加载模型配置
    useEffect(() => {
        void fetchTranslationConfig();
    }, []);

    const thumbnails = useMemo(() => {
        return pages.map((page, index) => {
            const image = resultImages.find((img) => img.imageIndex === index);;
            const hasResult = image?.status === "completed";
            const isProcessing = submitLoading ||
                image?.status === "pending" ||
                image?.status === "processing" ||
                (polling && !image);
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
    }, [pages, resultImages, polling, submitLoading]);

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
                        originalImageUrl={workbenchImages.originalImageUrl}
                        translatedImageUrl={workbenchImages.translatedImageUrl}
                        translateModel={translateModel}
                        sourceLang={sourceLang}
                        targetLang={targetLang}
                        fontName={fontName}
                        translateConfigs={translateConfigs}
                        onTranslateModelChange={setTranslateModel}
                        onSourceLangChange={setSourceLang}
                        onFontNameChange={setFontName}
                        onTargetLangChange={setTargetLang}
                    />

                    <TranslateTaskBar
                        onNewTask={handleNewTask}
                        onPickFiles={onPickFiles}
                        onSelectThumbnail={handleSelectTaskbarThumbnail}
                        onSubmit={submitTask}
                        pageCount={pages.length}
                        polling={polling}
                        resultError={resultError}
                        selectedIndex={selectionSource === "taskbar" ? activeTab : -1}
                        submitError={submitError}
                        submitLoading={submitLoading}
                        taskStatus={taskStatus}
                        thumbnails={thumbnails}
                    />

                    <TranslationHistorySection
                        error={historyError}
                        images={historyImages}
                        loading={historyLoading}
                        onSelectImage={handleSelectHistoryImage}
                        selectedImageId={
                            selectionSource === "history" ? selectImage?.id ?? null : null
                        }
                    />
                </div>
            </main>
        </div>
    );
}
