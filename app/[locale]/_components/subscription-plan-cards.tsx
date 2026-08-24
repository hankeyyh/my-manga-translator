"use client";

import { Check } from "lucide-react";
import {
    CcBadge,
    CcButton,
    CcCard,
    CcCardDescription,
    CcCardTitle,
} from "@/design/design-system/components";
import { cn } from "@/components/utils";
import type { TopUpConfig } from "@/types/do/topup-config";
import {
    formatCredits,
    getPlanFeatures,
    getPlanName,
    getPriceSuffix,
    getPromoKind,
    getPromoText,
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
                const promoKind = getPromoKind(plan);
                const features = getPlanFeatures(plan, t);
                const priceSuffix = getPriceSuffix(plan, t);
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
                        className={cn(
                            "h-full cursor-pointer items-stretch bg-[#fbfcfe] p-6 text-center antialiased lg:p-8",
                            "transform-gpu backface-hidden will-change-transform",
                            "transition-[transform,box-shadow,background-color] duration-200 ease-out",
                            "hover:-translate-y-1 hover:bg-[var(--cc-surface-white)] hover:shadow-[var(--cc-shadow-card)]",
                            featured
                                ? undefined
                                : "border-[var(--cc-border-light)] shadow-none",
                        )}
                        variant={featured ? "featured" : "outlined"}
                    >
                        <CcCardTitle className="flex items-center justify-center gap-2">
                            {name}
                            {featured && <CcBadge>★</CcBadge>}
                        </CcCardTitle>
                        <p className="mt-3 flex items-baseline justify-center font-headline text-3xl font-extrabold text-cc-text-primary">
                            <span>${plan.price}</span>
                            {priceSuffix ? (
                                <span className="ms-1 text-base font-medium text-[var(--cc-text-muted)]">
                                    {priceSuffix}
                                </span>
                            ) : null}
                        </p>
                        <CcCardDescription className="mt-1">
                            {formatCredits(plan, t)}
                        </CcCardDescription>
                        <p
                            className={cn(
                                "mt-4 w-full rounded-xl px-3 py-2.5 text-left text-xs leading-relaxed",
                                promoKind === "payToUse"
                                    ? "border border-[var(--cc-border-default)] bg-[var(--cc-surface-muted)] text-[var(--cc-text-secondary)]"
                                    : "border border-[var(--cc-status-success)]/15 bg-[var(--cc-status-success-bg)] text-[var(--cc-status-success)]",
                            )}
                        >
                            {getPromoText(plan, t)}
                        </p>
                        <ul className="mt-4 w-full flex-1 space-y-2 text-left">
                            {features.map((feature) => (
                                <li
                                    key={feature}
                                    className="flex items-start gap-2 font-body text-sm text-[var(--cc-text-secondary)]"
                                >
                                    <Check
                                        className="mt-0.5 size-4 shrink-0 text-[var(--cc-brand-primary)]"
                                        strokeWidth={2.5}
                                    />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <CcButton
                            className={cn(
                                "mt-6 w-full",
                                !featured &&
                                    !isCurrentPlan &&
                                    !canCancelCurrent &&
                                    !canRestoreCurrent &&
                                    "hover:bg-[var(--cc-brand-primary)] hover:text-[var(--cc-text-on-brand)]",
                            )}
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
