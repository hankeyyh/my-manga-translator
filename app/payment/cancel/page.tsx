import { UserRepository } from "@/lib/repositories/auth/user-repository";
import { TopUpConfigRepository } from "@/lib/repositories/topup/topup-config";
import { UserTransactionsRepository } from "@/lib/repositories/topup/user-transactions";
import { CreditService } from "@/lib/services/credit/credit-service";
import { PaymentService } from "@/lib/services/payment/payment-service";
import { createServerClient } from "@/lib/utils/supabase/server";
import { redirect } from "next/navigation"
import { Suspense } from "react";
import Stripe from "stripe";

export default function PaymentCancelPage({ searchParams }: { searchParams: Promise<{ session_id: string; }>; }) {
    return (
        <Suspense fallback={<p>Loading...</p>}>
            <PaymentCancelDetail searchParams={searchParams} />
        </Suspense>
    );
}

async function PaymentCancelDetail({ searchParams }: { searchParams: Promise<{ session_id: string; }>; }) {
    const { session_id: sessionId } = await searchParams;

    // 1. 获取stripe session
    const supabase = await createServerClient();
    const paymentService = new PaymentService(new Stripe(process.env.STRIPE_SECRET_KEY!),
        new UserRepository(supabase)
    );
    const stripeSessionResult = await paymentService.retriveCheckoutSession(sessionId);
    if (stripeSessionResult.error) {
        return <div>Error: {stripeSessionResult.error.message}</div>;
    }

    const { status, paymentStatus, email, transactionId } = stripeSessionResult.data!;
    // 2. 取消交易
    const creditService = new CreditService(new TopUpConfigRepository(supabase),
        new UserTransactionsRepository(supabase),
    );
    const transResult = await creditService.cancelUserTransaction(transactionId!);
    if (transResult.error) {
        return <div>Error: {transResult.error.message}</div>;
    }

    return redirect("/")
}