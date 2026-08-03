import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

const STEPS = [
    { step: "①", title: "上传漫画", desc: "拖放图片或文档，支持批量上传。" },
    { step: "②", title: "选择语言", desc: "选择目标语言与字体风格。" },
    { step: "③", title: "查看与下载", desc: "预览结果并下载译后漫画。" },
];

export function HowSection() {
    return (
        <section id="how" className="scroll-mt-16 py-16">
            <div className="mx-auto max-w-5xl px-4">
                <h2 className="mb-8 text-center text-2xl font-semibold">使用流程</h2>
                <div className="grid gap-4 md:grid-cols-3">
                    {STEPS.map((item) => (
                        <Card key={item.title}>
                            <CardHeader>
                                <CardDescription>{item.step}</CardDescription>
                                <CardTitle>{item.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{item.desc}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
