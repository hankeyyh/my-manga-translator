export type PageStatusSnap = {
    imageId?: string;
    status?: string;
};

/**
 * 轮询里是否要重拉一次 /api/me。
 * 某张图首次变为 failed（失败退回）时刷新；成功收口（不再轮询且已有完成图）再刷新一次。
 * 状态没变的 tick 不刷新。
 */
export function shouldRefreshCreditsAfterPoll(
    previous: readonly PageStatusSnap[],
    next: readonly PageStatusSnap[],
    pollingStopped: boolean,
): boolean {
    const before = new Map<string, string | undefined>();
    for (const page of previous) {
        if (page.imageId) {
            before.set(page.imageId, page.status);
        }
    }
    for (const page of next) {
        if (page.imageId && page.status === "failed" && before.get(page.imageId) !== "failed") {
            return true;
        }
    }
    if (!pollingStopped) {
        return false;
    }
    return next.some((page) => page.status === "completed");
}
