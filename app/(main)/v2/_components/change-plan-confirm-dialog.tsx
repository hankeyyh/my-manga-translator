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
    return (
        <AlertDialog
            open={pendingPlan !== null}
            onOpenChange={(open) => {
                if (!open && !isChanging) onOpenChange(false);
            }}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>确认调整订阅计划？</AlertDialogTitle>
                    <AlertDialogDescription>
                        {pendingPlan
                            ? `将调整为 ${getPlanName(pendingPlan)}（${formatPrice(pendingPlan)}）。差价不会退回，现有积分将保留，确认后立即按新计划价格扣费。`
                            : null}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isChanging}>
                        取消
                    </AlertDialogCancel>
                    <AlertDialogAction
                        disabled={isChanging}
                        onClick={(e) => {
                            e.preventDefault();
                            onConfirm();
                        }}
                    >
                        {isChanging ? "处理中…" : "确认调整"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
