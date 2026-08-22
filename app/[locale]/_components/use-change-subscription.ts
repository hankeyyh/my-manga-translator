"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { changeSubscription } from "@/actions/change-subscription";
import { loadStripeClient } from "@/biz/utils/stripe/client";
import {
    SUCCESS_CODE,
    UNAUTHORIZED_ERROR_CODE,
} from "@/types/dto/response";
import type { TopUpConfig } from "@/types/do/topup-config";

export function useChangeSubscription() {
    const [pendingPlan, setPendingPlan] = useState<TopUpConfig | null>(null);
    const [isChanging, setIsChanging] = useState(false);
    const router = useRouter();
    const t = useTranslations("changePlan");

    function requestChange(plan: TopUpConfig) {
        setPendingPlan(plan);
    }

    function cancelPending() {
        if (!isChanging) setPendingPlan(null);
    }

    async function confirmChange() {
        if (!pendingPlan || isChanging) return;
        setIsChanging(true);
        try {
            const result = await changeSubscription({
                topupConfigId: pendingPlan.id,
            });
            if (result.code === UNAUTHORIZED_ERROR_CODE) {
                setPendingPlan(null);
                router.push("/auth/login");
                return;
            }
            if (result.code !== SUCCESS_CODE || !result.data) {
                toast.error(result.message || t("failed"));
                return;
            }
            if (result.data.status === "requires_action") {
                const clientSecret = result.data.clientSecret;
                if (!clientSecret) {
                    toast.error(t("missingPaymentInfo"));
                    return;
                }
                const stripeClient = await loadStripeClient();
                if (!stripeClient) {
                    toast.error(t("stripeLoadFailed"));
                    return;
                }
                toast.message(t("needCardVerification"));
                const { error, paymentIntent } =
                    await stripeClient.confirmCardPayment(clientSecret);
                if (error) {
                    toast.error(error.message || t("cardVerificationFailed"));
                    return;
                }
                if (paymentIntent?.status === "succeeded") {
                    toast.success(t("verified"));
                } else {
                    toast.message(
                        t("paymentStatus", { status: paymentIntent?.status ?? "unknown" }),
                    );
                }
            } else if (result.data.status === "success") {
                toast.success(t("submitted"));
            }
            setPendingPlan(null);
            router.refresh();
        } catch (error) {
            console.error("Change subscription error", error);
            toast.error(t("failed"));
        } finally {
            setIsChanging(false);
        }
    }

    return {
        pendingPlan,
        isChanging,
        requestChange,
        cancelPending,
        confirmChange,
    };
}
