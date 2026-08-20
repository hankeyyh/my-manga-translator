import { Manrope, Inter } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { HeroSection } from "./_components/hero-section";
import { HowSection } from "./_components/how-section";
import { ShowcaseSection } from "./_components/showcase-section";
import { PricingSection } from "./_components/pricing-section";
import { FaqSection } from "./_components/faq-section";
import { BlogSection } from "./_components/blog-section";
import { Footer } from "@/components/footer";
import { TranslateSection } from "./_components/translate-section";
import { cn } from "@/components/utils";

const manrope = Manrope({
    subsets: ["latin"],
    weight: ["400", "600", "700", "800"],
    variable: "--font-manrope",
});

const inter = Inter({
    subsets: ["latin"],
    weight: ["400", "500", "600"],
    variable: "--font-inter",
});

export default function Page() {
    return (
        <div
            className={cn(
                manrope.variable,
                inter.variable,
                "font-body text-cc-text-primary",
            )}
        >
            <SiteHeader />
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
