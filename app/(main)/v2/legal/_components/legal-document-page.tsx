import { notFound } from "next/navigation";
import { MarkdownContent } from "@/components/markdown-content";
import { LegalService } from "@/biz/services/legal/legal-service";
import { createServerClient } from "@/biz/utils/supabase/server";
import { isLegalSlug } from "@/types/do/legal-doc";

export async function LegalDocumentPage({ slug }: { slug: string; }) {
    if (!isLegalSlug(slug)) {
        notFound();
    }

    const supabase = await createServerClient();
    const result = await LegalService.fromSupabase(supabase).getPublishedDocument(slug);
    if (result.error || !result.data) {
        notFound();
    }

    return (
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
            <MarkdownContent content={result.data.content} />
        </div>
    );
}
