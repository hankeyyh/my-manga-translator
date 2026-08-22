import { Manrope, Inter } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { Footer } from "@/components/footer";
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

export default function LegalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div
            className={cn(
                manrope.variable,
                inter.variable,
                "flex min-h-screen flex-col font-body text-cc-text-primary",
            )}
        >
            <SiteHeader />
            <main className="relative z-10 flex-1 bg-cc-surface-page">{children}</main>
            <Footer />
        </div>
    );
}
