import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { buildPageMetadata } from "@/biz/seo/site";
import { LegalService } from "@/biz/services/legal/legal-service";
import { createServerClient } from "@/biz/utils/supabase/server";
import type { LegalSlug } from "@/types/do/legal-doc";

export async function generateLegalMetadata(slug: LegalSlug): Promise<Metadata> {
    const locale = await getLocale();
    const tFallback = await getTranslations("meta.legalFallback");
    const tMeta = await getTranslations("meta");
    const tCommon = await getTranslations("common");
    const supabase = await createServerClient();
    const result = await LegalService.fromSupabase(supabase).selectPublishedDocument(
        slug,
        locale,
        ["title"],
    );

    return buildPageMetadata({
        locale,
        href: `/legal/${slug}`,
        title: `${result.data?.title ?? tFallback(slug)} | ${tCommon("brand")}`,
        description: tMeta("description"),
    });
}
