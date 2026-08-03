import { Suspense } from "react";
import { createServerClient } from "@/biz/utils/supabase/server";
import { CreditService } from "@/biz/services/credit/credit-service";
import { ClientPricingSection } from "./client-pricing-section";

export function PricingSection() {
    return (
        <Suspense fallback={<div />}>
            <PricingDetail />
        </Suspense>
    );
}

async function PricingDetail() {
    const supabase = await createServerClient();
    const topupConfigResult = await CreditService.fromSupabase(supabase).getAllTopUpConfig();
    if (topupConfigResult.error || !topupConfigResult.data) {
        return;
    }
    return <ClientPricingSection topUpConfigs={topupConfigResult.data} />;
}
