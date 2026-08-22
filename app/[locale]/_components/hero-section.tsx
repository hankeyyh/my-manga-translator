import { CcButton } from "@/design/design-system/components";
import { getTranslations } from "next-intl/server";

export async function HeroSection() {
    const t = await getTranslations("hero");

    return (
        <section className="relative flex min-h-[60vh] items-center">
            {/* 固定于 header 下方、高度对齐 hero；后续不透明层滚动盖过 */}
            <div className="pointer-events-none fixed inset-x-0 top-14 z-0 h-[60vh]">
                <img
                    src="/hero_image.webp"
                    alt=""
                    aria-hidden
                    className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-[color-mix(in_srgb,var(--cc-surface-page)_20%,transparent)]" />
            </div>
            <div className="relative z-10 mx-auto w-full max-w-5xl px-4 py-16 text-center">
                <h1 className="font-headline text-3xl font-extrabold tracking-tight text-cc-text-primary sm:text-5xl">
                    {t("title")}
                </h1>
                <p className="mx-auto mt-4 max-w-2xl text-cc-text-secondary">
                    {t("subtitle")}
                </p>
                <div className="mt-8 grid grid-cols-3 gap-4 sm:mx-auto sm:max-w-lg">
                    <div>
                        <p className="font-headline text-xl font-bold text-cc-brand-primary">100,000+</p>
                        <p className="text-sm text-cc-text-muted">{t("statPages")}</p>
                    </div>
                    <div>
                        <p className="font-headline text-xl font-bold text-cc-brand-primary">20+</p>
                        <p className="text-sm text-cc-text-muted">{t("statLanguages")}</p>
                    </div>
                    <div>
                        <p className="font-headline text-xl font-bold text-cc-brand-primary">99%</p>
                        <p className="text-sm text-cc-text-muted">{t("statAccuracy")}</p>
                    </div>
                </div>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <CcButton asChild>
                        <a href="#tool">{t("tryFree")}</a>
                    </CcButton>
                    <CcButton variant="outline" asChild>
                        <a href="#how">{t("howItWorks")}</a>
                    </CcButton>
                </div>
            </div>
        </section>
    );
}
