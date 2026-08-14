import type { Metadata } from "next";
import { LegalDocumentPage } from "../_components/legal-document-page";
import { LegalService } from "@/biz/services/legal/legal-service";
import { createServerClient } from "@/biz/utils/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
    const supabase = await createServerClient();
    const result = await LegalService.fromSupabase(supabase).getPublishedDocument("privacy");
    return { title: `${result.data?.title ?? "Privacy"} | Manga Sense` };
}

export default function Page() {
    return <LegalDocumentPage slug="privacy" />;
}
