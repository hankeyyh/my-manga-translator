"use client";

import { Manrope, Inter } from "next/font/google";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils/utils";

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
    email: string;
}

export default function SuccessDisplay({ email }: Props) {
    const router = useRouter();
    const [seconds, setSeconds] = useState(5); // 倒计时5s返回
    useEffect(() => {
        const intervalId = setInterval(() => {
            setSeconds((prev) => {
                if (prev <= 0) {
                    clearInterval(intervalId);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        if (seconds === 0) {
            router.push("/translate");
        }
    }, [seconds, router]);

    function handleClick() {
        router.push("/translate");
    }

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
                            "overflow-hidden rounded-3xl border-[#eef0f3] bg-white shadow-[0_4px_20px_rgba(15,23,42,0.08)]",
                        )}
                    >
                        <CardHeader className="items-center space-y-4 pb-2 text-center">
                            <div className="flex size-14 items-center justify-center rounded-full bg-[#3370FF]/10">
                                <CheckCircle2
                                    aria-hidden
                                    className="size-8 text-[#3370FF]"
                                    strokeWidth={2}
                                />
                            </div>
                            <CardTitle
                                className={cn(
                                    "font-headline text-2xl font-bold tracking-tight text-[#2d3337]",
                                )}
                            >
                                Subscription Success
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 pb-6 text-center text-sm leading-relaxed text-[#2d3337]/85">
                            <p>
                                Thanks for your subscription! A confirmation
                                email will be sent to{" "}
                                <span className="font-medium text-[#2d3337]">
                                    {email}
                                </span>
                                .
                            </p>
                            <p className="text-muted-foreground">
                                Redirecting to the translator in {seconds}s…
                            </p>
                        </CardContent>
                        <CardFooter className="flex justify-center pb-8 pt-0">
                            <Button
                                className="bg-gradient-to-br from-[#3370FF] to-[#2e6dfc] font-headline text-base font-bold text-white shadow-lg shadow-[#3370FF]/20 hover:from-[#3370FF]/90 hover:to-[#2e6dfc]/90"
                                onClick={handleClick}
                                size="lg"
                            >
                                Start Translating
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </main>
        </div>
    );
}
