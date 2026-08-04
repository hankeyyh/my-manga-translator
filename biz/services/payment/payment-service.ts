import Stripe from "stripe";
import {
    CHECK_PARAM_ERROR_CODE,
    DB_ERROR_CODE,
    EXCEPTION_CODE,
    NETWORK_ERROR_CODE,
    REMOTE_LOGIC_ERROR_CODE,
    SUCCESS_CODE,
} from "@/types/dto/response";
import { BizResult } from "@/types/dto/response";
import { UserRepository } from "@/biz/repositories/auth/user-repository";
import { ChangeSubscriptionData } from "@/types/dto/user-subscription";

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
                    code: REMOTE_LOGIC_ERROR_CODE,
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
                code: NETWORK_ERROR_CODE,
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
                code: NETWORK_ERROR_CODE,
                data: null,
                error: err instanceof Error ? err : new Error(String(err)),
            };
        }
    }

    constructWebhookEvent(body: string, signature: string): BizResult<Stripe.Event> {
        const signingSecret = process.env.STRIPE_WEBHOOK_SIGNING_SECRET;
        if (!signingSecret) {
            return {
                code: EXCEPTION_CODE,
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
                code: CHECK_PARAM_ERROR_CODE,
                data: null,
                error: err instanceof Error ? err : new Error(String(err)),
            };
        }
    }

    async retriveSubscription(subscriptionId: string): Promise<BizResult<Stripe.Subscription>> {
        try {
            const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
            return {
                code: SUCCESS_CODE,
                data: subscription,
                error: null,
            };
        } catch (err) {
            console.error(`retriveSubscription fail, error: ${err}`);
            return {
                code: NETWORK_ERROR_CODE,
                data: null,
                error: err instanceof Error ? err : new Error(String(err)),
            };
        }
    }

    async changeSubscription(userId: string, transactionId: string, subscriptionId: string, newPriceId: string): Promise<BizResult<ChangeSubscriptionData>> {
        if (!subscriptionId || !newPriceId) {
            return {
                code: CHECK_PARAM_ERROR_CODE,
                data: null,
                error: new Error("subscriptionId and newPriceId are required"),
            };
        }

        try {
            const existing = await this.stripe.subscriptions.retrieve(subscriptionId);
            const subscriptionItemId = existing.items.data[0]?.id;
            if (!subscriptionItemId) {
                console.error(`changeSubscription, subscription has no items, subscriptionId: ${subscriptionId}`);
                return {
                    code: REMOTE_LOGIC_ERROR_CODE,
                    data: null,
                    error: new Error("Subscription has no items"),
                };
            }

            const subscription = await this.stripe.subscriptions.update(subscriptionId, {
                items: [
                    {
                        id: subscriptionItemId,
                        price: newPriceId,
                    },
                ],
                metadata: {
                    transactionId: transactionId,
                    userId: userId,
                    // webhook 用此校验计划是否真正切到目标价（3DS 失败回滚时价格不变）
                    stripePriceId: newPriceId,
                },
                proration_behavior: "none", // 完全不计算差价（升级不补差价，降级不退余款）
                billing_cycle_anchor: 'now', // 将结算周期锚点重置为“现在”，触发立即扣费
                payment_behavior: "pending_if_incomplete",
                expand: ["latest_invoice"],
            });

            const clientSecret = extractInvoiceClientSecret(subscription);
            // pending_if_incomplete：需 3DS 时会留下 pending_update，并给出 invoice confirmation_secret
            if (subscription.pending_update && clientSecret) {
                return {
                    code: SUCCESS_CODE,
                    data: {
                        status: "requires_action",
                        clientSecret,
                    },
                    error: null,
                };
            }

            return {
                code: SUCCESS_CODE,
                data: {
                    status: "success",
                    clientSecret: null,
                },
                error: null,
            };
        } catch (err) {
            console.error(`changeSubscription fail, error: ${err}`);
            return {
                code: NETWORK_ERROR_CODE,
                data: null,
                error: err instanceof Error ? err : new Error(String(err)),
            };
        }
    }
}

function extractInvoiceClientSecret(subscription: Stripe.Subscription): string | null {
    const invoice = subscription.latest_invoice;
    if (!invoice || typeof invoice === "string") {
        return null;
    }
    return invoice.confirmation_secret?.client_secret ?? null;
}
