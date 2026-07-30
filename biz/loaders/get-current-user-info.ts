import { cache } from "react";

import { UserRepository } from "@/biz/repositories/auth/user-repository";
import { UserCreditsRepository } from "@/biz/repositories/credit/user-credits";
import { PricingConfigRepository } from "@/biz/repositories/pricing/pricing-config";
import { TopUpConfigRepository } from "@/biz/repositories/topup/topup-config";
import { UserTransactionsRepository } from "@/biz/repositories/topup/user-transactions";
import { createServerClient } from "@/biz/utils/supabase/server";
import { UserInfo } from "@/types/api/user-info";
import {
    BizResult,
    DB_ERROR_CODE,
    SUCCESS_CODE,
    UNAUTHORIZED_ERROR_CODE,
} from "@/types/dto/response";
import { AuthService } from "../services/auth/auth-service";
import { CreditService } from "../services/credit/credit-service";

export const getCurrentUserInfo = cache(async (): Promise<BizResult<UserInfo>> => {
    try {
        const supabase = await createServerClient();
        const authService = new AuthService(new UserRepository(supabase));
        const userResult = await authService.getCurrentUser();

        if (userResult.error) {
            console.error(`getCurrentUserInfo getCurrentUser fail: ${userResult.error}`);
            return { data: null, error: userResult.error, code: DB_ERROR_CODE };
        }
        if (!userResult.data) {
            return { data: null, error: null, code: UNAUTHORIZED_ERROR_CODE };
        }

        const creditService = new CreditService(
            new TopUpConfigRepository(supabase),
            new UserTransactionsRepository(supabase),
            new PricingConfigRepository(supabase),
            new UserCreditsRepository(supabase),
        );
        const creditsResult = await creditService.getCreditBalance(userResult.data.id);
        if (creditsResult.error) {
            console.error(`getCurrentUserInfo getCreditBalance fail: ${creditsResult.error}`);
            return { data: null, error: creditsResult.error, code: DB_ERROR_CODE };
        }

        return {
            data: {
                credit: creditsResult.data!,
                user: {
                    id: userResult.data.id,
                    email: userResult.data.email,
                },
            },
            error: null,
            code: SUCCESS_CODE,
        };
    } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown Error");
        console.error(`getCurrentUserInfo unexpected error: ${error.message}`);
        return { data: null, error, code: DB_ERROR_CODE };
    }
});
