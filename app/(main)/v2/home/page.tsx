import { getCurrentUserInfo } from "@/biz/loaders/get-current-user-info";
import { Footer } from "@/components/v2/footer";
import { AccountNav } from "@/components/v2/home/account-nav";
import { ProfileCard } from "@/components/v2/home/profile-card";
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
                            <ProfileCard email={email} totalCredits={totalCredits} />
                            <AccountNav />
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
