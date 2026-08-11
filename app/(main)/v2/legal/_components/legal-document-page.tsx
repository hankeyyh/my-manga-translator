import { notFound } from "next/navigation";
import { MarkdownContent } from "@/components/v2/markdown-content";
import {
    getLegalDocument,
    isLegalSlug,
    type LegalSlug,
} from "@/biz/utils/legal";

export async function LegalDocumentPage({ slug }: { slug: string; }) {
    if (!isLegalSlug(slug)) {
        notFound();
    }

    const document = await getLegalDocument(slug as LegalSlug);

    return (
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
            <MarkdownContent content={document.content} />
        </div>
    );
}
