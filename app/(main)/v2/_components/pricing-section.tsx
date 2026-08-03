"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

const PAY_AS_NEEDED = [
    {
        name: "Basic",
        price: "$0",
        desc: "试用 · 无需账户",
        featured: false,
    },
    {
        name: "Pro",
        price: "$0.020/page",
        desc: "页数包 · 永不过期",
        featured: true,
    },
    {
        name: "Ultra",
        price: "$0.018/page",
        desc: "大额页数包",
        featured: false,
    },
];

const SUBSCRIPTION = [
    {
        name: "Basic",
        price: "$0.015/page",
        desc: "入门订阅",
        featured: false,
    },
    {
        name: "Pro",
        price: "$0.013/page",
        desc: "高频用户",
        featured: true,
    },
    {
        name: "Ultra",
        price: "$0.010/page",
        desc: "重度订阅",
        featured: false,
    },
];

export function PricingSection() {
    const [pricingTab, setPricingTab] = useState<"pay" | "sub">("sub");
    const plans = pricingTab === "pay" ? PAY_AS_NEEDED : SUBSCRIPTION;

    return (
        <section id="pricing" className="scroll-mt-16 py-16">
            <div className="mx-auto max-w-5xl px-4">
                <h2 className="mb-6 text-center text-2xl font-semibold">价格</h2>
                <div className="mb-8 flex justify-center gap-2">
                    <Button
                        variant={pricingTab === "pay" ? "default" : "outline"}
                        onClick={() => setPricingTab("pay")}
                    >
                        Pay As Needed
                    </Button>
                    <Button
                        variant={pricingTab === "sub" ? "default" : "outline"}
                        onClick={() => setPricingTab("sub")}
                    >
                        Subscription
                    </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    {plans.map((plan) => (
                        <Card
                            key={plan.name}
                            className={plan.featured ? "border-2 border-foreground" : undefined}
                        >
                            <CardHeader className="text-center">
                                <CardTitle className="flex items-center justify-center gap-2">
                                    {plan.name}
                                    {plan.featured && <Badge>★</Badge>}
                                </CardTitle>
                                <p className="text-2xl font-bold">{plan.price}</p>
                                <CardDescription>{plan.desc}</CardDescription>
                            </CardHeader>
                            <CardFooter>
                                <Button
                                    className="w-full"
                                    variant={plan.featured ? "default" : "outline"}
                                >
                                    Get Started
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
