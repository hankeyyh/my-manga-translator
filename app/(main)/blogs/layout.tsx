import { SiteHeader } from "@/components/site-header";
import { Footer } from "@/components/footer";

export default function BlogsLayout({
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
