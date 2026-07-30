import { getCurrentUserInfo } from "@/biz/loaders/get-current-user-info";
import { Footer } from "@/components/v2/footer";
import { AccountNav } from "@/components/v2/home/account-nav";
import { ProfileCard } from "@/components/v2/home/profile-card";
import {
    TranslationHistory,
} from "@/components/v2/home/translation-history";
import { SiteHeader } from "@/components/v2/site-header";


export default async function HomePage() {
    const userInfoResult = await getCurrentUserInfo();
    const userInfo = userInfoResult.data;
    const email = userInfo?.user?.email ?? "";
    const totalCredits = (userInfo?.credit?.payToUseBalance ?? 0) + (userInfo?.credit?.subscriptionBalance ?? 0);

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

                            <TranslationHistory />
                        </section>
                    </div>
                </main>
            </div>
            <Footer />
        </>
    );
}
