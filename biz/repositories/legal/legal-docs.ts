import { Tables } from "@/types/database";
import { Result } from "@/types/do/response";
import { LegalDoc } from "@/types/do/legal-doc";
import { SupabaseClient } from "@supabase/supabase-js";

function mapLegalDocRow(row: Tables<"legal_docs">): LegalDoc {
    return {
        id: row.id,
        slug: row.slug,
        locale: row.locale,
        kind: row.kind,
        title: row.title,
        content: row.content,
        status: row.status,
        effectiveAt: row.effective_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

export class LegalDocsRepository {
    constructor(private supabase: SupabaseClient) {}

    async getPublishedBySlug(slug: string, locale: string): Promise<Result<LegalDoc>> {
        const { data, error } = await this.supabase
            .from("legal_docs")
            .select("*")
            .eq("slug", slug)
            .eq("locale", locale)
            .eq("status", "published")
            .maybeSingle();

        if (error) {
            return { data: null, error };
        }
        if (!data) {
            return { data: null, error: new Error(`legal_docs not found: ${slug}, locale: ${locale}`) };
        }
        return { data: mapLegalDocRow(data as Tables<"legal_docs">), error: null };
    }
}
