import {
    CcCard,
    CcCardDescription,
    CcCardTitle,
    CcSectionHeading,
} from "@/design/design-system/components";

const STEPS = [
    { step: "①", title: "上传漫画", desc: "拖放图片或文档，支持批量上传。" },
    { step: "②", title: "选择语言", desc: "选择目标语言与字体风格。" },
    { step: "③", title: "查看与下载", desc: "预览结果并下载译后漫画。" },
];

export function HowSection() {
    return (
        <section id="how" className="scroll-mt-16 bg-cc-surface-white py-16">
            <div className="mx-auto max-w-7xl px-4">
                <CcSectionHeading className="mb-8" size="md" title="使用流程" />
                <div className="grid gap-4 md:grid-cols-3">
                    {STEPS.map((item) => (
                        <CcCard className="gap-3 p-6 lg:p-8" key={item.title} variant="outlined">
                            <CcCardDescription className="text-cc-brand-primary">
                                {item.step}
                            </CcCardDescription>
                            <CcCardTitle>{item.title}</CcCardTitle>
                            <p className="text-sm text-cc-text-secondary">{item.desc}</p>
                        </CcCard>
                    ))}
                </div>
            </div>
        </section>
    );
}
