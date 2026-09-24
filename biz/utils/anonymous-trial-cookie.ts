import { shanghaiGrantDate } from "@/biz/utils/time";

export const ANONYMOUS_TRIAL_COOKIE = "anonymous_trial";

export function hasTodayAnonymousTrialCookie(cookieHeader: string, now = new Date()): boolean {
    const prefix = `${ANONYMOUS_TRIAL_COOKIE}=`;
    const pair = cookieHeader.split("; ").find((part) => part.startsWith(prefix));
    if (!pair) {
        return false;
    }
    return decodeURIComponent(pair.slice(prefix.length)) === shanghaiGrantDate(now);
}
