"use client";

import { Manrope, Inter } from "next/font/google";
import { CircleX } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

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
    status?: string | null;
    paymentStatus?: string;
}

export default function PaymentIncompleteDisplay({
    status,
    paymentStatus,
}: Props) {
    const router = useRouter();
    const t = useTranslations("payment.incomplete");
    const message =
        status === "expired"
            ? t("expired")
            : paymentStatus === "no_payment_required"
                ? t("noPaymentRequired")
                : t("generic");

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
                            <div className="flex size-14 items-center justify-center rounded-full bg-red-500/10">
                                <CircleX
                                    aria-hidden
                                    className="size-8 text-red-600"
                                    strokeWidth={2}
                                />
                            </div>
                            <CardTitle
                                className={cn(
                                    "font-headline text-2xl font-bold tracking-tight text-[#2d3337]",
                                )}
                            >
                                {t("title")}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 pb-0 text-center text-sm leading-relaxed text-[#2d3337]/85">
                            <p>{message}</p>
                            <p className="text-muted-foreground">
                                {t("hint")}
                            </p>
                        </CardContent>
                        <CardFooter className="flex flex-col justify-center gap-3 pb-4 pt-0 sm:flex-row">
                            <Button
                                className="w-full bg-gradient-to-br from-[#3370FF] to-[#2e6dfc] font-headline text-base font-bold text-white shadow-lg shadow-[#3370FF]/20 hover:from-[#3370FF]/90 hover:to-[#2e6dfc]/90 sm:w-auto"
                                onClick={() => router.push("/#pricing")}
                                size="lg"
                            >
                                {t("tryAgain")}
                            </Button>
                            <Button
                                className="w-full font-headline text-base font-semibold sm:w-auto"
                                onClick={() => router.push("/")}
                                size="lg"
                                variant="outline"
                            >
                                {t("backHome")}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </main>
        </div>
    );
}
