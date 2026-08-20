import { getCurrentUserInfo } from "@/biz/loaders/get-current-user-info";
import { Footer } from "@/components/footer";
import { AccountNav } from "@/app/(main)/v2/home/_components/account-nav";
import { ProfileCard } from "@/app/(main)/v2/home/_components/profile-card";
import { SiteHeader } from "@/components/site-header";

export default async function HomeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
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
                        <aside className="space-y-4">
                            <ProfileCard email={email} totalCredits={totalCredits} />
                            <AccountNav />
                        </aside>
                        <section className="min-w-0 space-y-4">{children}</section>
                    </div>
                </main>
            </div>
            <Footer />
        </>
    );
}
