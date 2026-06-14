import { Tables } from "@/types/database";
import { Result } from "@/types/do/response";
import { PricingConfig } from "@/types/do/pricing-config";
import type { Translator } from "@/types/do/translation-config";
import { SupabaseClient } from "@supabase/supabase-js";

function mapPricingConfigRowToPricingConfig(row: Tables<"pricing_config">): PricingConfig {
    return {
        id: row.id,
        translator: row.translator as Translator,
        modelName: row.model_name,
        creditPerImage: row.credit_per_image,
    };
}

export class PricingConfigRepository {
    constructor(private supabase: SupabaseClient) {

    }

    async getAllPricingConfig(): Promise<Result<PricingConfig[]>> {
        const { data, error } = await this.supabase.from("pricing_config").select("*");
        if (error) {
            return { data: null, error: error };
        }
        const result = data.map(mapPricingConfigRowToPricingConfig);
        return { data: result, error: null };
    }

    async getPricingConfigByModel(modelName: string): Promise<Result<PricingConfig>> {
        if (!modelName) {
            return { data: null, error: new Error("modelName not set") };
        }
        const { data, error } = await this.supabase.from("pricing_config")
            .select("*").eq("model_name", modelName).single();
        if (error) {
            return { data: null, error: error };
        }
        return { data: mapPricingConfigRowToPricingConfig(data), error: null };
    }
}