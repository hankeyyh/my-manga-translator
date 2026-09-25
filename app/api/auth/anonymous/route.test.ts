import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { NextRequest } from "next/server";
import { SUCCESS_CODE, UNAUTHORIZED_ERROR_CODE } from "@/types/dto/response";
import { loadRouteMethod } from "../../helper.test";

const getCurrentUserInfoMock = jest.fn<() => Promise<{
    data: {
        credit: { payToUseBalance: number; subscriptionBalance: number; };
        user: { id: string; email: string; isAnonymous: boolean; };
    } | null;
    error: Error | null;
    code: number;
}>>();

const grantDailyAnonymousBonusMock = jest.fn<(userId: string, ipHash: string | null) => Promise<{
    code: number;
    data: boolean | null;
    error: Error | null;
}>>();

const getCreditBalanceMock = jest.fn<(userId: string) => Promise<{
    code: number;
    data: { payToUseBalance: number; subscriptionBalance: number; } | null;
    error: Error | null;
}>>();

const signInAnonymousMock = jest.fn<() => Promise<{ data: { id: string; } | null; error: Error | null; }>>();

async function loadPost() {
    return loadRouteMethod<(request: NextRequest) => Promise<Response>>(
        "@/app/api/auth/anonymous/route",
        "POST",
        [
            {
                moduleName: "@/biz/loaders/get-current-user-info",
                factory: () => ({
                    getCurrentUserInfo: getCurrentUserInfoMock,
                }),
            },
            {
                moduleName: "@/biz/utils/supabase/admin",
                factory: () => ({
                    createServiceRoleClient: () => ({}),
                }),
            },
            {
                moduleName: "@/biz/utils/supabase/server",
                factory: () => ({
                    createServerClientForAnonymous: async () => ({}),
                }),
            },
            {
                moduleName: "@/biz/services/auth/auth-service",
                factory: () => ({
                    AuthService: {
                        fromSupabase: () => ({
                            signInAnonymous: signInAnonymousMock,
                        }),
                    },
                }),
            },
            {
                moduleName: "@/biz/services/credit/credit-service",
                factory: () => ({
                    CreditService: {
                        fromSupabase: () => ({
                            grantDailyAnonymousBonus: grantDailyAnonymousBonusMock,
                            getCreditBalance: getCreditBalanceMock,
                            findAnonymousTrialGrant: jest.fn(),
                        }),
                    },
                }),
            },
        ],
    );
}

function anonymousRequest() {
    return new NextRequest("http://localhost/api/auth/anonymous", { method: "POST" });
}

describe("POST /api/auth/anonymous", () => {
    beforeEach(() => {
        getCurrentUserInfoMock.mockReset();
        grantDailyAnonymousBonusMock.mockReset();
        getCreditBalanceMock.mockReset();
        signInAnonymousMock.mockReset();
    });

    test("refills an existing anonymous user even without cf-connecting-ip", async () => {
        getCurrentUserInfoMock.mockResolvedValue({
            code: SUCCESS_CODE,
            error: null,
            data: {
                credit: { payToUseBalance: 2, subscriptionBalance: 0 },
                user: { id: "anon-1", email: "", isAnonymous: true },
            },
        });
        grantDailyAnonymousBonusMock.mockResolvedValue({
            code: SUCCESS_CODE,
            data: true,
            error: null,
        });
        getCreditBalanceMock.mockResolvedValue({
            code: SUCCESS_CODE,
            data: { payToUseBalance: 5, subscriptionBalance: 0 },
            error: null,
        });

        const POST = await loadPost();
        const response = await POST(anonymousRequest());
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(grantDailyAnonymousBonusMock).toHaveBeenCalledWith("anon-1", null);
        expect(body.data.credit.payToUseBalance).toBe(5);
    });

    test("does not create an anonymous user when production has no client IP", async () => {
        getCurrentUserInfoMock.mockResolvedValue({
            code: UNAUTHORIZED_ERROR_CODE,
            error: null,
            data: null,
        });

        const POST = await loadPost();
        const response = await POST(anonymousRequest());
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(signInAnonymousMock).not.toHaveBeenCalled();
        expect(grantDailyAnonymousBonusMock).not.toHaveBeenCalled();
        expect(body.data).toBeNull();
    });
});
