import type { Metadata } from "next";
import { LegalDocumentPage } from "../_components/legal-document-page";
import { LegalService } from "@/biz/services/legal/legal-service";
import { createServerClient } from "@/biz/utils/supabase/server";
import { getLocale, getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("meta.legalFallback");
    const supabase = await createServerClient();
    const result = await LegalService.fromSupabase(supabase).getPublishedDocument("refund", await getLocale());
    return { title: `${result.data?.title ?? t("refund")} | Manga Sense` };
}

export default function Page() {
    return <LegalDocumentPage slug="refund" />;
}
