import type { Metadata } from "next";
import { LegalDocumentPage } from "../_components/legal-document-page";
import { generateLegalMetadata } from "../_components/legal-document-metadata";

export function generateMetadata(): Promise<Metadata> {
    return generateLegalMetadata("privacy");
}

export default function Page() {
    return <LegalDocumentPage slug="privacy" />;
}
