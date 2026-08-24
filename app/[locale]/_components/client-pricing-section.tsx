"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { restoreSubscription } from "@/actions/restore-subscription";
import { SUCCESS_CODE } from "@/types/dto/response";
import type { TopUpConfig } from "@/types/do/topup-config";
import type { UserSubscription } from "@/types/do/user-subscription";
import {
    CcSectionHeading,
    CcSegmentedControl,
} from "@/design/design-system/components";
import { useTranslations } from "next-intl";
import {
    BillingCycleTabs,
    type BillingCycle,
} from "./billing-cycle-tabs";
import { ChangePlanConfirmDialog } from "./change-plan-confirm-dialog";
import { getYearlySavePercent } from "./plan-display";
import { SubscriptionPlanCards } from "./subscription-plan-cards";
import { useChangeSubscription } from "./use-change-subscription";

type PricingTab = "pay-to-use" | "subscription";

type Props = {
    topUpConfigs: TopUpConfig[];
    currentSubscription: UserSubscription | null;
};

export function ClientPricingSection({
    topUpConfigs,
    currentSubscription,
}: Props) {
    const [pricingTab, setPricingTab] = useState<PricingTab>("subscription");
    const [billingCycle, setBillingCycle] = useState<BillingCycle>(
        currentSubscription?.billingCycle === "yearly" ? "yearly" : "monthly",
    );
    const [isRestoring, setIsRestoring] = useState(false);
    const router = useRouter();
    const t = useTranslations("pricing");
    const tManage = useTranslations("manageSubscription");
    const {
        pendingPlan,
        isChanging,
        requestChange,
        cancelPending,
        confirmChange,
    } = useChangeSubscription();

    const plans = topUpConfigs
        .filter((config) => {
            if (config.transactionType !== pricingTab) return false;
            if (pricingTab === "subscription") {
                return config.billingCycle === billingCycle;
            }
            return true;
        })
        .sort((a, b) => a.price - b.price);
    const yearlySavePercent = getYearlySavePercent(topUpConfigs);

    const isCanceled = currentSubscription?.status === "canceled";

    async function handlePayment(id: string) {
        try {
            const res = await fetch("/api/checkout-sessions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            const data = (await res.json()) as { url?: string; error?: string };
            if (res.status === 401) {
                router.push("/auth/login");
                return;
            }
            if (!res.ok) {
                console.error("Payment error", data.error ?? res.statusText);
                return;
            }
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            console.error("Payment error", error);
        }
    }

    function handlePlanClick(plan: TopUpConfig) {
        if (currentSubscription && pricingTab === "subscription") {
            requestChange(plan);
            return;
        }
        void handlePayment(plan.id);
    }

    async function handleRestore() {
        if (isRestoring) return;
        setIsRestoring(true);
        try {
            const result = await restoreSubscription();
            if (result.code !== SUCCESS_CODE) {
                toast.error(result.message || tManage("restoreFailed"));
                return;
            }
            toast.success(result.message || tManage("restored"));
            router.refresh();
        } catch (error) {
            console.error("Restore subscription error", error);
            toast.error(tManage("restoreFailed"));
        } finally {
            setIsRestoring(false);
        }
    }

    return (
        <section id="pricing" className="scroll-mt-16 bg-cc-surface-white py-16">
            <div className="mx-auto max-w-7xl px-4">
                <CcSectionHeading className="mb-6" size="md" title={t("title")} />
                <div className="mb-8 flex flex-col items-center gap-4">
                    <CcSegmentedControl
                        onChange={setPricingTab}
                        options={[
                            { value: "pay-to-use", label: t("payAsNeeded") },
                            { value: "subscription", label: t("subscription") },
                        ]}
                        value={pricingTab}
                    />
                    {pricingTab === "subscription" ? (
                        <BillingCycleTabs
                            monthlyLabel={t("monthly")}
                            onChange={setBillingCycle}
                            saveLabel={
                                yearlySavePercent != null
                                    ? t("savePercent", {
                                          percent: yearlySavePercent,
                                      })
                                    : null
                            }
                            value={billingCycle}
                            yearlyLabel={t("yearly")}
                        />
                    ) : null}
                </div>
                <SubscriptionPlanCards
                    plans={plans}
                    currentTopupConfigId={
                        pricingTab === "subscription"
                            ? currentSubscription?.topupConfigId
                            : null
                    }
                    subscriptionStatus={
                        pricingTab === "subscription"
                            ? currentSubscription?.status
                            : null
                    }
                    adjustMode={
                        Boolean(currentSubscription) &&
                        pricingTab === "subscription"
                    }
                    busy={isChanging || isRestoring}
                    onSelectPlan={handlePlanClick}
                    onRestoreSubscription={
                        isCanceled && pricingTab === "subscription"
                            ? () => {
                                  void handleRestore();
                              }
                            : undefined
                    }
                />
            </div>

            <ChangePlanConfirmDialog
                pendingPlan={pendingPlan}
                isChanging={isChanging}
                onOpenChange={(open) => {
                    if (!open) cancelPending();
                }}
                onConfirm={() => {
                    void confirmChange();
                }}
            />
        </section>
    );
}
