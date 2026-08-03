import { SiteHeader } from "@/components/v2/site-header";
import { ClientPage } from "./client-page";
import { HeroSection } from "./_components/hero-section";
import { HowSection } from "./_components/how-section";
import { ShowcaseSection } from "./_components/showcase-section";
import { PricingSection } from "./_components/pricing-section";
import { FaqSection } from "./_components/faq-section";
import { BlogSection } from "./_components/blog-section";
import { Footer } from "@/components/v2/footer";

export default function Page() {
    return (
        <>
            <SiteHeader />
            <div className="min-h-screen bg-background">
                <main>
                    <HeroSection />
                    <ClientPage />
                    <HowSection />
                    <ShowcaseSection />
                    <PricingSection />
                    <FaqSection />
                    <BlogSection />
                </main>
            </div>
            <Footer />
        </>
    );
}
