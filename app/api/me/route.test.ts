import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { SUCCESS_CODE, UNAUTHORIZED_ERROR_CODE } from "@/types/dto/response";
import { loadRouteMethod } from "../helper.test";

const getCurrentUserInfoMock = jest.fn<() => Promise<{
    data: { user: { id: string; email: string } } | null;
    error: Error | null;
    code: number;
}>>();

async function loadGet() {
    return loadRouteMethod<() => Promise<Response>>(
        "@/app/api/me/route",
        "GET",
        [
            {
                moduleName: "@/biz/loaders/get-current-user-info",
                factory: () => ({
                    getCurrentUserInfo: getCurrentUserInfoMock,
                }),
            },
        ],
    );
}

describe("GET /api/me", () => {
    beforeEach(() => {
        getCurrentUserInfoMock.mockReset();
    });

    test("returns null when logged out", async () => {
        getCurrentUserInfoMock.mockResolvedValue({
            data: null,
            error: null,
            code: UNAUTHORIZED_ERROR_CODE,
        });
        const GET = await loadGet();
        const response = await GET();
        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({ data: null });
    });

    test("returns user info when logged in", async () => {
        const data = { user: { id: "u1", email: "a@b.com" } };
        getCurrentUserInfoMock.mockResolvedValue({
            data,
            error: null,
            code: SUCCESS_CODE,
        });
        const GET = await loadGet();
        const response = await GET();
        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({ data });
    });
});
