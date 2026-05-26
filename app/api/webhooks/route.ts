import { UserRepository } from "@/lib/repositories/auth/user-repository";
import { TopUpConfigRepository } from "@/lib/repositories/topup/topup-config";
import { UserTransactionsRepository } from "@/lib/repositories/topup/user-transactions";
import { CreditService } from "@/lib/services/credit/credit-service";
import { PaymentService } from "@/lib/services/payment/payment-service";
import { createServiceRoleClient } from "@/lib/utils/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
    console.debug("stripe webhooks called");
    const sig = request.headers.get('stripe-signature');
    if (!sig) {
        console.error(`stripe webhooks, stripe-signature header not found, header: ${request.headers}`);
        return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }
    const body = await request.text();
    const supabase = createServiceRoleClient();
    const paymentService = new PaymentService(
        new Stripe(process.env.STRIPE_SECRET_KEY!),
        new UserRepository(supabase),
    );
    const eventResult = paymentService.constructWebhookEvent(body, sig);
    if (eventResult.error) {
        return NextResponse.json({ error: eventResult.error }, { status: 400 });
    }
    const event = eventResult.data!;

    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.status !== "complete" || session.payment_status !== "paid") {
            return null;
        }
        // 交易完成，增加积分
        const transactionId = session.metadata?.transactionId;
        if (!transactionId) {
            console.error(`transactionId not found in metadata, StripeSessionId: ${session.id}`);
            return NextResponse.json({}, { status: 200 }); // 重试无意义，返回200，需要人工介入
        }
        const credService = new CreditService(new TopUpConfigRepository(supabase), new UserTransactionsRepository(supabase));
        const transResult = await credService.succeedUserTransaction(transactionId);
        if (transResult.error) {
            // stripe 会重试
            return NextResponse.json({}, { status: 500 });
        }
    }
    return NextResponse.json({}, { status: 200 });
}
