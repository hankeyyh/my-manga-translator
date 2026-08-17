import { SiteHeader } from "@/components/v2/site-header";
import { HeroSection } from "./_components/hero-section";
import { HowSection } from "./_components/how-section";
import { ShowcaseSection } from "./_components/showcase-section";
import { PricingSection } from "./_components/pricing-section";
import { FaqSection } from "./_components/faq-section";
import { BlogSection } from "./_components/blog-section";
import { Footer } from "@/components/v2/footer";
import { TranslateSection } from "./_components/translate-section-2";

export default function Page() {
    return (
        <>
            <SiteHeader />
            <div className="min-h-screen">
                <main>
                    <HeroSection />
                    {/* 不透明层盖过 fixed 背景，滚动时前景盖住 hero 图 */}
                    <div className="relative z-10 bg-background">
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
        </>
    );
}
