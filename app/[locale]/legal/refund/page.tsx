import type { Metadata } from "next";
import { LegalDocumentPage } from "../_components/legal-document-page";
import { LegalService } from "@/biz/services/legal/legal-service";
import { createServerClient } from "@/biz/utils/supabase/server";
import { getLocale, getTranslations } from "next-intl/server";
import { pageAlternates } from "@/biz/seo/site";

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getLocale();
    const t = await getTranslations("meta.legalFallback");
    const supabase = await createServerClient();
    const result = await LegalService.fromSupabase(supabase).selectPublishedDocument("refund", locale, ["title"]);
    return {
        title: `${result.data?.title ?? t("refund")} | MangaSense`,
        alternates: pageAlternates(locale, "/legal/refund"),
    };
}

export default function Page() {
    return <LegalDocumentPage slug="refund" />;
}
