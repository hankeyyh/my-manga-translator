import { afterEach, beforeEach, describe, expect, jest, test } from "@jest/globals";
import { UserInfo } from "@/types/api/user-info";

type Store = typeof import("./site-user-store");

const originalFetch = global.fetch;

async function loadStore(): Promise<Store> {
    return import("./site-user-store");
}

describe("refreshSiteUser", () => {
    beforeEach(() => {
        jest.resetModules();
    });

    afterEach(() => {
        global.fetch = originalFetch;
    });

    test("network failure does not mark the snapshot ready", async () => {
        global.fetch = jest.fn(() => Promise.reject(new Error("offline"))) as typeof fetch;
        const store = await loadStore();

        await store.refreshSiteUser();

        expect(store.getSiteUserSnapshot()).toEqual({ userInfo: null, userReady: false });
        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith("/api/me");
    });

    test("non-ok response does not treat the body as a ready null session", async () => {
        global.fetch = jest.fn(() => Promise.resolve({
            ok: false,
            status: 500,
            json: () => Promise.resolve({ data: null }),
        } as Response)) as typeof fetch;
        const store = await loadStore();

        await store.refreshSiteUser();

        expect(store.getSiteUserSnapshot().userReady).toBe(false);
        expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    test("ready null data does not call anonymous signup", async () => {
        global.fetch = jest.fn(() => Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ data: null }),
        } as Response)) as typeof fetch;
        const store = await loadStore();

        await store.refreshSiteUser();

        expect(store.getSiteUserSnapshot()).toEqual({ userInfo: null, userReady: true });
        const calls = (global.fetch as jest.Mock).mock.calls;
        expect(calls).toEqual([["/api/me"]]);
    });

    test("a failed refresh keeps the previous successful snapshot", async () => {
        const user: UserInfo = {
            user: { id: "anon", email: "", isAnonymous: true },
            credit: { payToUseBalance: 1, subscriptionBalance: 0 },
        };
        global.fetch = jest.fn(() => Promise.reject(new Error("offline"))) as typeof fetch;
        const store = await loadStore();
        store.applySiteUser(user);

        await store.refreshSiteUser();

        expect(store.getSiteUserSnapshot()).toEqual({ userInfo: user, userReady: true });
    });

    test("an in-flight refresh does not overwrite a newer apply", async () => {
        let resolveFetch: (value: Response) => void = () => {};
        global.fetch = jest.fn(() => new Promise<Response>((resolve) => {
            resolveFetch = resolve;
        })) as typeof fetch;
        const store = await loadStore();
        const formal: UserInfo = {
            user: { id: "user", email: "user@example.com", isAnonymous: false },
            credit: { payToUseBalance: 0, subscriptionBalance: 0 },
        };

        const pending = store.refreshSiteUser();
        store.applySiteUser(formal);
        resolveFetch({
            ok: true,
            json: () => Promise.resolve({ data: null }),
        } as Response);
        await pending;

        expect(store.getSiteUserSnapshot()).toEqual({ userInfo: formal, userReady: true });
    });
});
