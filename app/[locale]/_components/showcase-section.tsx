import { CcSectionHeading } from "@/design/design-system/components";
import type { AppLocale } from "@/i18n/routing";
import { getLocale, getTranslations } from "next-intl/server";
import { ImageCompareSlider } from "./image-compare-slider";

const ORIGINAL_SRC = "/showcase/frieren.webp";
const FALLBACK_AFTER_SRC = "/showcase/frieren-en.webp";

/** 有专属译后图的语系；日语原图本身即日文，对比英文。其余回退英文。 */
const AFTER_SRC_BY_LOCALE: Partial<Record<AppLocale, string>> = {
    en: "/showcase/frieren-en.webp",
    "zh-cn": "/showcase/frieren-chs.webp",
    "zh-tw": "/showcase/frieren-cht.webp",
    ar: "/showcase/frieren-ara.webp",
    ko: "/showcase/frieren-kor.webp",
    ja: "/showcase/frieren-en.webp",
    ru: "/showcase/frieren-rus.webp",
    th: "/showcase/frieren-thai.webp",
};

function getShowcaseAfterSrc(locale: string): string {
    return AFTER_SRC_BY_LOCALE[locale as AppLocale] ?? FALLBACK_AFTER_SRC;
}

export async function ShowcaseSection() {
    const locale = await getLocale();
    const t = await getTranslations("showcase");

    return (
        <section className="border-t border-cc-border/40 bg-cc-surface-page py-16">
            <div className="mx-auto max-w-7xl px-4 text-center">
                <CcSectionHeading
                    className="mb-6"
                    description={t("description")}
                    size="md"
                    title={t("title")}
                />
                <div className="mx-auto w-fit max-w-5xl overflow-hidden rounded-2xl border border-cc-border/50 bg-cc-surface-white shadow-[var(--cc-shadow-card)]">
                    <ImageCompareSlider
                        beforeSrc={ORIGINAL_SRC}
                        afterSrc={getShowcaseAfterSrc(locale)}
                        beforeAlt={t("beforeAlt")}
                        afterAlt={t("afterAlt")}
                    />
                </div>
            </div>
        </section>
    );
}
