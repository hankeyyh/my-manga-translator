import { describe, expect, test } from "@jest/globals";
import { hasTodayAnonymousTrialCookie } from "@/biz/utils/anonymous-trial-cookie";

describe("hasTodayAnonymousTrialCookie", () => {
    const shanghaiMidnight = new Date("2026-09-24T16:00:00Z");

    test("cookie from the previous Shanghai day is not today", () => {
        expect(hasTodayAnonymousTrialCookie("anonymous_trial=2026-09-24", shanghaiMidnight)).toBe(false);
    });

    test("cookie dated today skips another refill check", () => {
        expect(hasTodayAnonymousTrialCookie("anonymous_trial=2026-09-25", shanghaiMidnight)).toBe(true);
    });

    test("reads the trial cookie when separators have no space", () => {
        const header = "sb-auth-token=abc;anonymous_trial=2026-09-24;other=1";
        expect(hasTodayAnonymousTrialCookie(header, shanghaiMidnight)).toBe(false);
    });
});
