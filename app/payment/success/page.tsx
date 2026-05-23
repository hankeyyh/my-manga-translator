import { Suspense } from "react";
import { redirect } from "next/navigation";
import Stripe from "stripe";
import { createServerClient } from "@/lib/utils/supabase/server";
import { UserRepository } from "@/lib/repositories/auth/user-repository";
import { PaymentService } from "@/lib/services/payment/payment-service";
import SuccessDisplay from "@/components/payment/payment-success";
import { CreditService } from "@/lib/services/credit/credit-service";
import { TopUpConfigRepository } from "@/lib/repositories/topup/topup-config";
import { UserTransactionsRepository } from "@/lib/repositories/topup/user-transactions";
import { createServiceRoleClient } from "@/lib/utils/supabase/admin";

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
    const { status, paymentStatus, email, transactionId } = result.data!;
    if (status === "open") {
        return redirect("/");
    }
    if (status === "complete" && paymentStatus == "paid") {
        if (!transactionId) {
            // 不应该走到这里，transactionId 必须拿到
            return <div>Meet Error: Transaction ID Not Found</div>;
        }
        // 3. 增加credits
        const adminSupabase = createServiceRoleClient();
        const credService = new CreditService(new TopUpConfigRepository(supabase),
            new UserTransactionsRepository(adminSupabase), // 管理员才有权限增加credits
        );
        // TODO 如果失败怎么办，重试？
        const succeedTransactionResult = await credService.succeedUserTransaction(transactionId);
        if (succeedTransactionResult.error) {
            credService.failUserTransaction(transactionId);
            return <div>Meet Error: Internal Server Error</div>
        }
        return (
            <SuccessDisplay email={email ?? ""} />
        );
    }
}