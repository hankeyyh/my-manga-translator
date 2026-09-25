export type UploadEmptyReminder = "pending" | "hidden" | "trial" | "exhausted";

/**
 * 上传区展开空态的试用提醒。
 * 未就绪一律 pending，避免先闪用尽或一个假的剩余。
 * 剩余 1 仍是 trial，没有单独的「将尽」态。
 */
export function deriveUploadEmptyReminder(input: {
    userReady: boolean;
    compact: boolean;
    isFormalLogin: boolean;
    balance: number;
}): UploadEmptyReminder {
    if (!input.userReady) {
        return "pending";
    }
    if (input.compact || input.isFormalLogin) {
        return "hidden";
    }
    if (input.balance > 0) {
        return "trial";
    }
    return "exhausted";
}
