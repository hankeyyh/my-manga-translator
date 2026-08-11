import { SiteHeader } from "@/components/v2/site-header";
import { Footer } from "@/components/v2/footer";

export default function LegalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="relative z-10 flex-1 bg-background">{children}</main>
            <Footer />
        </div>
    );
}
