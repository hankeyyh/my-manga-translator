"use client";

import { isFormalLogin } from "@/components/site-user";
import {
    getSiteUserSnapshot,
    refreshSiteUser,
    type SiteUserSnapshot,
} from "@/components/site-user-store";

/**
 * 快照已就绪且不是正式登录时，新购应去登录页。
 * 未就绪不拦截：营销页顶栏可能还在拉用户，误跳会挡住正式用户结账。
 */
export function shouldRedirectCheckoutToLogin(snapshot: SiteUserSnapshot): boolean {
    if (!snapshot.userReady) {
        return false;
    }
    return !isFormalLogin(snapshot.userInfo);
}

/** 新购前解析访问权。快照未就绪时先读一次 /api/me。 */
export async function resolveCheckoutAccess(): Promise<"allow" | "login"> {
    let snapshot = getSiteUserSnapshot();
    if (!snapshot.userReady) {
        await refreshSiteUser();
        snapshot = getSiteUserSnapshot();
    }
    return shouldRedirectCheckoutToLogin(snapshot) ? "login" : "allow";
}

/** 非正式登录则跳转登录页。返回 true 表示可以继续结账。 */
export async function continueCheckoutOrRedirect(
    redirectToLogin: () => void,
): Promise<boolean> {
    if ((await resolveCheckoutAccess()) === "login") {
        redirectToLogin();
        return false;
    }
    return true;
}
