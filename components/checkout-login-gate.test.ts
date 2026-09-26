import { afterEach, beforeEach, describe, expect, jest, test } from "@jest/globals";
import { UserInfo } from "@/types/api/user-info";

type Gate = typeof import("./checkout-login-gate");
type Store = typeof import("./site-user-store");

const originalFetch = global.fetch;

const anonymousUser: UserInfo = {
    user: { id: "anon", email: "", isAnonymous: true },
    credit: { payToUseBalance: 1, subscriptionBalance: 0 },
};

const formalUser: UserInfo = {
    user: { id: "user", email: "user@example.com", isAnonymous: false },
    credit: { payToUseBalance: 0, subscriptionBalance: 10 },
};

async function load(): Promise<{ gate: Gate; store: Store }> {
    jest.resetModules();
    const gate = await import("./checkout-login-gate");
    const store = await import("./site-user-store");
    return { gate, store };
}

describe("checkout login gate", () => {
    beforeEach(() => {
        jest.resetModules();
    });

    afterEach(() => {
        global.fetch = originalFetch;
    });

    test("匿名会话去登录", async () => {
        const { gate, store } = await load();
        store.applySiteUser(anonymousUser);

        expect(gate.shouldRedirectCheckoutToLogin(store.getSiteUserSnapshot())).toBe(true);
        await expect(gate.resolveCheckoutAccess()).resolves.toBe("login");
    });

    test("未登录去登录", async () => {
        const { gate, store } = await load();
        store.applySiteUser(null);

        expect(gate.shouldRedirectCheckoutToLogin(store.getSiteUserSnapshot())).toBe(true);
        const redirectToLogin = jest.fn();
        await expect(gate.continueCheckoutOrRedirect(redirectToLogin)).resolves.toBe(false);
        expect(redirectToLogin).toHaveBeenCalledTimes(1);
    });

    test("正式登录可以结账", async () => {
        const { gate, store } = await load();
        store.applySiteUser(formalUser);

        expect(gate.shouldRedirectCheckoutToLogin(store.getSiteUserSnapshot())).toBe(false);
        const redirectToLogin = jest.fn();
        await expect(gate.continueCheckoutOrRedirect(redirectToLogin)).resolves.toBe(true);
        expect(redirectToLogin).not.toHaveBeenCalled();
    });

    test("快照未就绪时先读 /api/me，正式用户不跳登录", async () => {
        global.fetch = jest.fn(() => Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ data: formalUser }),
        } as Response)) as typeof fetch;
        const { gate, store } = await load();

        expect(store.getSiteUserSnapshot().userReady).toBe(false);
        await expect(gate.resolveCheckoutAccess()).resolves.toBe("allow");
        expect(global.fetch).toHaveBeenCalledWith("/api/me");
    });

    test("快照未就绪且 /api/me 失败时不误跳登录", async () => {
        global.fetch = jest.fn(() => Promise.reject(new Error("offline"))) as typeof fetch;
        const { gate } = await load();

        await expect(gate.resolveCheckoutAccess()).resolves.toBe("allow");
    });
});
