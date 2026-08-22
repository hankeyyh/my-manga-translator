"use client";

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
import type { TopUpConfig } from "@/types/do/topup-config";
import { useTranslations } from "next-intl";
import { formatPrice, getPlanName } from "./plan-display";

type Props = {
    pendingPlan: TopUpConfig | null;
    isChanging: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
};

export function ChangePlanConfirmDialog({
    pendingPlan,
    isChanging,
    onOpenChange,
    onConfirm,
}: Props) {
    const t = useTranslations("changePlan");
    const tPricing = useTranslations("pricing");
    const tCommon = useTranslations("common");

    return (
        <AlertDialog
            open={pendingPlan !== null}
            onOpenChange={(open) => {
                if (!open && !isChanging) onOpenChange(false);
            }}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t("title")}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {pendingPlan
                            ? t("description", {
                                planName: getPlanName(pendingPlan, tPricing),
                                price: formatPrice(pendingPlan, tPricing),
                            })
                            : null}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isChanging}>
                        {tCommon("cancel")}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        disabled={isChanging}
                        onClick={(e) => {
                            e.preventDefault();
                            onConfirm();
                        }}
                    >
                        {isChanging ? tCommon("processing") : t("confirm")}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
