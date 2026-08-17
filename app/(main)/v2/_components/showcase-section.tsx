import { ImageCompareSlider } from "./image-compare-slider";

const BEFORE_SRC = "/showcase/frieren.webp";
const AFTER_SRC = "/showcase/frieren-chs.webp";

export function ShowcaseSection() {
    return (
        <section className="border-t bg-muted/40 py-16">
            <div className="mx-auto max-w-7xl px-4 text-center">
                <h2 className="mb-2 text-2xl font-semibold">翻译效果展示</h2>
                <p className="mb-6 text-sm text-muted-foreground">
                    拖动滑块对比原图 / 翻译
                </p>
                <div className="mx-auto w-fit max-w-5xl overflow-hidden rounded-xl border bg-background">
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
