import { UserInfo } from "@/types/api/user-info";

/** 与顶栏徽章相同：可用余额 = 按量余额 + 订阅余额。 */
export function totalCredits(userInfo: UserInfo | null | undefined): number {
    return (userInfo?.credit?.payToUseBalance ?? 0) + (userInfo?.credit?.subscriptionBalance ?? 0);
}

/** 与顶栏 isLogin() 相同：有用户且不是匿名会话。 */
export function isFormalLogin(userInfo: UserInfo | null | undefined): boolean {
    return userInfo != null && userInfo.user?.isAnonymous !== true;
}
