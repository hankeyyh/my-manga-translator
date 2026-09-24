/**
 * 检查是否登录，
 * 1. 如果是匿名用户，补发当日积分
 * 2. 如果未登录，创建匿名用户并发放试用积分
 */
import { getCurrentUserInfo } from "@/biz/loaders/get-current-user-info";
import { AuthService } from "@/biz/services/auth/auth-service";
import { CreditService } from "@/biz/services/credit/credit-service";
import { ANONYMOUS_TRIAL_COOKIE } from "@/biz/utils/anonymous-trial-cookie";
import { hashClientIp, normalizeClientIp } from "@/biz/utils/anonymous-trial-ip";
import { shanghaiGrantDate } from "@/biz/utils/time";
import { createServiceRoleClient } from "@/biz/utils/supabase/admin";
import { createServerClientForAnonymous } from "@/biz/utils/supabase/server";
import { API_SUCCESS_CODE } from "@/types/api/response";
import { UserBasicInfo } from "@/types/api/user-basic-info";
import { UserInfo } from "@/types/api/user-info";
import { ANONYMOUS_TRIAL_ALREADY_USED, BizResult, DB_ERROR_CODE, UNAUTHORIZED_ERROR_CODE } from "@/types/dto/response";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const result = await getCurrentUserInfo();
    if (result.error) {
        return NextResponse.json({ code: result.code, error: result.error.message }, { status: 500 });
    }
    // 已登录
    if (result.data) {
        const isAnonymous = result.data.user?.isAnonymous;
        if (isAnonymous && result.data.user) {
            const trialIp = trialIpHash(request.headers.get("cf-connecting-ip"));
            if (!trialIp.ok) {
                return anonymousTrialJson({ code: API_SUCCESS_CODE, data: result.data });
            }
            // 发放今日试用机分
            const granted = await grantDailyAnonymousBonus(result.data.user.id, trialIp.ipHash);
            return responseForGrant(granted, result.data.user);
        }
        return anonymousTrialJson({ code: API_SUCCESS_CODE, data: result.data });
    }
    // 未登录
    if (result.code === UNAUTHORIZED_ERROR_CODE) {
        const trialIp = trialIpHash(request.headers.get("cf-connecting-ip"));
        if (!trialIp.ok) {
            return anonymousTrialJson({ code: API_SUCCESS_CODE, data: null });
        }
        // 检查ip今日是否已经领取过
        const grantDate = shanghaiGrantDate();
        const creditService = CreditService.fromSupabase(createServiceRoleClient());
        if (trialIp.ipHash) {
            const found = await creditService.findAnonymousTrialGrant(trialIp.ipHash, grantDate);
            if (found.error) {
                return NextResponse.json({ code: found.code, error: "Internal Server Error" }, { status: 500 });
            }
            if (found.data) {
                return anonymousTrialJson({ code: String(ANONYMOUS_TRIAL_ALREADY_USED), data: null });
            }
        }
        // 注册匿名用户
        const supabase = await createServerClientForAnonymous();
        const authService = AuthService.fromSupabase(supabase);
        const signInResult = await authService.signInAnonymous();
        if (signInResult.error || !signInResult.data?.id) {
            return NextResponse.json({ code: DB_ERROR_CODE, error: "Internal Server Error" }, { status: 500 });
        }
        // 发放试用机分
        const granted = await grantDailyAnonymousBonus(signInResult.data.id, trialIp.ipHash);
        return responseForGrant(granted, signInResult.data);
    }

    return anonymousTrialJson({ code: API_SUCCESS_CODE, data: null });
}

async function responseForGrant(granted: BizResult<boolean>, user: UserBasicInfo) {
    if (granted.error) {
        return NextResponse.json({ code: granted.code, error: "Internal Server Error" }, { status: 500 });
    }
    const info = await readUserInfo(user);
    if (!info) {
        return NextResponse.json({ code: DB_ERROR_CODE, error: "Internal Server Error" }, { status: 500 });
    }
    // 今日已经发放过积分，拒绝
    if (granted.data === false) {
        return anonymousTrialJson({ code: String(ANONYMOUS_TRIAL_ALREADY_USED), data: info });
    }
    // 成功发放
    return anonymousTrialJson({ code: API_SUCCESS_CODE, data: info });
}

async function readUserInfo(user: UserBasicInfo): Promise<UserInfo | null> {
    const credits = await CreditService.fromSupabase(createServiceRoleClient()).getCreditBalance(user.id);
    if (credits.error) {
        console.error(`readUserInfo getCreditBalance fail, userId: ${user.id}, error: ${credits.error.message}`);
        return null;
    }
    return {
        credit: credits.data,
        user: {
            id: user.id,
            email: user.email,
            isAnonymous: user.isAnonymous,
        },
    };
}

function anonymousTrialJson(body: { code: string; data: UserInfo | null; }) {
    const response = NextResponse.json(body, { status: 200 });
    response.cookies.set(ANONYMOUS_TRIAL_COOKIE, shanghaiGrantDate(), {
        path: "/",
        sameSite: "lax",
        maxAge: 60 * 60 * 24,
        httpOnly: false,
    });
    return response;
}

function trialIpHash(clientIp: string | null): { ok: true; ipHash: string | null; } | { ok: false; } {
    const isDev = process.env.NODE_ENV === "development";
    if (!clientIp) {
        return isDev ? { ok: true, ipHash: null } : { ok: false };
    }
    const normalized = normalizeClientIp(clientIp);
    const ipHash = normalized ? hashClientIp(normalized) : null;
    if (!ipHash) {
        return isDev ? { ok: true, ipHash: null } : { ok: false };
    }
    return { ok: true, ipHash };
}

async function grantDailyAnonymousBonus(uid: string, ipHash: string | null): Promise<BizResult<boolean>> {
    const serviceSupabase = createServiceRoleClient();
    return await CreditService.fromSupabase(serviceSupabase).grantDailyAnonymousBonus(uid, ipHash);
}