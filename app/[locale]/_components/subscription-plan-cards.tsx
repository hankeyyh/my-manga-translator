"use client";

import type { ReactNode } from "react";
import { Check } from "lucide-react";
import {
    CcBadge,
    CcButton,
    CcCard,
    CcCardDescription,
    CcCardTitle,
} from "@/components/cc";
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
    /** 卡片更宽松，适合弹窗内展示 */
    spacious?: boolean;
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
    spacious = false,
    onSelectPlan,
    onCancelSubscription,
    onRestoreSubscription,
}: Props) {
    const t = useTranslations("pricing");

    const cardProps = {
        currentTopupConfigId,
        subscriptionStatus,
        adjustMode,
        busy,
        onSelectPlan,
        onCancelSubscription,
        onRestoreSubscription,
        t,
    };

    return (
        <PlanCardGrid spacious={spacious} columns={plans.length}>
            {plans.map((plan) => (
                <PlanCard
                    key={plan.id}
                    plan={plan}
                    spacious={spacious}
                    {...cardProps}
                />
            ))}
        </PlanCardGrid>
    );
}

function PlanCardGrid({
    spacious = false,
    columns = 3,
    children,
}: {
    spacious?: boolean;
    columns?: number;
    children: ReactNode;
}) {
    return (
        <div
            className={cn(
                "grid",
                spacious
                    ? cn(
                        "grid-flow-col auto-cols-fr gap-5",
                        columns >= 4 && "gap-4",
                    )
                    : "gap-4 md:grid-cols-3",
            )}
        >
            {children}
        </div>
    );
}

type PlanCardProps = {
    plan: TopUpConfig;
    spacious?: boolean;
    currentTopupConfigId?: string | null;
    subscriptionStatus?: string | null;
    adjustMode: boolean;
    busy: boolean;
    onSelectPlan: (plan: TopUpConfig) => void;
    onCancelSubscription?: () => void;
    onRestoreSubscription?: () => void;
    t: ReturnType<typeof useTranslations<"pricing">>;
};

function PlanCard({
    plan,
    spacious = false,
    currentTopupConfigId,
    subscriptionStatus,
    adjustMode,
    busy,
    onSelectPlan,
    onCancelSubscription,
    onRestoreSubscription,
    t,
}: PlanCardProps) {
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
            className={cn(
                "h-full min-w-0 cursor-pointer items-stretch text-center antialiased",
                spacious ? "p-7 lg:p-8" : "p-6 lg:p-8",
                "transform-gpu backface-hidden will-change-transform",
                "transition-[transform,box-shadow,background-color] duration-200 ease-out",
                "hover:-translate-y-1 hover:shadow-[var(--cc-shadow-card)]",
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
            <p
                className={cn(
                    "flex items-baseline justify-center font-headline text-3xl font-extrabold text-cc-text-primary",
                    spacious ? "mt-4" : "mt-3",
                )}
            >
                <span>${plan.price}</span>
                {priceSuffix ? (
                    <span className="ms-1 text-base font-medium text-[var(--cc-text-muted)]">
                        {priceSuffix}
                    </span>
                ) : null}
            </p>
            <CcCardDescription className={spacious ? "mt-2" : "mt-1"}>
                {formatCredits(plan, t)}
            </CcCardDescription>
            <p
                className={cn(
                    "w-full rounded-xl px-4 py-3 text-left text-xs leading-relaxed",
                    spacious ? "mt-5" : "mt-4 px-3 py-2.5",
                    promoKind === "payToUse"
                        ? "border border-[var(--cc-border-default)] bg-[var(--cc-surface-muted)] text-[var(--cc-text-secondary)]"
                        : "border border-[var(--cc-status-success)]/15 bg-[var(--cc-status-success-bg)] text-[var(--cc-status-success)]",
                )}
            >
                {getPromoText(plan, t)}
            </p>
            <ul
                className={cn(
                    "w-full flex-1 text-left",
                    spacious ? "mt-5 space-y-3" : "mt-4 space-y-2",
                )}
            >
                {features.map((feature) => (
                    <li
                        key={feature}
                        className="flex items-start gap-2.5 font-body text-sm leading-relaxed text-[var(--cc-text-secondary)]"
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
                    "w-full",
                    spacious ? "mt-8" : "mt-6",
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
}
