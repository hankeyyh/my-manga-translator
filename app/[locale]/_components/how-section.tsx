"use client";

import { useState } from "react";
import { CcSectionHeading } from "@/components/cc";
import { cn } from "@/components/utils";
import { useTranslations } from "next-intl";
import { HOW_COVER_SIZES, HOW_STEPS } from "./how-steps";

function HowStepMedia({
    videoSrc,
    coverSrc,
    coverSrcSet,
    fallback,
}: {
    videoSrc: string;
    coverSrc: string;
    coverSrcSet: string;
    fallback: string;
}) {
    const [failed, setFailed] = useState(false);

    return (
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-cc-border/50 bg-cc-surface-white shadow-[var(--cc-shadow-card)] md:w-[58%]">
            <img
                src={coverSrc}
                srcSet={coverSrcSet}
                sizes={HOW_COVER_SIZES}
                alt={fallback}
                width={750}
                height={469}
                className="absolute inset-0 h-full w-full object-cover"
            />
            {failed ? null : (
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 z-[1] h-full w-full object-cover"
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
                    {HOW_STEPS.map((item, index) => {
                        const title = t(`steps.${item.key}.title`);
                        return (
                            <div
                                key={item.step}
                                className={cn(
                                    "flex flex-col items-center gap-8 md:flex-row md:items-center md:gap-16 lg:gap-20",
                                    index % 2 === 1 && "md:flex-row-reverse",
                                )}
                            >
                                <div className="flex w-full flex-col items-center text-center md:w-[38%] md:items-start md:text-start">
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
                                    coverSrc={item.coverSrc}
                                    coverSrcSet={item.coverSrcSet}
                                    fallback={t("demoFallback", { title })}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
