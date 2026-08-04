"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { changeSubscription } from "@/actions/change-subscription";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    SUCCESS_CODE,
    UNAUTHORIZED_ERROR_CODE,
} from "@/types/dto/response";
import type { TopUpConfig } from "@/types/do/topup-config";
import type { UserSubscription } from "@/types/do/user-subscription";

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
    const [pendingPlan, setPendingPlan] = useState<TopUpConfig | null>(null);
    const [isChanging, setIsChanging] = useState(false);
    const router = useRouter();

    const plans = topUpConfigs
        .filter((config) => config.transactionType === pricingTab)
        .sort((a, b) => a.price - b.price);

    async function handlePayment(id: string) {
        try {
            const res = await fetch("/api/checkout-sessions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            const data = (await res.json()) as { url?: string; error?: string; };
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
            setPendingPlan(plan);
            return;
        }
        void handlePayment(plan.id);
    }

    async function handleConfirmChangePlan() {
        if (!pendingPlan || isChanging) return;
        setIsChanging(true);
        try {
            const result = await changeSubscription({
                topupConfigId: pendingPlan.id,
            });
            if (result.code === UNAUTHORIZED_ERROR_CODE) {
                setPendingPlan(null);
                router.push("/auth/login");
                return;
            }
            if (result.code !== SUCCESS_CODE || !result.data) {
                toast.error(result.message || "调整计划失败");
                return;
            }
            if (result.data.status === "requires_action") {
                toast.message("需要完成银行卡验证后才会生效，请按提示完成验证");
            } else {
                toast.success("计划调整已提交，积分将稍后到账");
            }
            setPendingPlan(null);
            router.refresh();
        } catch (error) {
            console.error("Change subscription error", error);
            toast.error("调整计划失败");
        } finally {
            setIsChanging(false);
        }
    }

    return (
        <section id="pricing" className="scroll-mt-16 py-16">
            <div className="mx-auto max-w-5xl px-4">
                <h2 className="mb-6 text-center text-2xl font-semibold">价格</h2>
                <div className="mb-8 flex justify-center gap-2">
                    <Button
                        variant={pricingTab === "pay-to-use" ? "default" : "outline"}
                        onClick={() => setPricingTab("pay-to-use")}
                    >
                        Pay As Needed
                    </Button>
                    <Button
                        variant={pricingTab === "subscription" ? "default" : "outline"}
                        onClick={() => setPricingTab("subscription")}
                    >
                        Subscription
                    </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    {plans.map((plan) => {
                        const name = getPlanName(plan);
                        const featured = isFeatured(plan);
                        const isCurrentPlan =
                            pricingTab === "subscription" &&
                            currentSubscription?.topupConfigId === plan.id;
                        return (
                            <Card
                                key={plan.id}
                                className={
                                    featured ? "border-2 border-foreground" : undefined
                                }
                            >
                                <CardHeader className="text-center">
                                    <CardTitle className="flex items-center justify-center gap-2">
                                        {name}
                                        {featured && <Badge>★</Badge>}
                                    </CardTitle>
                                    <p className="text-2xl font-bold">
                                        {formatPrice(plan)}
                                    </p>
                                    <CardDescription>
                                        {formatCredits(plan)}
                                    </CardDescription>
                                </CardHeader>
                                <CardFooter>
                                    <Button
                                        className="w-full"
                                        variant={
                                            isCurrentPlan
                                                ? "secondary"
                                                : featured
                                                    ? "default"
                                                    : "outline"
                                        }
                                        disabled={isCurrentPlan || isChanging}
                                        onClick={
                                            isCurrentPlan
                                                ? undefined
                                                : () => handlePlanClick(plan)
                                        }
                                    >
                                        {isCurrentPlan
                                            ? "已订阅"
                                            : currentSubscription &&
                                                pricingTab === "subscription"
                                                ? "Adjust Plan"
                                                : "Get Started"}
                                    </Button>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            </div>

            <AlertDialog
                open={pendingPlan !== null}
                onOpenChange={(open) => {
                    if (!open && !isChanging) setPendingPlan(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>确认调整订阅计划？</AlertDialogTitle>
                        <AlertDialogDescription>
                            {pendingPlan
                                ? `将调整为 ${getPlanName(pendingPlan)}（${formatPrice(pendingPlan)}）。差价不会退回，现有积分将保留，确认后立即按新计划价格扣费。`
                                : null}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isChanging}>取消</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={isChanging}
                            onClick={(e) => {
                                e.preventDefault();
                                void handleConfirmChangePlan();
                            }}
                        >
                            {isChanging ? "处理中…" : "确认调整"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </section>
    );
}

function getPlanName(config: TopUpConfig) {
    const tier =
        config.transactionType === "subscription"
            ? config.planTier
            : config.packTier;
    if (tier === "basic") return "Basic";
    if (tier === "pro") return "Pro";
    if (tier === "ultra") return "Ultra";
    return tier ?? "Plan";
}

function isFeatured(config: TopUpConfig) {
    const tier =
        config.transactionType === "subscription"
            ? config.planTier
            : config.packTier;
    return tier === "pro";
}

function formatPrice(config: TopUpConfig) {
    const price = `$${config.price}`;
    if (config.transactionType !== "subscription") return price;
    if (config.billingCycle === "monthly") return `${price}/monthly`;
    if (config.billingCycle === "yearly") return `${price}/yearly`;
    return price;
}

function formatCredits(config: TopUpConfig) {
    if (config.transactionType === "pay-to-use") {
        return `${config.creditsIncluded} credits`;
    }
    if (config.billingCycle === "monthly") {
        return `${config.creditsIncluded} credits / monthly`;
    }
    if (config.billingCycle === "yearly") {
        return `${config.creditsIncluded} credits / yearly`;
    }
    return `${config.creditsIncluded} credits`;
}
