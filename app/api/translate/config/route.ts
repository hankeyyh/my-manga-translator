import { UserCreditsRepository } from "@/biz/repositories/credit/user-credits";
import { PricingConfigRepository } from "@/biz/repositories/pricing/pricing-config";
import { TopUpConfigRepository } from "@/biz/repositories/topup/topup-config";
import { UserTransactionsRepository } from "@/biz/repositories/topup/user-transactions";
import { CreditService } from "@/biz/services/credit/credit-service";
import { createServerClient } from "@/biz/utils/supabase/server";
import { ApiPricingConfig } from "@/types/api/pricing-config";
import { SUCCESS_CODE } from "@/types/dto/response";
import { PricingConfig } from "@/types/do/pricing-config";
import { NextResponse } from "next/server";

function toApiPricingConfig(config: PricingConfig): ApiPricingConfig {
    return {
        ...config,
    };
}

export async function GET() {
    const supabase = await createServerClient();
    const creditService = new CreditService(
        new TopUpConfigRepository(supabase),
        new UserTransactionsRepository(supabase),
        new PricingConfigRepository(supabase),
        new UserCreditsRepository(supabase)
    );
    const result = await creditService.getAllPricingConfig();
    if (result.error || result.code !== SUCCESS_CODE || !result.data) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
    return NextResponse.json({ data: result.data.map(toApiPricingConfig) }, { status: 200 });
}