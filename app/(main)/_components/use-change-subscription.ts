"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
                toast.error(result.message || "调整计划失败");
                return;
            }
            if (result.data.status === "requires_action") {
                const clientSecret = result.data.clientSecret;
                if (!clientSecret) {
                    toast.error("缺少支付确认信息，请稍后重试");
                    return;
                }
                const stripeClient = await loadStripeClient();
                if (!stripeClient) {
                    toast.error("支付组件加载失败，请稍后重试");
                    return;
                }
                toast.message("需要完成银行卡验证后才会生效，请按提示完成验证");
                const { error, paymentIntent } =
                    await stripeClient.confirmCardPayment(clientSecret);
                if (error) {
                    toast.error(error.message || "银行卡验证失败");
                    return;
                }
                if (paymentIntent?.status === "succeeded") {
                    toast.success("验证成功，计划调整已提交，积分将稍后到账");
                } else {
                    toast.message(
                        `支付状态：${paymentIntent?.status ?? "unknown"}，请稍后刷新查看`,
                    );
                }
            } else if (result.data.status === "success") {
                toast.success("计划调整已提交，积分将稍后到账");
            }
            setPendingPlan(null);
            router.refresh();
        } catch (error) {
            console.error("Change subscription error", error);
            toast.error("调整计划失败");
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
