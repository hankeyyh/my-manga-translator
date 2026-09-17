import { LegalDocsRepository } from "@/biz/repositories/legal/legal-docs";
import {
    CHECK_PARAM_ERROR_CODE,
    DB_ERROR_CODE,
    SUCCESS_CODE,
    type BizResult,
} from "@/types/dto/response";
import { isLegalSlug, type LegalDoc } from "@/types/do/legal-doc";
import { SupabaseClient } from "@supabase/supabase-js";

const LEGAL_DOC_FIELDS = [
    "id",
    "slug",
    "locale",
    "kind",
    "title",
    "content",
    "status",
    "effectiveAt",
    "createdAt",
    "updatedAt",
] as const satisfies readonly (keyof LegalDoc)[];

/**
 * 法律/说明文档
 */
export class LegalService {
    constructor(private legalDocsRepo: LegalDocsRepository) {}

    static fromSupabase(supabase: SupabaseClient) {
        return new LegalService(new LegalDocsRepository(supabase));
    }

    async getPublishedDocument(slug: string, locale: string): Promise<BizResult<LegalDoc>> {
        return this.selectPublishedDocument(slug, locale, LEGAL_DOC_FIELDS);
    }

    async selectPublishedDocument<const K extends keyof LegalDoc>(
        slug: string,
        locale: string,
        selectFields: readonly K[],
    ): Promise<BizResult<Pick<LegalDoc, K>>> {
        if (!slug || !isLegalSlug(slug)) {
            return {
                code: CHECK_PARAM_ERROR_CODE,
                data: null,
                error: new Error(`invalid legal slug: ${slug}`),
            };
        }
        if (!locale) {
            return {
                code: CHECK_PARAM_ERROR_CODE,
                data: null,
                error: new Error("locale is required"),
            };
        }
        if (selectFields.length === 0) {
            return {
                code: CHECK_PARAM_ERROR_CODE,
                data: null,
                error: new Error("selectFields is required"),
            };
        }

        const requested = await this.legalDocsRepo.selectPublishedBySlug(slug, locale, selectFields);
        if (requested.error) {
            console.error(
                `selectPublishedDocument, legalDocsRepo.selectPublishedBySlug fail, slug: ${slug}, locale: ${locale}, error: ${requested.error.message}`,
            );
            return { code: DB_ERROR_CODE, data: null, error: requested.error };
        }
        if (requested.data) {
            return { code: SUCCESS_CODE, data: requested.data, error: null };
        }

        // 回退到 locale=en
        if (locale !== "en") {
            const fallback = await this.legalDocsRepo.selectPublishedBySlug(slug, "en", selectFields);
            if (fallback.error) {
                console.error(
                    `selectPublishedDocument, legalDocsRepo.selectPublishedBySlug fail, slug: ${slug}, locale: en, error: ${fallback.error.message}`,
                );
                return { code: DB_ERROR_CODE, data: null, error: fallback.error };
            }
            if (fallback.data) {
                return { code: SUCCESS_CODE, data: fallback.data, error: null };
            }
        }

        return {
            code: DB_ERROR_CODE,
            data: null,
            error: new Error(`legal_docs not found: ${slug}, locale: ${locale}`),
        };
    }
}
