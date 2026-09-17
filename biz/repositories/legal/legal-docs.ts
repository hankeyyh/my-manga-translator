import { Tables } from "@/types/database";
import { Result } from "@/types/do/response";
import { LegalDoc } from "@/types/do/legal-doc";
import { SupabaseClient } from "@supabase/supabase-js";

const LEGAL_DOC_COLUMNS = {
    id: "id",
    slug: "slug",
    locale: "locale",
    kind: "kind",
    title: "title",
    content: "content",
    status: "status",
    effectiveAt: "effective_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
} as const satisfies Record<keyof LegalDoc, keyof Tables<"legal_docs">>;

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

function mapSelectedLegalDocFields<K extends keyof LegalDoc>(
    row: Record<string, unknown>,
    selectFields: readonly K[],
): Pick<LegalDoc, K> {
    const doc = {} as Pick<LegalDoc, K>;
    for (const field of selectFields) {
        doc[field] = row[LEGAL_DOC_COLUMNS[field]] as Pick<LegalDoc, K>[K];
    }
    return doc;
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
            return { data: null, error: null };
        }
        return { data: mapLegalDocRow(data as Tables<"legal_docs">), error: null };
    }

    async selectPublishedBySlug<const K extends keyof LegalDoc>(
        slug: string,
        locale: string,
        selectFields: readonly K[],
    ): Promise<Result<Pick<LegalDoc, K>>> {
        if (selectFields.length === 0) {
            return { data: null, error: new Error("selectFields is required") };
        }

        const { data, error } = await this.supabase
            .from("legal_docs")
            .select(selectFields.map((field) => LEGAL_DOC_COLUMNS[field]).join(","))
            .eq("slug", slug)
            .eq("locale", locale)
            .eq("status", "published")
            .maybeSingle();

        if (error) {
            return { data: null, error };
        }
        if (!data) {
            return { data: null, error: null };
        }
        return {
            data: mapSelectedLegalDocFields(data as unknown as Record<string, unknown>, selectFields),
            error: null,
        };
    }
}
