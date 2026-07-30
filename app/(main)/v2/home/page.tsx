import { CreditCard, History, LogOut } from "lucide-react";

import { getCurrentUserInfo } from "@/biz/loaders/get-current-user-info";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Footer } from "@/components/v2/footer";
import {
    TranslationHistory,
    type HistoryTask,
} from "@/components/v2/home/translation-history";
import { SiteHeader } from "@/components/v2/site-header";

// Relative to ~2026-07-30 so 1d / 7d / 1m filters each return a different subset
const MOCK_TASKS: HistoryTask[] = [
    {
        id: "1",
        sourceLang: "日语",
        sourceCode: "JP",
        targetLang: "英语",
        targetCode: "EN",
        totalImages: 24,
        startedAt: "2026-07-30", // today → 1d / 7d / 1m
        status: "completed",
    },
    {
        id: "2",
        sourceLang: "韩语",
        sourceCode: "KR",
        targetLang: "英语",
        targetCode: "EN",
        totalImages: 12,
        startedAt: "2026-07-28", // 2 days ago → 7d / 1m
        status: "processing",
    },
    {
        id: "3",
        sourceLang: "中文",
        sourceCode: "CN",
        targetLang: "英语",
        targetCode: "EN",
        totalImages: 8,
        startedAt: "2026-07-24", // 6 days ago → 7d / 1m
        status: "pending",
    },
    {
        id: "4",
        sourceLang: "日语",
        sourceCode: "JP",
        targetLang: "中文",
        targetCode: "ZH",
        totalImages: 16,
        startedAt: "2026-07-10", // 20 days ago → 1m only
        status: "failed",
    },
    {
        id: "5",
        sourceLang: "英语",
        sourceCode: "EN",
        targetLang: "日语",
        targetCode: "JP",
        totalImages: 32,
        startedAt: "2026-05-01", // older → all only
        status: "partial",
    },
];

export default async function HomePage() {
    const userInfoResult = await getCurrentUserInfo();
    const userInfo = userInfoResult.data;
    const email = userInfo?.user?.email ?? "";
    const totalCredits = (userInfo?.credit?.payToUseBalance ?? 0) + (userInfo?.credit?.subscriptionBalance ?? 0);
    const tasks = MOCK_TASKS;

    return (
        <>
            <SiteHeader />
            <div className="min-h-screen bg-background">
                <main className="mx-auto max-w-5xl px-4 py-10">
                    <div className="grid gap-8 md:grid-cols-[220px_1fr]">
                        {/* Sidebar: user + nav */}
                        <aside className="space-y-4">
                            <Card className="gap-0 py-4 shadow-none">
                                <CardContent className="space-y-4 px-4">
                                    <div>
                                        <p className="text-xs text-muted-foreground">邮箱</p>
                                        <p className="mt-1 break-all text-sm">{email}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">积分余额</p>
                                        <p className="mt-1 text-xl font-semibold">
                                            {totalCredits.toLocaleString()}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <nav aria-label="Account" className="space-y-1">
                                <Button
                                    variant="secondary"
                                    className="h-auto w-full justify-start gap-2 px-3 py-2.5"
                                    type="button"
                                >
                                    <History className="size-4" />
                                    翻译历史
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="h-auto w-full justify-start gap-2 px-3 py-2.5 text-muted-foreground"
                                    type="button"
                                >
                                    <CreditCard className="size-4" />
                                    账单与订阅
                                </Button>
                                <div className="border-t pt-2">
                                    <Button
                                        variant="ghost"
                                        className="h-auto w-full justify-start gap-2 px-3 py-2.5 text-destructive"
                                        type="button"
                                    >
                                        <LogOut className="size-4" />
                                        退出登录
                                    </Button>
                                </div>
                            </nav>
                        </aside>

                        {/* Main: translation history */}
                        <section className="min-w-0 space-y-4">
                            <div>
                                <h1 className="text-xl font-semibold">翻译历史</h1>
                            </div>

                            <TranslationHistory tasks={tasks} />
                        </section>
                    </div>
                </main>
            </div>
            <Footer />
        </>
    );
}
