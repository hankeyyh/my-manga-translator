"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cancelSubscription } from "@/actions/cancel-subscription";
import { restoreSubscription } from "@/actions/restore-subscription";
import { ChangePlanConfirmDialog } from "@/app/[locale]/_components/change-plan-confirm-dialog";
import { SubscriptionPlanCards } from "@/app/[locale]/_components/subscription-plan-cards";
import { useChangeSubscription } from "@/app/[locale]/_components/use-change-subscription";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { SUCCESS_CODE } from "@/types/dto/response";
import type { TopUpConfig } from "@/types/do/topup-config";
import type { UserSubscription } from "@/types/do/user-subscription";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    topUpConfigs: TopUpConfig[];
    currentSubscription: UserSubscription;
};

function capitalize(value: string) {
    if (!value) return value;
    return value.charAt(0).toUpperCase() + value.slice(1);
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

export function ManageSubscriptionDialog({
    open,
    onOpenChange,
    topUpConfigs,
    currentSubscription,
}: Props) {
    const router = useRouter();
    const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);
    const {
        pendingPlan,
        isChanging,
        requestChange,
        cancelPending,
        confirmChange,
    } = useChangeSubscription();

    const plans = topUpConfigs
        .filter((config) => config.transactionType === "subscription")
        .sort((a, b) => a.price - b.price);

    const isCanceled = currentSubscription.status === "canceled";
    const busy = isChanging || isCancelling || isRestoring;

    async function handleConfirmCancel() {
        if (isCancelling) return;
        setIsCancelling(true);
        try {
            const result = await cancelSubscription();
            if (result.code !== SUCCESS_CODE) {
                toast.error(result.message || "取消订阅失败");
                return;
            }
            toast.success(result.message || "已提交取消订阅");
            setCancelConfirmOpen(false);
            onOpenChange(false);
            router.refresh();
        } catch (error) {
            console.error("Cancel subscription error", error);
            toast.error("取消订阅失败");
        } finally {
            setIsCancelling(false);
        }
    }

    async function handleRestore() {
        if (isRestoring) return;
        setIsRestoring(true);
        try {
            const result = await restoreSubscription();
            if (result.code !== SUCCESS_CODE) {
                toast.error(result.message || "恢复订阅失败");
                return;
            }
            toast.success(result.message || "已恢复订阅");
            onOpenChange(false);
            router.refresh();
        } catch (error) {
            console.error("Restore subscription error", error);
            toast.error("恢复订阅失败");
        } finally {
            setIsRestoring(false);
        }
    }

    return (
        <>
            <Dialog
                open={open}
                onOpenChange={(next) => {
                    if (busy) return;
                    onOpenChange(next);
                }}
            >
                <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto border-cc-border bg-cc-surface-white text-cc-text-primary">
                    <DialogHeader>
                        <DialogTitle>管理订阅</DialogTitle>
                        <DialogDescription>
                            当前方案：{capitalize(currentSubscription.planTier)}{" "}
                            {formatPriceLabel(
                                currentSubscription.price,
                                currentSubscription.billingCycle,
                            )}
                            ，周期至{" "}
                            {formatResetDate(
                                currentSubscription.currentPeriodEndedAt,
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    <SubscriptionPlanCards
                        plans={plans}
                        currentTopupConfigId={currentSubscription.topupConfigId}
                        subscriptionStatus={currentSubscription.status}
                        adjustMode
                        busy={busy}
                        onSelectPlan={requestChange}
                        onCancelSubscription={
                            isCanceled
                                ? undefined
                                : () => setCancelConfirmOpen(true)
                        }
                        onRestoreSubscription={
                            isCanceled
                                ? () => {
                                    void handleRestore();
                                }
                                : undefined
                        }
                    />
                </DialogContent>
            </Dialog>

            <ChangePlanConfirmDialog
                pendingPlan={pendingPlan}
                isChanging={isChanging}
                onOpenChange={(nextOpen) => {
                    if (!nextOpen) cancelPending();
                }}
                onConfirm={() => {
                    void confirmChange();
                }}
            />

            <AlertDialog
                open={cancelConfirmOpen}
                onOpenChange={(next) => {
                    if (!next && !isCancelling) setCancelConfirmOpen(false);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>确认取消订阅？</AlertDialogTitle>
                        <AlertDialogDescription>
                            订阅将于{" "}
                            {formatResetDate(
                                currentSubscription.currentPeriodEndedAt,
                            )}{" "}
                            结束后失效。期内仍可使用当前方案权益，现有积分将保留。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isCancelling}>
                            再想想
                        </AlertDialogCancel>
                        <AlertDialogAction
                            disabled={isCancelling}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={(e) => {
                                e.preventDefault();
                                void handleConfirmCancel();
                            }}
                        >
                            {isCancelling ? "处理中…" : "确认取消"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
