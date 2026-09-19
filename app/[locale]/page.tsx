import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { getLocale, getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/site-header";
import { HeroSection } from "./_components/hero-section";
import { HowSection } from "./_components/how-section";
import { ShowcaseSection } from "./_components/showcase-section";
import { PricingSection } from "./_components/pricing-section";
import { FaqSection } from "./_components/faq-section";
import { BlogSection } from "./_components/blog-section";
import { Footer } from "@/components/footer";
import { TranslateSection } from "./_components/translate-section";
import { HomeJsonLd } from "./_components/seo/home-json-ld";
import { buildPageMetadata } from "@/biz/seo/site";
import { cn } from "@/components/utils";

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getLocale();
    const t = await getTranslations("meta");
    return buildPageMetadata({
        locale,
        href: "/",
        title: t("title"),
        description: t("description"),
    });
}

// 页面级 ISR(Incremental Static Regeneration) 配置
// 告诉服务端，这个路由生成的 HTML/数据缓存 最多 60 秒有效
export const revalidate = 60;

const manrope = Manrope({
    subsets: ["latin"],
    weight: ["400", "600", "700", "800"],
    variable: "--font-manrope",
});

export default function Page() {
    return (
        <div
            className={cn(
                manrope.variable,
                "font-body text-cc-text-primary",
            )}
        >
            <HomeJsonLd />
            <SiteHeader deferUser={true} />
            <div className="min-h-screen bg-cc-surface-white">
                <main>
                    <HeroSection />
                    {/* 不透明层盖过 fixed 背景，滚动时前景盖住 hero 图 */}
                    <div className="relative z-10 bg-cc-surface-white">
                        <TranslateSection />
                        <HowSection />
                        <ShowcaseSection />
                        <PricingSection />
                        <FaqSection />
                        <BlogSection />
                        <Footer />
                    </div>
                </main>
            </div>
        </div>
    );
}
