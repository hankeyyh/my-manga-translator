import { Button } from "@/components/ui/button";

export function HeroSection() {
    return (
        <section className="relative flex min-h-[60vh] items-center">
            {/* 固定于视口；后续 section 用更高 z-index + 不透明背景盖过 */}
            <div className="pointer-events-none fixed inset-0 z-0">
                <img
                    src="/hero_image.webp"
                    alt=""
                    aria-hidden
                    className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-background/30" />
            </div>
            <div className="relative z-10 mx-auto w-full max-w-5xl px-4 py-16 text-center">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    AI 漫画翻译，一键完成
                </h1>
                <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                    自动识别气泡文字，翻译并重绘到原图。支持日漫、韩漫、中漫，保留原作版式与字体风格。
                </p>
                <div className="mt-8 grid grid-cols-3 gap-4 sm:mx-auto sm:max-w-lg">
                    <div>
                        <p className="text-xl font-semibold">100,000+</p>
                        <p className="text-sm text-muted-foreground">页</p>
                    </div>
                    <div>
                        <p className="text-xl font-semibold">20+</p>
                        <p className="text-sm text-muted-foreground">语言</p>
                    </div>
                    <div>
                        <p className="text-xl font-semibold">99%</p>
                        <p className="text-sm text-muted-foreground">准确率</p>
                    </div>
                </div>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <Button asChild>
                        <a href="#tool">免费试用</a>
                    </Button>
                    <Button variant="outline" asChild>
                        <a href="#how">使用流程</a>
                    </Button>
                </div>
            </div>
        </section>
    );
}
