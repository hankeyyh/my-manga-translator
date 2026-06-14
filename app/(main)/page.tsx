import { Manrope, Inter } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { cn } from "@/components/utils";
import { HeroImage } from "@/components/main/hero-image";
import { QuickTranslate } from "@/components/main/quick-translate";
import { Footer } from "@/components/footer";
import { Ad1 } from "@/components/main/ad1";
import { Ad2 } from "@/components/main/ad2";
import { Pricing } from "@/components/main/pricing";
import { Faq } from "@/components/main/faq";

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


export default function ComicCuratorDemo() {
    return (
        <div className={cn(manrope.variable, inter.variable, "bg-[#f8f9fb] font-body text-[#2d3337]")}>
            <SiteHeader />

            <main className="pt-16">
                {/** hero image */}
                <HeroImage />

                {/** 翻译窗口 */}
                <QuickTranslate />

                {/** 广告1 */}
                <Ad1 />

                {/** 广告2 */}
                <Ad2 />

                {/** Pricing */}
                <Pricing />

                {/** FAQ */}
                <Faq />
            </main>

            <Footer />
        </div>
    );
}
