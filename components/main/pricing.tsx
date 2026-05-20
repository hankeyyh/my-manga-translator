"use client"

import { CheckCircle2 } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { cn } from "../utils";
import { Badge } from "../ui/badge";
import router from "next/router";
import { createBrowserClient } from "@/lib/utils/supabase/client";
import { UserRepository } from "@/lib/repositories/auth/user-repository";
import { SubscriptionTier } from "@/lib/services/payment/topup-prices";
import { useState } from "react";

export function Pricing() {
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
    
    async function handlePayment(tier: SubscriptionTier) {
        try {
            const supabase = createBrowserClient();
            const userRepo = new UserRepository(supabase);
            const userResult = await userRepo.getCurrentUser();
            if (userResult.error || !userResult.data) {
                router.push("/auth/login");
                return;
            }
            const res = await fetch("/api/checkout-sessions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tier,
                    billing: billingCycle,
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
    
    return (
        <section className="scroll-mt-16 bg-[#f8f9fb] px-8 py-24" id="pricing">
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
                                billingCycle === "monthly"
                                    ? "bg-white text-[#3370FF] shadow-sm hover:bg-white"
                                    : "bg-transparent text-[#5a6064] hover:text-[#2d3337]",
                            )}
                            onClick={() => setBillingCycle("monthly")}
                            variant="ghost"
                        >
                            Monthly
                        </Button>
                        <Button
                            className={cn(
                                "rounded-full px-6 py-2 font-body text-sm font-bold",
                                billingCycle === "yearly"
                                    ? "bg-white text-[#3370FF] shadow-sm hover:bg-white"
                                    : "bg-transparent text-[#5a6064] hover:text-[#2d3337]",
                            )}
                            onClick={() => setBillingCycle("yearly")}
                            variant="ghost"
                        >
                            Yearly (Save 20%)
                        </Button>
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    <Card className="flex flex-col rounded-[2rem] border border-[#adb3b7]/10 bg-white p-10 shadow-sm transition-shadow hover:shadow-xl">
                        <CardHeader className="p-0">
                            <CardTitle className="mb-2 font-headline text-xl font-bold">
                                Basic
                            </CardTitle>
                            <div className="mb-6 flex items-baseline gap-1">
                                <span className="font-headline text-4xl font-extrabold">$8</span>
                                <span className="font-body text-[#5a6064]">/monthly</span>
                            </div>
                            <CardDescription className="mb-8 font-body text-sm font-medium text-[#5a6064]">
                                1800 translations/mo
                            </CardDescription>
                        </CardHeader>
                        <Button
                            className="mb-10 rounded-xl border-2 border-[#3370FF] bg-transparent font-headline font-bold text-[#3370FF] hover:bg-[#3370FF] hover:text-white"
                            variant="outline"
                            onClick={() => handlePayment("basic")}
                        >
                            Get Started
                        </Button>
                        <ul className="flex flex-col gap-4">
                            {[
                                "Priority professional recognition",
                                "Standard translation models",
                                "10% bonus translations",
                                "No watermark",
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

                    <Card className="relative z-10 flex scale-105 flex-col rounded-[2rem] border-4 border-[#3370FF] bg-white p-10 shadow-xl">
                        <Badge className="absolute -top-5 left-1/2 -translate-x-1/2 border-0 bg-[#3370FF] px-6 py-1 font-body text-xs font-bold uppercase tracking-widest text-white hover:bg-[#3370FF]">
                            Recommended
                        </Badge>
                        <CardHeader className="p-0">
                            <div className="mb-2 flex items-start justify-between">
                                <CardTitle className="font-headline text-xl font-bold">Pro</CardTitle>
                                <Badge
                                    className="border-0 bg-[#fa746f]/10 px-2 py-0.5 font-body text-[10px] font-bold uppercase tracking-tighter text-[#a83836] hover:bg-[#fa746f]/20"
                                    variant="secondary"
                                >
                                    Save 4%
                                </Badge>
                            </div>
                            <div className="mb-6 flex items-baseline gap-1">
                                <span className="font-headline text-4xl font-extrabold">$30</span>
                                <span className="font-body text-[#5a6064]">/monthly</span>
                            </div>
                            <CardDescription className="mb-8 font-body text-sm font-medium text-[#5a6064]">
                                7000 translations/mo
                            </CardDescription>
                        </CardHeader>
                        <Button
                            className="mb-10 rounded-xl bg-[#3370FF] font-headline font-bold text-white shadow-lg shadow-[#3370FF]/30 hover:scale-[1.02] hover:bg-[#3370FF]/90 active:scale-95"
                            onClick={() => handlePayment("pro")}
                        >
                            Get Started
                        </Button>
                        <ul className="flex flex-col gap-4">
                            {[
                                "Fast priority processing",
                                "GPT-4o & specialized models",
                                "Advanced redrawing tools",
                                "Bulk upload (100 images)",
                            ].map((text) => (
                                <li
                                    key={text}
                                    className="flex items-start gap-3 font-body text-sm text-[#2d3337]"
                                >
                                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#3370FF]" />
                                    {text}
                                </li>
                            ))}
                        </ul>
                    </Card>

                    <Card className="flex flex-col rounded-[2rem] border border-[#adb3b7]/10 bg-white p-10 shadow-sm transition-shadow hover:shadow-xl">
                        <CardHeader className="p-0">
                            <CardTitle className="mb-2 font-headline text-xl font-bold">
                                Ultra
                            </CardTitle>
                            <div className="mb-6 flex items-baseline gap-1">
                                <span className="font-headline text-4xl font-extrabold">$80</span>
                                <span className="font-body text-[#5a6064]">/monthly</span>
                            </div>
                            <CardDescription className="mb-8 font-body text-sm font-medium text-[#5a6064]">
                                Unlimited translations
                            </CardDescription>
                        </CardHeader>
                        <Button
                            className="mb-10 rounded-xl border-2 border-[#3370FF] bg-transparent font-headline font-bold text-[#3370FF] hover:bg-[#3370FF] hover:text-white"
                            variant="outline"
                            onClick={() => handlePayment("ultra")}
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
                </div>
            </div>
        </section>
    )
}