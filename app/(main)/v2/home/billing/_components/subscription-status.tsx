import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import type { UserSubscription } from "@/types/do/user-subscription";

type Props = {
    subscription: UserSubscription | null;
};

function capitalize(value: string) {
    if (!value) return value;
    return value.charAt(0).toUpperCase() + value.slice(1);
}

function isActiveSubscription(subscription: UserSubscription | null) {
    return subscription?.status === "active";
}

function formatPriceLabel(price: number | null, billingCycle: string) {
    if (price == null) {
        return billingCycle === "yearly" ? "/yr" : "/mo";
    }
    const amount = Number.isInteger(price) ? `$${price}` : `$${price.toFixed(2)}`;
    const suffix = billingCycle === "yearly" ? "/yr" : "/mo";
    return `${amount}${suffix}`;
}

function formatResetDate(iso: string) {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso.slice(0, 10);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
}

function daysUntil(iso: string) {
    const end = new Date(iso);
    if (Number.isNaN(end.getTime())) return null;
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfEnd = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    return Math.max(
        0,
        Math.round(
            (startOfEnd.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24),
        ),
    );
}

export function SubscriptionStatus({ subscription }: Props) {
    const active = isActiveSubscription(subscription);

    if (active && subscription) {
        const days = daysUntil(subscription.currentPeriodEndedAt);
        const resetLabel =
            days == null
                ? `Resets on ${formatResetDate(subscription.currentPeriodEndedAt)}`
                : `Resets on ${formatResetDate(subscription.currentPeriodEndedAt)} (${days} days)`;

        return (
            <Card className="gap-0 py-4 shadow-none">
                <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 px-4 py-0">
                    <div className="min-w-0 flex-1">
                        <p className="text-xs uppercase tracking-wide text-foreground/70">
                            Current Plan
                        </p>
                        <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
                            <CardTitle className="text-lg">
                                {capitalize(subscription.planTier)}
                            </CardTitle>
                            <span className="text-sm text-muted-foreground">
                                {formatPriceLabel(
                                    subscription.price,
                                    subscription.billingCycle,
                                )}
                            </span>
                        </div>
                        <CardDescription className="mt-1 text-sm">
                            {resetLabel}
                        </CardDescription>
                    </div>
                    <div className="shrink-0">
                        <Button size="sm" type="button" variant="outline">
                            Manage
                        </Button>
                    </div>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card className="gap-0 py-4 shadow-none">
            <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 px-4 py-0">
                <div className="min-w-0 flex-1">
                    <p className="text-xs uppercase tracking-wide text-foreground/70">
                        Current Plan
                    </p>
                    <CardTitle className="mt-1 text-lg">未订阅</CardTitle>
                    <CardDescription className="mt-1 text-sm">
                        订阅后可按周期获得 Credits，并解锁对应套餐权益
                    </CardDescription>
                </div>
                <div className="shrink-0">
                    <Button size="sm" type="button" asChild>
                        <Link href="/v2#pricing">订阅</Link>
                    </Button>
                </div>
            </CardHeader>
        </Card>
    );
}
