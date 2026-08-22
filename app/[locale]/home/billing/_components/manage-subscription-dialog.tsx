"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
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
import { useTranslations } from "next-intl";

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

function formatPriceLabel(
    price: number | null,
    billingCycle: string,
    t: ReturnType<typeof useTranslations<"billing">>,
) {
    const suffix = billingCycle === "yearly" ? t("priceYearlySuffix") : t("priceMonthlySuffix");
    if (price == null) {
        return suffix;
    }
    const amount = Number.isInteger(price) ? `$${price}` : `$${price.toFixed(2)}`;
    return `${amount}${suffix}`;
}

function formatResetDate(iso: string, t: ReturnType<typeof useTranslations<"billing">>) {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return iso.slice(0, 10);
    return t("monthDay", { month: date.getMonth() + 1, day: date.getDate() });
}

export function ManageSubscriptionDialog({
    open,
    onOpenChange,
    topUpConfigs,
    currentSubscription,
}: Props) {
    const router = useRouter();
    const t = useTranslations("manageSubscription");
    const tBilling = useTranslations("billing");
    const tCommon = useTranslations("common");
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
                toast.error(result.message || t("cancelFailed"));
                return;
            }
            toast.success(result.message || t("cancelSubmitted"));
            setCancelConfirmOpen(false);
            onOpenChange(false);
            router.refresh();
        } catch (error) {
            console.error("Cancel subscription error", error);
            toast.error(t("cancelFailed"));
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
                toast.error(result.message || t("restoreFailed"));
                return;
            }
            toast.success(result.message || t("restored"));
            onOpenChange(false);
            router.refresh();
        } catch (error) {
            console.error("Restore subscription error", error);
            toast.error(t("restoreFailed"));
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
                        <DialogTitle>{t("title")}</DialogTitle>
                        <DialogDescription>
                            {t("currentPlan", {
                                plan: capitalize(currentSubscription.planTier),
                                price: formatPriceLabel(
                                    currentSubscription.price,
                                    currentSubscription.billingCycle,
                                    tBilling,
                                ),
                                date: formatResetDate(
                                    currentSubscription.currentPeriodEndedAt,
                                    tBilling,
                                ),
                            })}
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
                        <AlertDialogTitle>{t("cancelTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("cancelDescription", {
                                date: formatResetDate(
                                    currentSubscription.currentPeriodEndedAt,
                                    tBilling,
                                ),
                            })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isCancelling}>
                            {t("thinkAgain")}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            disabled={isCancelling}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={(e) => {
                                e.preventDefault();
                                void handleConfirmCancel();
                            }}
                        >
                            {isCancelling ? tCommon("processing") : t("confirmCancel")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
