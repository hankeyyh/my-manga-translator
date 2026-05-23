import Stripe from "stripe";
import { SubscriptionTier, BillingCycle, resolveSubscriptionPriceId } from "./topup-prices";
import { BizResult, DB_ERROR_CODE, Result } from "@/types/do/common";
import { UserRepository } from "@/lib/repositories/auth/user-repository";
import { TopUpConfig } from "@/types/do/topup-config";
import { TopUpConfigRepository } from "@/lib/repositories/topup/topup-config";
import { SUCCESS_CODE } from "@/types/do/common";


interface RetriveCheckoutSessionData {
    status: string | null;
    paymentStatus: string;
    email?: string | null;
    // 表 user_transaction 主键id
    transactionId?: string;
}


/**
 * 处理stripe支付，账单
 */
export class PaymentService {
    constructor(private stripe: Stripe, private userRepo: UserRepository) { }

    async createCheckoutSession(transactionId: string, priceId: string, transactionType: string, successUrl: string, cancelUrl: string): Promise<Result<string>> {
        const userResult = await this.userRepo.getCurrentUser();
        if (userResult.error || !userResult.data) {
            return {
                data: null,
                error: new Error("User not found"),
            };
        }
        const mode = transactionType === 'pay-to-use' ? 'payment' : 'subscription';
        const user = userResult.data;
        const session = await this.stripe.checkout.sessions.create({
            line_items: [{ price: priceId, quantity: 1 }],
            mode: mode,
            client_reference_id: user.id,
            metadata: {
                transactionId: transactionId,
                userId: user.id,
            },
            success_url: successUrl,
            cancel_url: cancelUrl,
            automatic_tax: { enabled: true },
        });
        if (!session.url) {
            console.error("createCheckoutSession, stripe failed to create checkout session");
            return {
                data: null,
                error: new Error("Failed to create checkout session"),
            };
        }
        return {
            data: session.url,
            error: null,
        };
    }

    async retriveCheckoutSession(sessionId: string): Promise<Result<RetriveCheckoutSessionData>> {
        const session = await this.stripe.checkout.sessions.retrieve(sessionId);
        return {
            data: {
                status: session.status,
                paymentStatus: session.payment_status,
                email: session.customer_details?.email,
                transactionId: session.metadata?.transactionId,
            },
            error: null,
        };
    }
}
