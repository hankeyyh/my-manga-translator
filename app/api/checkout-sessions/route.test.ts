import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { NextRequest } from "next/server";
import { SUCCESS_CODE } from "@/types/dto/response";
import { loadRouteMethod } from "../helper.test";

type CurrentUserResult = {
    data: { id: string; email: string; isAnonymous?: boolean } | null;
    error: Error | null;
};

const PLAN_ID = "11111111-1111-4111-8111-111111111111";

const getCurrentUserMock = jest.fn<() => Promise<CurrentUserResult>>();
const createClientMock = jest.fn<() => Promise<Record<string, unknown>>>();
const getTopUpConfigMock = jest.fn<(id: string) => Promise<{
    code: number;
    data: Record<string, unknown> | null;
    error: Error | null;
}>>();
const startUserTransactionMock = jest.fn<(
    userId: string,
    topupConfig: Record<string, unknown>,
    transactionType: string,
) => Promise<{
    code: number;
    data: { id: string; transactionType: string } | null;
    error: Error | null;
}>>();
const updateStripeSessionIdMock = jest.fn<(
    transactionId: string,
    sessionId: string,
) => Promise<{ code: number; data: null; error: Error | null }>>();
const failUserTransactionMock = jest.fn<(transactionId: string) => Promise<unknown>>();
const createCheckoutSessionMock = jest.fn<(
    transactionId: string,
    priceId: string,
    transactionType: string,
    successUrl: string,
    cancelUrl: string,
) => Promise<{
    code: number;
    data: { sessionId: string; url: string } | null;
    error: Error | null;
}>>();

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
                moduleName: "@/biz/utils/supabase/server",
                factory: () => ({
                    createServerClient: createClientMock,
                }),
            },
            {
                moduleName: "@/biz/services/auth/auth-service",
                factory: () => ({
                    AuthService: jest.fn().mockImplementation(() => ({
                        getCurrentUser: getCurrentUserMock,
                    })),
                }),
            },
            {
                moduleName: "@/biz/services/credit/credit-service",
                factory: () => ({
                    CreditService: {
                        fromSupabase: () => ({
                            getTopUpConfig: getTopUpConfigMock,
                            startUserTransaction: startUserTransactionMock,
                            updateStripeSessionId: updateStripeSessionIdMock,
                            failUserTransaction: failUserTransactionMock,
                        }),
                    },
                }),
            },
            {
                moduleName: "@/biz/services/payment/payment-service",
                factory: () => ({
                    PaymentService: jest.fn().mockImplementation(() => ({
                        createCheckoutSession: createCheckoutSessionMock,
                    })),
                }),
            },
            {
                moduleName: "@/biz/utils/stripe/server",
                factory: () => ({
                    createStripeClient: () => ({}),
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
        ],
    );
}

describe("POST /api/checkout-sessions", () => {
    beforeEach(() => {
        getCurrentUserMock.mockReset();
        createClientMock.mockReset();
        getTopUpConfigMock.mockReset();
        startUserTransactionMock.mockReset();
        updateStripeSessionIdMock.mockReset();
        failUserTransactionMock.mockReset();
        createCheckoutSessionMock.mockReset();

        getCurrentUserMock.mockResolvedValue({
            data: { id: "uid", email: "u@test.com", isAnonymous: false },
            error: null,
        });
        createClientMock.mockResolvedValue({});
        getTopUpConfigMock.mockResolvedValue({
            code: SUCCESS_CODE,
            data: {
                id: PLAN_ID,
                transactionType: "subscription",
                stripePriceId: "price_pro_m",
                isActive: true,
            },
            error: null,
        });
        startUserTransactionMock.mockResolvedValue({
            code: SUCCESS_CODE,
            data: { id: "tx-1", transactionType: "subscription" },
            error: null,
        });
        updateStripeSessionIdMock.mockResolvedValue({
            code: SUCCESS_CODE,
            data: null,
            error: null,
        });
        createCheckoutSessionMock.mockResolvedValue({
            code: SUCCESS_CODE,
            data: {
                sessionId: "cs_test_123",
                url: "https://checkout.stripe.com/c/pay/cs_test_123",
            },
            error: null,
        });
    });

    test("正式登录时返回 Stripe Checkout URL", async () => {
        const POST = await loadPost();
        const response = await POST(buildCheckoutRequest({ id: PLAN_ID }));

        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({
            url: "https://checkout.stripe.com/c/pay/cs_test_123",
        });
        expect(createCheckoutSessionMock).toHaveBeenCalledWith(
            "tx-1",
            "price_pro_m",
            "subscription",
            "http://localhost:3000/payment/success?session_id={CHECKOUT_SESSION_ID}",
            "http://localhost:3000/payment/cancel?session_id={CHECKOUT_SESSION_ID}",
        );
    });

    test("未登录时返回 401", async () => {
        getCurrentUserMock.mockResolvedValueOnce({
            data: null,
            error: new Error("未授权"),
        });
        const POST = await loadPost();
        const response = await POST(buildCheckoutRequest({ id: PLAN_ID }));

        expect(response.status).toBe(401);
        await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
        expect(createCheckoutSessionMock).not.toHaveBeenCalled();
        expect(startUserTransactionMock).not.toHaveBeenCalled();
    });

    test("匿名会话时返回 401", async () => {
        getCurrentUserMock.mockResolvedValueOnce({
            data: { id: "anon", email: "", isAnonymous: true },
            error: null,
        });
        const POST = await loadPost();
        const response = await POST(buildCheckoutRequest({ id: PLAN_ID }));

        expect(response.status).toBe(401);
        await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
        expect(createCheckoutSessionMock).not.toHaveBeenCalled();
        expect(startUserTransactionMock).not.toHaveBeenCalled();
    });

    test("套餐 id 非法时返回 400", async () => {
        const POST = await loadPost();
        const response = await POST(buildCheckoutRequest({ id: "not-a-uuid" }));

        expect(response.status).toBe(400);
        expect(createCheckoutSessionMock).not.toHaveBeenCalled();
    });
});
