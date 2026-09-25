"use client";

import { useSyncExternalStore } from "react";
import { UserInfo } from "@/types/api/user-info";

export type SiteUserSnapshot = {
    userInfo: UserInfo | null;
    /**
     * 请求正常返回后为 true。网络失败保持 false，空态不把这次失败画成余额 0。
     */
    userReady: boolean;
};

const EMPTY_SNAPSHOT: SiteUserSnapshot = {
    userInfo: null,
    userReady: false,
};

let snapshot: SiteUserSnapshot = EMPTY_SNAPSHOT;
let epoch = 0;
const listeners = new Set<() => void>();

function emit(): void {
    for (const listener of [...listeners]) {
        listener();
    }
}

export function subscribeSiteUser(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

export function getSiteUserSnapshot(): SiteUserSnapshot {
    return snapshot;
}

export function getServerSiteUserSnapshot(): SiteUserSnapshot {
    return EMPTY_SNAPSHOT;
}

/** 顶栏挂载流程结束时写入。会作废尚未落地的 refresh。 */
export function applySiteUser(userInfo: UserInfo | null): void {
    epoch += 1;
    snapshot = { userInfo, userReady: true };
    emit();
}

/**
 * 只再读 GET /api/me。会话已在 cookie 里，刷新时不要 POST /api/auth/anonymous。
 * 请求失败或被更新的写入盖过时，保留上一份快照。
 */
export async function refreshSiteUser(): Promise<void> {
    const token = ++epoch;
    try {
        const res = await fetch("/api/me");
        if (!res.ok) {
            return;
        }
        const body = await (res.json() as Promise<{ data?: UserInfo | null; }>);
        if (token !== epoch) {
            return;
        }
        snapshot = { userInfo: body.data ?? null, userReady: true };
        emit();
    } catch {
        // 网络失败不把快照标成就绪，避免空态误显示用尽。
    }
}

export function useSiteUserSnapshot(): SiteUserSnapshot {
    return useSyncExternalStore(
        subscribeSiteUser,
        getSiteUserSnapshot,
        getServerSiteUserSnapshot,
    );
}
