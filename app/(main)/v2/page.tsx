import { SiteHeader } from "@/components/v2/site-header";
import { ClientPage } from "./client-page";
import { Footer } from "@/components/v2/footer";

export default function Page() {
    return (
        <>
            <SiteHeader />
            <ClientPage />
            <Footer />
        </>
    );
}
