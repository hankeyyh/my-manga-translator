import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { NextRequest } from "next/server";
import { UserEntity } from "@/lib/entities/user-entity";
import { loadRouteMethod } from "../helper.test";

type CurrentUserResult = {
    data: UserEntity | null;
    error: Error | null;
};

const checkoutSessionsCreate = jest.fn<
    (...args: unknown[]) => Promise<{ url: string; }>
>();

const getCurrentUserMock = jest.fn<() => Promise<CurrentUserResult>>();

function buildCheckoutRequest(body: Record<string, unknown>) {
    return new NextRequest("http://localhost/api/checkout-sessions", {
        method: "POST",
        body: JSON.stringify(body),
        headers: { "content-type": "application/json" },
    });
}

async function loadPost() {
    return loadRouteMethod<(request: NextRequest) => Promise<Response>>(
        "@/app/api/checkout-sessions/route",
        "POST",
        [
            {
                moduleName: "@/lib/services/auth/auth-service",
                factory: () => ({
                    authService: {
                        getCurrentUser: getCurrentUserMock,
                    },
                }),
            },
            {
                moduleName: "next/headers",
                factory: () => ({
                    headers: async () => ({
                        get: (name: string) =>
                            name.toLowerCase() === "origin" ? "http://localhost:3000" : null,
                    }),
                }),
            },
            {
                moduleName: "stripe",
                factory: () =>
                    jest.fn().mockImplementation(() => ({
                        checkout: {
                            sessions: {
                                create: checkoutSessionsCreate,
                            },
                        },
                    })),
            },
        ]
    );
}

describe("POST /api/checkout-sessions", () => {
    beforeEach(() => {
        process.env.STRIPE_PRICE_BASIC_MONTHLY = "price_basic_m";
        process.env.STRIPE_PRICE_BASIC_YEARLY = "price_basic_y";
        process.env.STRIPE_PRICE_PRO_MONTHLY = "price_pro_m";
        process.env.STRIPE_PRICE_PRO_YEARLY = "price_pro_y";
        process.env.STRIPE_PRICE_ULTRA_MONTHLY = "price_ultra_m";
        process.env.STRIPE_PRICE_ULTRA_YEARLY = "price_ultra_y";

        checkoutSessionsCreate.mockResolvedValue({
            url: "https://checkout.stripe.com/c/pay/cs_test_123",
        });
        getCurrentUserMock.mockResolvedValue({
            data: new UserEntity("uid", "u@test.com"),
            error: null,
        });
    });

    test("在存在 Origin 时按档位返回 Stripe Checkout URL", async () => {
        const POST = await loadPost();
        const response = await POST(
            buildCheckoutRequest({ tier: "pro", billing: "monthly" })
        );

        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({
            url: "https://checkout.stripe.com/c/pay/cs_test_123",
        });
        expect(checkoutSessionsCreate).toHaveBeenCalledWith(
            expect.objectContaining({
                mode: "subscription",
                client_reference_id: "uid",
                line_items: [{ price: "price_pro_m", quantity: 1 }],
                metadata: {
                    tier: "pro",
                    billing: "monthly",
                    userId: "uid",
                },
                success_url:
                    "http://localhost:3000/payment/success?session_id={CHECKOUT_SESSION_ID}",
                cancel_url: "http://localhost:3000/",
            })
        );
    });

    test("未登录时返回 401", async () => {
        getCurrentUserMock.mockResolvedValueOnce({
            data: null,
            error: new Error("未授权"),
        });
        const POST = await loadPost();
        const response = await POST(
            buildCheckoutRequest({ tier: "basic", billing: "monthly" })
        );

        expect(response.status).toBe(401);
        expect(checkoutSessionsCreate).not.toHaveBeenCalled();
    });

    test("tier 或 billing 非法时返回 400", async () => {
        const POST = await loadPost();
        const response = await POST(
            buildCheckoutRequest({ tier: "enterprise", billing: "monthly" })
        );

        expect(response.status).toBe(400);
        expect(checkoutSessionsCreate).not.toHaveBeenCalled();
    });
});
