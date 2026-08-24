"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { ManageSubscriptionDialog } from "@/app/[locale]/home/billing/_components/manage-subscription-dialog";
import {
    CcButton,
    CcCard,
    CcCardDescription,
    CcCardTitle,
} from "@/design/design-system/components";
import type { TopUpConfig } from "@/types/do/topup-config";
import type { UserSubscription } from "@/types/do/user-subscription";
import { useTranslations } from "next-intl";

type Props = {
    subscription: UserSubscription | null;
    topUpConfigs: TopUpConfig[];
};

function capitalize(value: string) {
    if (!value) return value;
    return value.charAt(0).toUpperCase() + value.slice(1);
}

export function SubscriptionStatus({ subscription, topUpConfigs }: Props) {
    const [manageOpen, setManageOpen] = useState(false);
    const t = useTranslations("billing");

    function formatPriceLabel(price: number | null, billingCycle: string) {
        const suffix = billingCycle === "yearly"
            ? t("priceYearlySuffix")
            : t("priceMonthlySuffix");
        if (price == null) {
            return suffix;
        }
        const amount = Number.isInteger(price) ? `$${price}` : `$${price.toFixed(2)}`;
        return `${amount} ${suffix}`;
    }

    function formatResetDate(iso: string) {
        const date = new Date(iso);
        if (Number.isNaN(date.getTime())) return iso.slice(0, 10);
        return t("monthDay", { month: date.getMonth() + 1, day: date.getDate() });
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

    if (subscription) {
        const days = daysUntil(subscription.currentPeriodEndedAt);
        const date = formatResetDate(subscription.currentPeriodEndedAt);
        const resetLabel =
            days == null
                ? t("resetsOn", { date })
                : t("resetsOnWithDays", { date, days });

        return (
            <>
                <CcCard className="rounded-[var(--cc-radius-lg)] p-4 lg:p-4" variant="outlined">
                    <div className="flex flex-row items-center justify-between gap-4">
                        <div className="min-w-0 flex-1">
                            <p className="text-xs uppercase tracking-wide text-cc-text-muted">
                                {t("currentPlan")}
                            </p>
                            <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
                                <CcCardTitle className="text-lg">
                                    {capitalize(subscription.planTier)}
                                </CcCardTitle>
                                <span className="text-sm text-cc-text-muted">
                                    {formatPriceLabel(
                                        subscription.price,
                                        subscription.billingCycle,
                                    )}
                                </span>
                            </div>
                            <CcCardDescription className="mt-1 text-sm">
                                {resetLabel}
                            </CcCardDescription>
                        </div>
                        <div className="shrink-0">
                            <CcButton
                                size="sm"
                                type="button"
                                variant="outline"
                                onClick={() => setManageOpen(true)}
                            >
                                {t("manage")}
                            </CcButton>
                        </div>
                    </div>
                </CcCard>
                <ManageSubscriptionDialog
                    open={manageOpen}
                    onOpenChange={setManageOpen}
                    topUpConfigs={topUpConfigs}
                    currentSubscription={subscription}
                />
            </>
        );
    }

    return (
        <CcCard className="rounded-[var(--cc-radius-lg)] p-4 lg:p-4" variant="outlined">
            <div className="flex flex-row items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <p className="text-xs uppercase tracking-wide text-cc-text-muted">
                        {t("currentPlan")}
                    </p>
                    <CcCardTitle className="mt-1 text-lg">{t("unsubscribed")}</CcCardTitle>
                    <CcCardDescription className="mt-1 text-sm">
                        {t("unsubscribedHint")}
                    </CcCardDescription>
                </div>
                <div className="shrink-0">
                    <CcButton size="sm" type="button" asChild>
                        <Link href="/#pricing">{t("subscribe")}</Link>
                    </CcButton>
                </div>
            </div>
        </CcCard>
    );
}
