"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { restoreSubscription } from "@/actions/restore-subscription";
import { SUCCESS_CODE } from "@/types/dto/response";
import type { TopUpConfig } from "@/types/do/topup-config";
import type { UserSubscription } from "@/types/do/user-subscription";
import { CcSectionHeading } from "@/components/cc";
import { useTranslations } from "next-intl";
import {
    BillingCycleTabs,
    type BillingCycle,
} from "../../_components/billing-cycle-tabs";
import { ChangePlanConfirmDialog } from "../../_components/change-plan-confirm-dialog";
import { getYearlySavePercent } from "../../_components/plan-display";
import { SubscriptionPlanCards } from "../../_components/subscription-plan-cards";
import { useChangeSubscription } from "../../_components/use-change-subscription";

function getInitialBillingCycle(configs: TopUpConfig[]): BillingCycle {
    const hasYearly = configs.some(
        (config) =>
            config.transactionType === "subscription" &&
            config.billingCycle === "yearly",
    );
    return hasYearly ? "yearly" : "monthly";
}

type Props = {
    topUpConfigs: TopUpConfig[];
    currentSubscription: UserSubscription | null;
};

export function PricingPlansSection({
    topUpConfigs,
    currentSubscription,
}: Props) {
    const [selectedBillingCycle, setSelectedBillingCycle] =
        useState<BillingCycle>(() => getInitialBillingCycle(topUpConfigs));
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

    const availableBillingCycles = topUpConfigs.reduce<BillingCycle[]>(
        (cycles, config) => {
            if (config.transactionType !== "subscription") return cycles;
            if (
                (config.billingCycle === "monthly" ||
                    config.billingCycle === "yearly") &&
                !cycles.includes(config.billingCycle)
            ) {
                cycles.push(config.billingCycle);
            }
            return cycles;
        },
        [],
    );
    const billingCycle = availableBillingCycles.includes(selectedBillingCycle)
        ? selectedBillingCycle
        : availableBillingCycles.includes("yearly")
          ? "yearly"
          : (availableBillingCycles[0] ?? "monthly");

    const subscriptionPlans = topUpConfigs
        .filter(
            (config) =>
                config.transactionType === "subscription" &&
                config.billingCycle === billingCycle,
        )
        .sort((a, b) => a.price - b.price);

    const payToUsePlans = topUpConfigs
        .filter((config) => config.transactionType === "pay-to-use")
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

    function handleSubscriptionPlanClick(plan: TopUpConfig) {
        if (currentSubscription) {
            requestChange(plan);
            return;
        }
        void handlePayment(plan.id);
    }

    function handlePayToUsePlanClick(plan: TopUpConfig) {
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
        <section className="bg-cc-surface-white pb-16 pt-10">
            <div className="mx-auto max-w-7xl px-4">
                <div className="flex flex-col gap-16">
                    {subscriptionPlans.length > 0 ? (
                        <div>
                            <CcSectionHeading
                                className="mb-6"
                                description={t("subscriptionDescription")}
                                size="md"
                                title={t("subscription")}
                            />
                            {availableBillingCycles.length > 1 ? (
                                <div className="mb-8 flex justify-center">
                                    <BillingCycleTabs
                                        availableCycles={availableBillingCycles}
                                        monthlyLabel={t("monthly")}
                                        onChange={setSelectedBillingCycle}
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
                                </div>
                            ) : null}
                            <SubscriptionPlanCards
                                adjustMode={Boolean(currentSubscription)}
                                busy={isChanging || isRestoring}
                                currentTopupConfigId={
                                    currentSubscription?.topupConfigId
                                }
                                onRestoreSubscription={
                                    isCanceled
                                        ? () => {
                                              void handleRestore();
                                          }
                                        : undefined
                                }
                                onSelectPlan={handleSubscriptionPlanClick}
                                plans={subscriptionPlans}
                                subscriptionStatus={currentSubscription?.status}
                            />
                        </div>
                    ) : null}

                    {payToUsePlans.length > 0 ? (
                        <div>
                            <CcSectionHeading
                                className="mb-8"
                                description={t("payAsNeededDescription")}
                                size="md"
                                title={t("payAsNeeded")}
                            />
                            <SubscriptionPlanCards
                                busy={isChanging || isRestoring}
                                onSelectPlan={handlePayToUsePlanClick}
                                plans={payToUsePlans}
                            />
                        </div>
                    ) : null}
                </div>
            </div>

            <ChangePlanConfirmDialog
                isChanging={isChanging}
                onConfirm={() => {
                    void confirmChange();
                }}
                onOpenChange={(open) => {
                    if (!open) cancelPending();
                }}
                pendingPlan={pendingPlan}
            />
        </section>
    );
}
