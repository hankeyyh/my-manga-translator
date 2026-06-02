import { Suspense } from "react";
import { redirect } from "next/navigation";
import Stripe from "stripe";
import { createServerClient } from "@/biz/utils/supabase/server";
import { UserRepository } from "@/biz/repositories/auth/user-repository";
import { PaymentService } from "@/biz/services/payment/payment-service";
import PaymentIncompleteDisplay from "@/components/payment/payment-incomplete";
import PendingPaymentDisplay from "@/components/payment/payment-pending";
import SuccessDisplay from "@/components/payment/payment-success";

export default function PaymentSuccessPage({ searchParams }: { searchParams: Promise<{ session_id: string; }>; }) {
    return (
        <Suspense fallback={<p>Loading...</p>}>
            <PaymentSuccessDetail searchParams={searchParams} />
        </Suspense>
    );
}

async function PaymentSuccessDetail({ searchParams }: { searchParams: Promise<{ session_id: string; }>; }) {
    const { session_id: sessionId } = await searchParams;

    // 1. 获取stripe session
    const supabase = await createServerClient();
    const paymentService = new PaymentService(new Stripe(process.env.STRIPE_SECRET_KEY!),
        new UserRepository(supabase)
    );
    const result = await paymentService.retriveCheckoutSession(sessionId);
    if (result.error) {
        return <div>Error: {result.error.message}</div>;
    }
    // 2. 状态检查
    const { status, paymentStatus, email } = result.data!;
    // 2.1 不应该出现
    if (status === "open") {
        return redirect("/");
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