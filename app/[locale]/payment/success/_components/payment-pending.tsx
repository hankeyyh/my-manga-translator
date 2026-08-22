"use client";

import { Manrope, Inter } from "next/font/google";
import { Clock } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { cn } from "@/components/utils";

const manrope = Manrope({
    subsets: ["latin"],
    weight: ["400", "700", "800"],
    variable: "--font-manrope",
});

const inter = Inter({
    subsets: ["latin"],
    weight: ["400", "500", "600"],
    variable: "--font-inter",
});

interface Props {
    email?: string;
}

export default function PendingPaymentDisplay({ email }: Props) {
    const router = useRouter();

    return (
        <div
            className={cn(
                manrope.variable,
                inter.variable,
                "flex min-h-screen flex-col bg-[#f8f9fb] font-body text-[#2d3337]",
            )}
        >
            <div aria-hidden className="h-16 shrink-0" />

            <main className="flex flex-1 flex-col items-center justify-center px-8 py-12">
                <div className="w-full max-w-md">
                    <Card
                        className={cn(
                            "gap-4 py-4",
                            "overflow-hidden rounded-3xl border-[#eef0f3] bg-white shadow-[0_4px_20px_rgba(15,23,42,0.08)]",
                        )}
                    >
                        <CardHeader className="justify-items-center gap-4 pb-2 text-center">
                            <div className="flex size-14 items-center justify-center rounded-full bg-amber-500/10">
                                <Clock
                                    aria-hidden
                                    className="size-8 text-amber-600"
                                    strokeWidth={2}
                                />
                            </div>
                            <CardTitle
                                className={cn(
                                    "font-headline text-2xl font-bold tracking-tight text-[#2d3337]",
                                )}
                            >
                                Payment Processing
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 pb-0 text-center text-sm leading-relaxed text-[#2d3337]/85">
                            <p>
                                Your payment is being confirmed. Credits will be
                                added to your account once the payment clears.
                            </p>
                            {email ? (
                                <p>
                                    We will notify{" "}
                                    <span className="font-medium text-[#2d3337]">
                                        {email}
                                    </span>{" "}
                                    when it is complete.
                                </p>
                            ) : null}
                            <p className="text-muted-foreground">
                                This may take a few minutes or longer depending
                                on your payment method. You can leave this page
                                safely.
                            </p>
                        </CardContent>
                        <CardFooter className="flex justify-center pb-4 pt-0">
                            <Button
                                className="bg-gradient-to-br from-[#3370FF] to-[#2e6dfc] font-headline text-base font-bold text-white shadow-lg shadow-[#3370FF]/20 hover:from-[#3370FF]/90 hover:to-[#2e6dfc]/90"
                                onClick={() => router.push("/")}
                                size="lg"
                                variant="default"
                            >
                                Back to Home
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </main>
        </div>
    );
}
