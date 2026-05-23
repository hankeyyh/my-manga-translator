import { createServerClient } from "@/lib/utils/supabase/server";
import { ClientPricing } from "./client-pricing";
import { CreditService } from "@/lib/services/credit/credit-service";
import { TopUpConfigRepository } from "@/lib/repositories/topup/topup-config";
import { Suspense } from "react";
import { UserTransactionsRepository } from "@/lib/repositories/topup/user-transactions";

export function Pricing() {
    return (
        <Suspense fallback={<div></div>}>
            <PricingDetail />
        </Suspense>
    );
}

async function PricingDetail() {
    const supabase = await createServerClient();
    const credService = new CreditService(new TopUpConfigRepository(supabase),
        new UserTransactionsRepository(supabase),
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