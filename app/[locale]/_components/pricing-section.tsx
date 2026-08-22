import { Suspense } from "react";
import { createServerClient } from "@/biz/utils/supabase/server";
import { BillingService } from "@/biz/services/billing/billing-service";
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
    const [topupConfigResult, subscriptionResult] = await Promise.all([
        CreditService.fromSupabase(supabase).getAllTopUpConfig(),
        BillingService.fromSupabase(supabase).getUserSubscription(),
    ]);
    if (topupConfigResult.error || !topupConfigResult.data) {
        return;
    }
    return (
        <ClientPricingSection
            topUpConfigs={topupConfigResult.data}
            currentSubscription={subscriptionResult.data}
        />
    );
}
