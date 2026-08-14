import { LegalDocsRepository } from "@/biz/repositories/legal/legal-docs";
import {
    CHECK_PARAM_ERROR_CODE,
    DB_ERROR_CODE,
    SUCCESS_CODE,
    type BizResult,
} from "@/types/dto/response";
import { isLegalSlug, type LegalDoc } from "@/types/do/legal-doc";
import { SupabaseClient } from "@supabase/supabase-js";

/**
 * 法律/说明文档
 */
export class LegalService {
    constructor(private legalDocsRepo: LegalDocsRepository) {}

    static fromSupabase(supabase: SupabaseClient) {
        return new LegalService(new LegalDocsRepository(supabase));
    }

    async getPublishedDocument(slug: string): Promise<BizResult<LegalDoc>> {
        if (!slug || !isLegalSlug(slug)) {
            return {
                code: CHECK_PARAM_ERROR_CODE,
                data: null,
                error: new Error(`invalid legal slug: ${slug}`),
            };
        }

        const { data, error } = await this.legalDocsRepo.getPublishedBySlug(slug);
        if (error) {
            console.error(
                `getPublishedDocument, legalDocsRepo.getPublishedBySlug fail, slug: ${slug}, error: ${error.message}`,
            );
            return { code: DB_ERROR_CODE, data: null, error };
        }
        return { code: SUCCESS_CODE, data, error: null };
    }
}
