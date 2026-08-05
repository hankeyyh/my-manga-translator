"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import type { TopUpConfig } from "@/types/do/topup-config";
import {
    formatCredits,
    formatPrice,
    getPlanName,
    isFeatured,
} from "./plan-display";

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
    return (
        <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan) => {
                const name = getPlanName(plan);
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
                    <Card
                        key={plan.id}
                        className={
                            featured ? "border-2 border-foreground" : undefined
                        }
                    >
                        <CardHeader className="text-center">
                            <CardTitle className="flex items-center justify-center gap-2">
                                {name}
                                {featured && <Badge>★</Badge>}
                            </CardTitle>
                            <p className="text-2xl font-bold">
                                {formatPrice(plan)}
                            </p>
                            <CardDescription>
                                {formatCredits(plan)}
                            </CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Button
                                className="w-full"
                                variant={
                                    canCancelCurrent
                                        ? "destructive"
                                        : canRestoreCurrent
                                            ? "default"
                                            : isCurrentPlan
                                                ? "secondary"
                                                : featured
                                                    ? "default"
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
                                    ? "恢复订阅"
                                    : canCancelCurrent
                                        ? "取消订阅"
                                        : isCurrentPlan
                                            ? "已订阅"
                                            : adjustMode
                                                ? "Adjust Plan"
                                                : "Get Started"}
                            </Button>
                        </CardFooter>
                    </Card>
                );
            })}
        </div>
    );
}
