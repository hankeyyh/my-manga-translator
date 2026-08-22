import { CcSectionHeading } from "@/design/design-system/components";
import { ImageCompareSlider } from "./image-compare-slider";

const BEFORE_SRC = "/showcase/frieren.webp";
const AFTER_SRC = "/showcase/frieren-chs.webp";

export function ShowcaseSection() {
    return (
        <section className="border-t border-cc-border/40 bg-cc-surface-page py-16">
            <div className="mx-auto max-w-7xl px-4 text-center">
                <CcSectionHeading
                    className="mb-6"
                    description="拖动滑块对比原图 / 翻译"
                    size="md"
                    title="翻译效果展示"
                />
                <div className="mx-auto w-fit max-w-5xl overflow-hidden rounded-2xl border border-cc-border/50 bg-cc-surface-white shadow-[var(--cc-shadow-card)]">
                    <ImageCompareSlider
                        beforeSrc={BEFORE_SRC}
                        afterSrc={AFTER_SRC}
                        beforeAlt="翻译前原图"
                        afterAlt="翻译后效果"
                    />
                </div>
            </div>
        </section>
    );
}
