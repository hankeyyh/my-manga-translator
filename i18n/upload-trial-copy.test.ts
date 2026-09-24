import { readdirSync, readFileSync } from "fs";
import path from "path";
import { describe, expect, test } from "@jest/globals";

const TRIAL_KEYS = [
    "trialTitle",
    "trialSubtitle",
    "exhaustedTitle",
    "exhaustedSubtitle",
    "loginContinue",
] as const;

describe("upload trial copy", () => {
    test("every locale binds {n} and does not hardcode a daily grant", () => {
        const dir = path.join(process.cwd(), "i18n/messages");
        const files = readdirSync(dir).filter((name) => name.endsWith(".json"));
        expect(files.length).toBeGreaterThan(0);

        for (const file of files) {
            const messages = JSON.parse(readFileSync(path.join(dir, file), "utf8")) as {
                upload: Record<string, string>;
            };
            for (const key of TRIAL_KEYS) {
                const value = messages.upload[key];
                expect(value).toEqual(expect.any(String));
                expect(value.length).toBeGreaterThan(0);
                expect(value).not.toMatch(/[45]/);
            }
            expect(messages.upload.trialTitle).toContain("{n}");
            expect(messages.upload.trialSubtitle).toContain("{n}");
        }
    });

    test("zh-cn matches the product copy", () => {
        const messages = JSON.parse(readFileSync(
            path.join(process.cwd(), "i18n/messages/zh-cn.json"),
            "utf8",
        )) as { upload: Record<string, string>; };

        expect(messages.upload.trialTitle).toBe("今日免费试用 · 还剩 {n} 积分");
        expect(messages.upload.trialSubtitle).toBe("可翻 {n} 页，无需登录");
        expect(messages.upload.exhaustedTitle).toBe("今日额度已用完");
        expect(messages.upload.exhaustedSubtitle).toBe("登录后继续翻译");
        expect(messages.upload.loginContinue).toBe("登录继续");
    });
});
