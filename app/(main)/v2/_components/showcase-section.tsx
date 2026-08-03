const PLACEHOLDER_WIDE = "https://placehold.co/800x400/e5e5e5/a3a3a3?text=Before+%2F+After";

export function ShowcaseSection() {
    return (
        <section className="border-t bg-muted/40 py-16">
            <div className="mx-auto max-w-5xl px-4 text-center">
                <h2 className="mb-2 text-2xl font-semibold">翻译效果展示</h2>
                <p className="mb-6 text-sm text-muted-foreground">
                    拖动滑块对比原图 / 翻译
                </p>
                <div className="overflow-hidden rounded-xl border bg-background">
                    <img
                        src={PLACEHOLDER_WIDE}
                        alt="翻译前后对比"
                        className="mx-auto h-auto w-full max-w-3xl object-cover"
                    />
                </div>
            </div>
        </section>
    );
}
