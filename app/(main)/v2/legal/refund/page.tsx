import type { Metadata } from "next";
import { LegalDocumentPage } from "../_components/legal-document-page";
import { getLegalDocument } from "@/biz/utils/legal";


export async function generateMetadata(): Promise<Metadata> {
    const { title } = await getLegalDocument("refund");
    return { title: `${title} | Manga Sense` };
}

export default function Page() {
    return <LegalDocumentPage slug="refund" />;
}
