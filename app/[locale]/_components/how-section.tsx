"use client";

import { useState } from "react";
import { Download, Languages, Upload } from "lucide-react";
import { CcSectionHeading } from "@/design/design-system/components";
import { cn } from "@/components/utils";
import { useTranslations } from "next-intl";

const STEPS = [
    {
        key: "upload",
        step: "01",
        videoSrc: "/how-to-use/01-upload.min.mp4",
        icon: Upload,
    },
    {
        key: "language",
        step: "02",
        videoSrc: "/how-to-use/02-language.min.mp4",
        icon: Languages,
    },
    {
        key: "download",
        step: "03",
        videoSrc: "/how-to-use/03-result.min.mp4",
        icon: Download,
    },
] as const;

function HowStepMedia({
    videoSrc,
    title,
    fallback,
    icon: Icon,
}: {
    videoSrc: string;
    title: string;
    fallback: string;
    icon: typeof Upload;
}) {
    const [failed, setFailed] = useState(false);

    return (
        <div className="w-full overflow-hidden rounded-2xl border border-cc-border/50 bg-cc-surface-white shadow-[var(--cc-shadow-card)] md:w-[58%]">
            {failed ? (
                <div className="flex aspect-[16/10] flex-col items-center justify-center gap-3 bg-cc-surface-subtle">
                    <Icon className="size-8 text-cc-brand-primary" aria-hidden />
                    <p className="text-sm text-cc-text-muted">{fallback}</p>
                </div>
            ) : (
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="aspect-[16/10] w-full object-cover"
                    onError={() => setFailed(true)}
                >
                    <source src={videoSrc} type="video/mp4" />
                </video>
            )}
        </div>
    );
}

export function HowSection() {
    const t = useTranslations("how");

    return (
        <section id="how" className="scroll-mt-16 bg-cc-surface-white py-16 md:py-24">
            <div className="mx-auto max-w-7xl px-4">
                <CcSectionHeading className="mb-12 md:mb-20" size="md" title={t("title")} />
                <div className="flex flex-col gap-16 md:gap-24">
                    {STEPS.map((item, index) => {
                        const title = t(`steps.${item.key}.title`);
                        return (
                            <div
                                key={item.step}
                                className={cn(
                                    "flex flex-col items-center gap-8 md:flex-row md:items-center md:gap-16 lg:gap-20",
                                    index % 2 === 1 && "md:flex-row-reverse",
                                )}
                            >
                                <div className="flex w-full flex-col items-center text-center md:w-[38%] md:items-start md:text-left">
                                    <div className="mb-4 flex size-12 items-center justify-center rounded-full border border-cc-brand-primary/20 bg-[color-mix(in_srgb,var(--cc-brand-primary)_8%,white)] font-headline text-sm font-bold text-cc-brand-primary">
                                        {item.step}
                                    </div>
                                    <h3 className="font-headline text-2xl font-bold text-cc-text-primary md:text-3xl">
                                        {title}
                                    </h3>
                                    <p className="mt-3 max-w-sm text-cc-text-secondary">
                                        {t(`steps.${item.key}.desc`)}
                                    </p>
                                </div>
                                <HowStepMedia
                                    videoSrc={item.videoSrc}
                                    title={title}
                                    fallback={t("demoFallback", { title })}
                                    icon={item.icon}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
