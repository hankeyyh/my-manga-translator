import { UserRepository } from "@/biz/repositories/auth/user-repository";
import { BillingService } from "@/biz/services/billing/billing-service";
import { CreditService } from "@/biz/services/credit/credit-service";
import { PaymentService } from "@/biz/services/payment/payment-service";
import { createStripeClient } from "@/biz/utils/stripe/server";
import { createServiceRoleClient } from "@/biz/utils/supabase/admin";
import { EXCEPTION_CODE } from "@/types/dto/response";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
    const sig = request.headers.get('stripe-signature');
    if (!sig) {
        console.error(`stripe webhooks, stripe-signature header not found, header: ${request.headers}`);
        return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }
    const body = await request.text();
    const supabase = createServiceRoleClient();
    const paymentService = new PaymentService(
        createStripeClient(),
        new UserRepository(supabase),
    );
    const eventResult = paymentService.constructWebhookEvent(body, sig);
    if (eventResult.error) {
        // 配置缺失应 500；签名/body 非法为 400
        const status = eventResult.code === EXCEPTION_CODE ? 500 : 400;
        return NextResponse.json({ error: eventResult.error.message }, { status });
    }
    const event = eventResult.data!;
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
        // 首次充值 checkout-session
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.status !== "complete" || session.payment_status !== "paid") {
            return NextResponse.json({}, { status: 200 });
        }
        // 查看subscription id
        let subscriptionId: string | null = null;
        if (session.mode === "subscription" && session.subscription) {
            if (typeof session.subscription === "string") {
                subscriptionId = session.subscription;
            } else {
                subscriptionId = session.subscription.id;
            }
        }
        // 交易完成，增加积分
        const transactionId = session.metadata?.transactionId;
        if (!transactionId) {
            console.error(`transactionId not found in session metadata, StripeSessionId: ${session.id}`);
            return NextResponse.json({}, { status: 200 }); // 重试无意义，返回200，需要人工介入
        }
        const transResult = await CreditService.fromSupabase(supabase).succeedUserTransaction(transactionId, subscriptionId);
        if (transResult.error) {
            // stripe 会重试
            return NextResponse.json({}, { status: 500 });
        }
    } else if (event.type === "customer.subscription.updated") {
        // 订阅计划变更（续费等无 transactionId 的 updated 直接忽略）
        const subscription = event.data.object as Stripe.Subscription;
        const subscriptionId = subscription.id;
        const transactionId = subscription.metadata?.transactionId;
        if (!transactionId) {
            console.error(`transactionId not found in subscription update metadata, subscriptionId: ${subscriptionId}`);
            return NextResponse.json({}, { status: 200 }); // 重试无意义，返回200，需要人工介入
        }

        // pending_if_incomplete：3DS / 付款未完成时会留下 pending_update，此时不落地
        if (subscription.pending_update) {
            return NextResponse.json({}, { status: 200 });
        }

        if (subscription.status !== "active" && subscription.status !== "trialing") {
            console.error(`subscription updated not confirmed, status: ${subscription.status}, subscriptionId: ${subscriptionId}`);
            return NextResponse.json({}, { status: 200 });
        }

        // 付款失败回滚后价格仍是旧价：标记交易失败，避免误发积分
        const expectedPriceId = subscription.metadata?.stripePriceId;
        const currentPriceId = subscription.items.data[0]?.price?.id;
        const creditService = CreditService.fromSupabase(supabase);
        if (expectedPriceId && currentPriceId && currentPriceId !== expectedPriceId) {
            console.error(`subscription change price mismatch, expected: ${expectedPriceId}, actual: ${currentPriceId}, transactionId: ${transactionId}`);
            await creditService.failUserTransaction(transactionId);
            return NextResponse.json({}, { status: 200 });
        }

        const transResult = await creditService.succeedUserTransaction(transactionId, subscriptionId);
        if (transResult.error) {
            // stripe 会重试
            return NextResponse.json({}, { status: 500 });
        }
    } else if (event.type === "customer.subscription.deleted") {
        // 计划到期终止（含 cancel_at_period_end 到期后）
        const subscription = event.data.object as Stripe.Subscription;
        const expireResult = await BillingService.fromSupabase(supabase).expireUserSubscription(
            subscription.id,
        );
        if (expireResult.error) {
            // stripe 会重试
            return NextResponse.json({}, { status: 500 });
        }
    } else if (event.type === "invoice.paid") {
        // 计划续费（及订阅相关发票支付成功）
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.billing_reason === "subscription_cycle") {
            const stripeSubscriptionId = extractInvoiceSubscriptionId(invoice);
            const period = extractInvoicePeriod(invoice);
            if (!stripeSubscriptionId || !period) {
                console.error(
                    `subscription_cycle missing subscription/period, invoiceId: ${invoice.id}, subscriptionId: ${stripeSubscriptionId}, period: ${JSON.stringify(period)}`,
                );
                return NextResponse.json({}, { status: 200 }); // 重试无意义，需要人工介入
            }

            const renewResult = await BillingService.fromSupabase(supabase).renewSubscriptionCycle({
                stripeSubscriptionId,
                stripeInvoiceId: invoice.id,
                periodStartedAt: period.startedAt,
                periodEndedAt: period.endedAt,
            });
            if (renewResult.error) {
                // stripe 会重试
                return NextResponse.json({}, { status: 500 });
            }
        }
    }
    return NextResponse.json({}, { status: 200 });
}

function extractInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
    const subscription = invoice.parent?.subscription_details?.subscription;
    if (!subscription) {
        return null;
    }
    return typeof subscription === "string" ? subscription : subscription.id;
}

function extractInvoicePeriod(
    invoice: Stripe.Invoice,
): { startedAt: string; endedAt: string } | null {
    const lineWithPeriod = invoice.lines?.data?.find(
        (line) => line.period?.start != null && line.period?.end != null,
    );
    const periodStart = lineWithPeriod?.period?.start ?? invoice.period_start;
    const periodEnd = lineWithPeriod?.period?.end ?? invoice.period_end;
    if (!periodStart || !periodEnd) {
        return null;
    }
    return {
        startedAt: new Date(periodStart * 1000).toISOString(),
        endedAt: new Date(periodEnd * 1000).toISOString(),
    };
}
