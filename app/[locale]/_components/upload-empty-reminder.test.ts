import { describe, expect, test } from "@jest/globals";
import { isFormalLogin, totalCredits } from "@/components/site-user";
import { UserInfo } from "@/types/api/user-info";
import { deriveUploadEmptyReminder } from "./upload-empty-reminder";

function anonymous(balance: number): UserInfo {
    return {
        user: { id: "anon", email: "", isAnonymous: true },
        credit: { payToUseBalance: balance, subscriptionBalance: 0 },
    };
}

function formal(balance: number): UserInfo {
    return {
        user: { id: "user", email: "user@example.com", isAnonymous: false },
        credit: { payToUseBalance: balance, subscriptionBalance: 0 },
    };
}

describe("deriveUploadEmptyReminder", () => {
    test("remaining 1 stays trial", () => {
        const user = anonymous(1);
        expect(totalCredits(user)).toBe(1);
        expect(deriveUploadEmptyReminder({
            userReady: true,
            compact: false,
            isFormalLogin: isFormalLogin(user),
            balance: totalCredits(user),
        })).toBe("trial");
    });

    test("formal login is hidden even when balance is 0", () => {
        const user = formal(0);
        expect(deriveUploadEmptyReminder({
            userReady: true,
            compact: false,
            isFormalLogin: isFormalLogin(user),
            balance: totalCredits(user),
        })).toBe("hidden");
    });

    test("compact empty state is hidden", () => {
        const user = anonymous(3);
        expect(deriveUploadEmptyReminder({
            userReady: true,
            compact: true,
            isFormalLogin: isFormalLogin(user),
            balance: totalCredits(user),
        })).toBe("hidden");
    });

    test("not ready stays pending and does not flash exhausted or a fake remainder", () => {
        expect(deriveUploadEmptyReminder({
            userReady: false,
            compact: false,
            isFormalLogin: false,
            balance: 0,
        })).toBe("pending");
        expect(deriveUploadEmptyReminder({
            userReady: false,
            compact: false,
            isFormalLogin: false,
            balance: 5,
        })).toBe("pending");
    });

    test("ready null session is exhausted", () => {
        const user = null;
        expect(isFormalLogin(user)).toBe(false);
        expect(totalCredits(user)).toBe(0);
        expect(deriveUploadEmptyReminder({
            userReady: true,
            compact: false,
            isFormalLogin: isFormalLogin(user),
            balance: totalCredits(user),
        })).toBe("exhausted");
    });

    test("adds pay-to-use and subscription balances", () => {
        const user: UserInfo = {
            user: { id: "anon", email: "", isAnonymous: true },
            credit: { payToUseBalance: 2, subscriptionBalance: 3 },
        };
        expect(totalCredits(user)).toBe(5);
        expect(deriveUploadEmptyReminder({
            userReady: true,
            compact: false,
            isFormalLogin: false,
            balance: totalCredits(user),
        })).toBe("trial");
    });
});
