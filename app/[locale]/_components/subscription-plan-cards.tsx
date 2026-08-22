"use client";

import {
    CcBadge,
    CcButton,
    CcCard,
    CcCardDescription,
    CcCardTitle,
} from "@/design/design-system/components";
import type { TopUpConfig } from "@/types/do/topup-config";
import {
    formatCredits,
    formatPrice,
    getPlanName,
    isFeatured,
} from "./plan-display";
import { useTranslations } from "next-intl";

type Props = {
    plans: TopUpConfig[];
    currentTopupConfigId?: string | null;
    /** 当前订阅状态：active 显示取消/已订阅；canceled 显示恢复订阅 */
    subscriptionStatus?: string | null;
    /** 已有订阅时，非当前方案按钮显示 Adjust Plan */
    adjustMode?: boolean;
    busy?: boolean;
    onSelectPlan: (plan: TopUpConfig) => void;
    /** status=active 时，当前方案按钮为「取消订阅」 */
    onCancelSubscription?: () => void;
    /** status=canceled 时，当前方案按钮为「恢复订阅」 */
    onRestoreSubscription?: () => void;
};

export function SubscriptionPlanCards({
    plans,
    currentTopupConfigId,
    subscriptionStatus,
    adjustMode = false,
    busy = false,
    onSelectPlan,
    onCancelSubscription,
    onRestoreSubscription,
}: Props) {
    const t = useTranslations("pricing");
    return (
        <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan) => {
                const name = getPlanName(plan, t);
                const featured = isFeatured(plan);
                const isCurrentPlan = currentTopupConfigId === plan.id;
                const canRestoreCurrent =
                    isCurrentPlan &&
                    subscriptionStatus === "canceled" &&
                    Boolean(onRestoreSubscription);
                const canCancelCurrent =
                    isCurrentPlan &&
                    subscriptionStatus === "active" &&
                    Boolean(onCancelSubscription);
                return (
                    <CcCard
                        key={plan.id}
                        className="items-center p-6 text-center lg:p-8"
                        variant={featured ? "featured" : "outlined"}
                    >
                        <CcCardTitle className="flex items-center justify-center gap-2">
                            {name}
                            {featured && <CcBadge>★</CcBadge>}
                        </CcCardTitle>
                        <p className="mt-3 font-headline text-3xl font-extrabold text-cc-text-primary">
                            {formatPrice(plan, t)}
                        </p>
                        <CcCardDescription className="mt-1">
                            {formatCredits(plan, t)}
                        </CcCardDescription>
                        <CcButton
                            className="mt-6 w-full"
                            variant={
                                canCancelCurrent
                                    ? "destructive"
                                    : canRestoreCurrent
                                        ? "primary"
                                        : isCurrentPlan
                                            ? "secondary"
                                            : featured
                                                ? "primary"
                                                : "outline"
                            }
                            disabled={
                                (isCurrentPlan &&
                                    !canCancelCurrent &&
                                    !canRestoreCurrent) ||
                                busy
                            }
                            onClick={
                                canRestoreCurrent
                                    ? onRestoreSubscription
                                    : canCancelCurrent
                                        ? onCancelSubscription
                                        : isCurrentPlan
                                            ? undefined
                                            : () => onSelectPlan(plan)
                            }
                        >
                            {canRestoreCurrent
                                ? t("restore")
                                : canCancelCurrent
                                    ? t("cancel")
                                    : isCurrentPlan
                                        ? t("subscribed")
                                        : adjustMode
                                            ? t("adjustPlan")
                                            : t("getStarted")}
                        </CcButton>
                    </CcCard>
                );
            })}
        </div>
    );
}
