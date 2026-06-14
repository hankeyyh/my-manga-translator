"use client";
import { CheckCircle2 } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { cn } from "../utils";
import { Badge } from "../ui/badge";
import { SubscriptionTier } from "@/biz/services/payment/topup-prices";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Prop {
    id: string,
    // pay_to_use or subscription
    transactionType: string,
    // 订阅档位 basic, pro, ultra
    planTier: string | null,
    // 订阅付款周期 monthly, yearly
    billingCycle: string | null,
    // 单次购买档位 basic, pro, ultra
    packTier: string | null,
    price: number,
    creditsIncluded: number,
}

export function ClientPricing(props: { topUpConfigs: Prop[]; }) {
    const [planTier, setPlanTier] = useState<"pay-to-use" | "subscription">("subscription");
    const { topUpConfigs } = props;

    const router = useRouter();
    async function handlePayment(id: string) {
        try {
            const res = await fetch("/api/checkout-sessions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: id
                }),
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

    const payToUses = topUpConfigs.filter((val) => val.transactionType === 'pay-to-use').sort((a, b) => a.price - b.price);
    const subscriptions = topUpConfigs.filter((val) => val.transactionType === 'subscription').sort((a, b) => a.price - b.price);

    return (
        <div className="scroll-mt-16 bg-[#f8f9fb] px-8 py-24" id="pricing">
            <div className="mx-auto max-w-7xl">
                <div className="mb-16 text-center">
                    <h2 className="mb-4 font-headline text-4xl font-bold text-[#2d3337] md:text-5xl">
                        Choose Your Plan
                    </h2>
                    <p className="mx-auto max-w-2xl text-lg text-[#5a6064]">
                        Unlock professional-grade translation tools tailored for your needs.
                    </p>
                    <div className="mt-8 inline-flex rounded-full border border-[#adb3b7]/20 bg-[#ebeef1] p-1">
                        <Button
                            className={cn(
                                "rounded-full px-6 py-2 font-body text-sm font-bold",
                                planTier === "pay-to-use"
                                    ? "bg-white text-[#3370FF] shadow-sm hover:bg-white"
                                    : "bg-transparent text-[#5a6064] hover:text-[#2d3337]",
                            )}
                            onClick={() => setPlanTier("pay-to-use")}
                            variant="ghost"
                        >
                            Pay As Needed
                        </Button>
                        <Button
                            className={cn(
                                "rounded-full px-6 py-2 font-body text-sm font-bold",
                                planTier === "subscription"
                                    ? "bg-white text-[#3370FF] shadow-sm hover:bg-white"
                                    : "bg-transparent text-[#5a6064] hover:text-[#2d3337]",
                            )}
                            onClick={() => setPlanTier("subscription")}
                            variant="ghost"
                        >
                            Subscription
                        </Button>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    {planTier === "subscription" ? (
                        subscriptions.map((config) => (
                            <Card
                                key={config.id}
                                className="flex flex-col rounded-[2rem] border border-[#adb3b7]/10 bg-white p-10 shadow-sm transition-shadow hover:shadow-xl"
                            >
                                <CardHeader className="p-0">
                                    {getUICardTitle(config)}
                                    {getUIPrice(config)}
                                    {getUIDescription(config)}
                                </CardHeader>
                                <Button
                                    className="mb-10 rounded-xl border-2 border-[#3370FF] bg-transparent font-headline font-bold text-[#3370FF] hover:bg-[#3370FF] hover:text-white"
                                    variant="outline"
                                    onClick={() => handlePayment(config.id)}
                                >
                                    Get Started
                                </Button>
                                <ul className="flex flex-col gap-4">
                                    {[
                                        "Instant processing queue",
                                        "Enterprise API access",
                                        "Commercial usage license",
                                        "24/7 dedicated support",
                                    ].map((text) => (
                                        <li
                                            key={text}
                                            className="flex items-start gap-3 font-body text-sm text-[#5a6064]"
                                        >
                                            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#3370FF]" />
                                            {text}
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        ))
                    ) : (
                        payToUses.map((config) => (
                            <Card
                                key={config.id}
                                className="flex flex-col rounded-[2rem] border border-[#adb3b7]/10 bg-white p-10 shadow-sm transition-shadow hover:shadow-xl"
                            >
                                <CardHeader className="p-0">
                                    {getUICardTitle(config)}
                                    {getUIPrice(config)}
                                    {getUIDescription(config)}
                                </CardHeader>
                                <Button
                                    className="mb-10 rounded-xl border-2 border-[#3370FF] bg-transparent font-headline font-bold text-[#3370FF] hover:bg-[#3370FF] hover:text-white"
                                    variant="outline"
                                    onClick={() => handlePayment(config.id)}
                                >
                                    Get Started
                                </Button>
                                <ul className="flex flex-col gap-4">
                                    {[
                                        "Instant processing queue",
                                        "Enterprise API access",
                                        "Commercial usage license",
                                        "24/7 dedicated support",
                                    ].map((text) => (
                                        <li
                                            key={text}
                                            className="flex items-start gap-3 font-body text-sm text-[#5a6064]"
                                        >
                                            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#3370FF]" />
                                            {text}
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

function getUICardTitle(topupConfig: Prop) {
    let text = "";
    if (topupConfig.transactionType === 'subscription') {
        if (topupConfig.planTier === 'basic') {
            text = 'Basic';
        } else if (topupConfig.planTier === 'pro') {
            text = 'Pro';
        } else if (topupConfig.planTier === 'ultra') {
            text = 'Ultra';
        }
    } else if (topupConfig.transactionType === 'pay-to-use') {
        if (topupConfig.packTier === 'basic') {
            text = 'Basic';
        } else if (topupConfig.packTier === 'pro') {
            text = 'Pro';
        } else if (topupConfig.packTier === 'ultra') {
            text = 'Ultra';
        }
    }
    return (
        <CardTitle className="mb-2 font-headline text-xl font-bold">
            {text}
        </CardTitle>
    );
}

function getUIPrice(topupConfig: Prop) {
    let textPrice = `$${topupConfig.price}`;
    if (topupConfig.transactionType === 'subscription') {
        let textBillingCycle = '';
        if (topupConfig.billingCycle === 'monthly') {
            textBillingCycle = '/monthly';
        } else if (topupConfig.billingCycle === 'yearly') {
            textBillingCycle = '/yearly';
        }
        return (
            <div className="mb-6 flex items-baseline gap-1">
                <span className="font-headline text-4xl font-extrabold">{textPrice}</span>
                <span className="font-body text-[#5a6064]">{textBillingCycle}</span>
            </div>
        );
    } else if (topupConfig.transactionType === 'pay-to-use') {
        return (
            <div className="mb-6 flex items-baseline gap-1">
                <span className="font-headline text-4xl font-extrabold">{textPrice}</span>
            </div>
        );
    }
}

function getUIDescription(topupConfig: Prop) {
    let text = "";
    if (topupConfig.transactionType === 'pay-to-use') {
        text = `${topupConfig.creditsIncluded} credits`;
    } else if (topupConfig.transactionType === 'subscription') {
        if (topupConfig.billingCycle === 'monthly') {
            text = `${topupConfig.creditsIncluded} credits / monthly`;
        } else if (topupConfig.billingCycle === 'yearly') {
            text = `${topupConfig.creditsIncluded} credits / yearly`;
        }
    }
    return (
        <CardDescription className="mb-8 font-body text-sm font-medium text-[#5a6064]">
            {text}
        </CardDescription>
    );
}