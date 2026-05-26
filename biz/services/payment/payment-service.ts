import Stripe from "stripe";
import { BizResult, DB_ERROR_CODE, LOGIC_ERROR_CODE, Result } from "@/types/do/common";
import { UserRepository } from "@/biz/repositories/auth/user-repository";
import { SUCCESS_CODE } from "@/types/do/common";

interface CreateCheckoutSessionData {
    sessionId: string;
    url: string;
}

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

    async createCheckoutSession(transactionId: string, priceId: string, transactionType: string, successUrl: string, cancelUrl: string): Promise<BizResult<CreateCheckoutSessionData>> {
        const userResult = await this.userRepo.getCurrentUser();
        if (userResult.error || !userResult.data) {
            return {
                code: DB_ERROR_CODE,
                data: null,
                error: new Error("User not found"),
            };
        }
        const mode = transactionType === 'pay-to-use' ? 'payment' : 'subscription';
        const user = userResult.data;
        try {
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
                    code: LOGIC_ERROR_CODE,
                    data: null,
                    error: new Error("Failed to create checkout session"),
                };
            }
            return {
                code: SUCCESS_CODE,
                data: {
                    sessionId: session.id,
                    url: session.url,
                },
                error: null,
            };
        } catch (err) {
            console.error(`createCheckoutSession fail, error: ${err}`);
            return {
                code: LOGIC_ERROR_CODE,
                data: null,
                error: err instanceof Error ? err : new Error(String(err)),
            };
        }
    }

    async retriveCheckoutSession(sessionId: string): Promise<BizResult<RetriveCheckoutSessionData>> {
        try {
            const session = await this.stripe.checkout.sessions.retrieve(sessionId);
            return {
                code: SUCCESS_CODE,
                data: {
                    status: session.status,
                    paymentStatus: session.payment_status,
                    email: session.customer_details?.email,
                    transactionId: session.metadata?.transactionId,
                },
                error: null,
            };
        } catch (err) {
            console.error(`retriveCheckoutSession fail, error: ${err}`);
            return {
                code: LOGIC_ERROR_CODE,
                data: null,
                error: err instanceof Error ? err : new Error(String(err)),
            };
        }
    }

    constructWebhookEvent(body: string, signature: string): BizResult<Stripe.Event> {
        const signingSecret = process.env.STRIPE_WEBHOOK_SIGNING_SECRET;
        if (!signingSecret) {
            return {
                code: LOGIC_ERROR_CODE,
                data: null,
                error: new Error("STRIPE_WEBHOOK_SIGNING_SECRET is not configured"),
            };
        }
        try {
            const event = this.stripe.webhooks.constructEvent(body, signature, signingSecret);
            return { code: SUCCESS_CODE, data: event, error: null };
        } catch (err) {
            console.error(`constructWebhookEvent fail, error: ${err}`);
            return {
                code: LOGIC_ERROR_CODE,
                data: null,
                error: err instanceof Error ? err : new Error(String(err)),
            };
        }
    }
}
