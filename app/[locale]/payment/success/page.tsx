import { Suspense } from "react";
import { redirect } from "@/i18n/navigation";
import { createServerClient } from "@/biz/utils/supabase/server";
import { UserRepository } from "@/biz/repositories/auth/user-repository";
import { PaymentService } from "@/biz/services/payment/payment-service";
import PaymentIncompleteDisplay from "@/app/[locale]/payment/success/_components/payment-incomplete";
import PendingPaymentDisplay from "@/app/[locale]/payment/success/_components/payment-pending";
import SuccessDisplay from "@/app/[locale]/payment/success/_components/payment-success";
import { createStripeClient } from "@/biz/utils/stripe/server";
import { getLocale, getTranslations } from "next-intl/server";

export default async function PaymentSuccessPage({ searchParams }: { searchParams: Promise<{ session_id: string; }>; }) {
    const t = await getTranslations("payment");
    return (
        <Suspense fallback={<p>{t("loading")}</p>}>
            <PaymentSuccessDetail searchParams={searchParams} />
        </Suspense>
    );
}

async function PaymentSuccessDetail({ searchParams }: { searchParams: Promise<{ session_id: string; }>; }) {
    const { session_id: sessionId } = await searchParams;

    // 1. 获取stripe session
    const supabase = await createServerClient();
    const paymentService = new PaymentService(
        createStripeClient(),
        new UserRepository(supabase)
    );
    const result = await paymentService.retriveCheckoutSession(sessionId);
    if (result.error) {
        const t = await getTranslations("payment");
        return <div>{t("error", { message: result.error.message })}</div>;
    }
    // 2. 状态检查
    const { status, paymentStatus, email } = result.data!;
    // 2.1 不应该出现
    if (status === "open") {
        return redirect({ href: "/", locale: await getLocale() });
    }
    // 2.2 款已到账
    if (status === "complete" && paymentStatus == "paid") {
        return (
            <SuccessDisplay email={email ?? ""} />
        );
    }
    // 2.3 异步支付，款还未到账
    if (status === "complete" && paymentStatus === "unpaid") {
        return <PendingPaymentDisplay email={email ?? undefined} />;
    }
    // 2.4 不应该出现
    return (
        <PaymentIncompleteDisplay
            status={status}
            paymentStatus={paymentStatus}
        />
    );
}