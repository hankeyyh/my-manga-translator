import Stripe from "stripe";
import { SubscriptionTier, BillingCycle, resolveSubscriptionPriceId } from "./subscription-prices";
import { Result } from "@/types/do/common";
import { UserRepository } from "@/lib/repositories/auth/user-repository";


interface RetriveCheckoutSessionData {
    status: string | null | undefined;
    email: string | null | undefined;
}


/**
 * 处理stripe支付，账单
 */
export class PaymentService {
    constructor(private stripe: Stripe, private userRepo: UserRepository) { }

    async createCheckoutSession(tier: SubscriptionTier, billing: BillingCycle, successUrl: string, cancelUrl: string): Promise<Result<string>> {
        const userResult = await this.userRepo.getCurrentUser();
        if (userResult.error || !userResult.data) {
            return {
                data: null,
                error: new Error("User not found"),
            };
        }
        const user = userResult.data;
        const priceId = resolveSubscriptionPriceId(tier, billing);
        const session = await this.stripe.checkout.sessions.create({
            line_items: [{ price: priceId, quantity: 1 }],
            mode: 'subscription',
            client_reference_id: user.id,
            metadata: {
                tier,
                billing,
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
                email: session.customer_details?.email,
            },
            error: null,
        };
    }
}
