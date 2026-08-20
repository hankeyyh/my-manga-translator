"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { restoreSubscription } from "@/actions/restore-subscription";
import { SUCCESS_CODE } from "@/types/dto/response";
import type { TopUpConfig } from "@/types/do/topup-config";
import type { UserSubscription } from "@/types/do/user-subscription";
import {
    CcSectionHeading,
    CcSegmentedControl,
} from "@/design/design-system/components";
import { ChangePlanConfirmDialog } from "./change-plan-confirm-dialog";
import { SubscriptionPlanCards } from "./subscription-plan-cards";
import { useChangeSubscription } from "./use-change-subscription";

type Props = {
    topUpConfigs: TopUpConfig[];
    currentSubscription: UserSubscription | null;
};

export function ClientPricingSection({
    topUpConfigs,
    currentSubscription,
}: Props) {
    const [pricingTab, setPricingTab] = useState<"pay-to-use" | "subscription">(
        "subscription",
    );
    const [isRestoring, setIsRestoring] = useState(false);
    const router = useRouter();
    const {
        pendingPlan,
        isChanging,
        requestChange,
        cancelPending,
        confirmChange,
    } = useChangeSubscription();

    const plans = topUpConfigs
        .filter((config) => config.transactionType === pricingTab)
        .sort((a, b) => a.price - b.price);

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
                toast.error(result.message || "恢复订阅失败");
                return;
            }
            toast.success(result.message || "已恢复订阅");
            router.refresh();
        } catch (error) {
            console.error("Restore subscription error", error);
            toast.error("恢复订阅失败");
        } finally {
            setIsRestoring(false);
        }
    }

    return (
        <section id="pricing" className="scroll-mt-16 bg-cc-surface-white py-16">
            <div className="mx-auto max-w-7xl px-4">
                <CcSectionHeading className="mb-6" size="md" title="价格" />
                <div className="mb-8 flex justify-center">
                    <CcSegmentedControl
                        onChange={setPricingTab}
                        options={[
                            { value: "pay-to-use", label: "Pay As Needed" },
                            { value: "subscription", label: "Subscription" },
                        ]}
                        value={pricingTab}
                    />
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
