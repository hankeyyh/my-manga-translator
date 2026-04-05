import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardTitle,
} from "@/components/ui/card";

export function HomeProUpsellCard() {
    return (
        <Card className="relative flex flex-col items-center justify-between gap-6 overflow-hidden border-0 bg-[#dee3e7] md:flex-row">
            <CardContent className="relative z-10 space-y-2 p-8">
                <Badge className="border-0 bg-[#0053dd]/10 font-headline text-xs font-bold uppercase tracking-widest text-[#0053dd] hover:bg-[#0053dd]/15">
                    PRO MEMBER
                </Badge>
                <CardTitle className="font-headline text-2xl font-extrabold">
                    升级至专业版
                </CardTitle>
                <CardDescription className="max-w-md text-base text-[#5a6064]">
                    解锁批量翻译、高保真字体渲染及无限云端存储空间。
                </CardDescription>
                <div className="pt-2">
                    <Button className="rounded-full bg-gradient-to-br from-[#0053dd] to-[#2e6dfc] px-8 py-3 font-headline text-sm font-bold text-white shadow-xl shadow-[#0053dd]/20 hover:scale-105">
                        立即充值 / 升级
                    </Button>
                </div>
            </CardContent>
            <div className="relative hidden lg:block">
                <div className="absolute -right-12 -top-24 h-48 w-48 rounded-full bg-[#0053dd]/5 blur-3xl" />
                <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-[#595e72]/5 blur-3xl" />
                <svg
                    aria-hidden
                    className="h-32 w-32 select-none text-[#0053dd]/10"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
            </div>
        </Card>
    );
}
