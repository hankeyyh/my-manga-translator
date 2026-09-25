import { shanghaiGrantDate } from "@/biz/utils/time";

export const ANONYMOUS_TRIAL_COOKIE = "anonymous_trial";

export function readAnonymousTrialCookie(cookieHeader: string): string | null {
    const prefix = `${ANONYMOUS_TRIAL_COOKIE}=`;
    for (const part of cookieHeader.split(";")) {
        const trimmed = part.trim();
        if (!trimmed.startsWith(prefix)) {
            continue;
        }
        const raw = trimmed.slice(prefix.length);
        try {
            return decodeURIComponent(raw);
        } catch {
            return raw;
        }
    }
    return null;
}

export function hasTodayAnonymousTrialCookie(cookieHeader: string, now = new Date()): boolean {
    const value = readAnonymousTrialCookie(cookieHeader);
    if (!value) {
        return false;
    }
    return value === shanghaiGrantDate(now);
}
