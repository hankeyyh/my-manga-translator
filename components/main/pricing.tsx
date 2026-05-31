import { createServerClient } from "@/biz/utils/supabase/server";
import { ClientPricing } from "./client-pricing";
import { CreditService } from "@/biz/services/credit/credit-service";
import { TopUpConfigRepository } from "@/biz/repositories/topup/topup-config";
import { Suspense } from "react";
import { UserTransactionsRepository } from "@/biz/repositories/topup/user-transactions";
import { PricingConfigRepository } from "@/biz/repositories/pricing/pricing-config";
import { UserCreditsRepository } from "@/biz/repositories/credit/user-credits";

export function Pricing() {
    return (
        <Suspense fallback={<div></div>}>
            <PricingDetail />
        </Suspense>
    );
}

async function PricingDetail() {
    const supabase = await createServerClient();
    const credService = new CreditService(
        new TopUpConfigRepository(supabase),
        new UserTransactionsRepository(supabase),
        new PricingConfigRepository(supabase),
        new UserCreditsRepository(supabase),
    );
    const topupConfigResult = await credService.getAllTopUpConfig();
    if (topupConfigResult.error) {
        return (
            <div></div>
        );
    }
    return (
        <ClientPricing topUpConfigs={topupConfigResult.data!} />
    );
}