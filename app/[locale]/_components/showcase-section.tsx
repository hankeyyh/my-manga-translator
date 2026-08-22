import { CcSectionHeading } from "@/design/design-system/components";
import { getTranslations } from "next-intl/server";
import { ImageCompareSlider } from "./image-compare-slider";

const BEFORE_SRC = "/showcase/frieren.webp";
const AFTER_SRC = "/showcase/frieren-chs.webp";

export async function ShowcaseSection() {
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
                        beforeSrc={BEFORE_SRC}
                        afterSrc={AFTER_SRC}
                        beforeAlt={t("beforeAlt")}
                        afterAlt={t("afterAlt")}
                    />
                </div>
            </div>
        </section>
    );
}
