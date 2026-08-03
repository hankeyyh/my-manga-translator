import { SiteHeader } from "@/components/v2/site-header";
import { ClientPage } from "./client-page";
import { BlogSection } from "./_components/blog-section";
import { Footer } from "@/components/v2/footer";

export default function Page() {
    return (
        <>
            <SiteHeader />
            <ClientPage />
            <BlogSection />
            <Footer />
        </>
    );
}
