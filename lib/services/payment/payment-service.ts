import Stripe from "stripe";
import { SubscriptionTier, BillingCycle, resolveSubscriptionPriceId } from "../../utils/subscription-prices";
import { Result } from "@/lib/types";
import { UserRepository } from "@/lib/repositories/user-repository";

/**
 * 处理stripe支付，账单
 */
export class PaymentService {
    constructor(private stripe: Stripe, private userRepo: UserRepository) {}

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
        });
        if (!session.url) {
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
        }
    }
}