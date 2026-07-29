import { UserRepository } from "@/biz/repositories/auth/user-repository";
import { UserCreditsRepository } from "@/biz/repositories/credit/user-credits";
import { PricingConfigRepository } from "@/biz/repositories/pricing/pricing-config";
import { TopUpConfigRepository } from "@/biz/repositories/topup/topup-config";
import { UserTransactionsRepository } from "@/biz/repositories/topup/user-transactions";
import { AuthService } from "@/biz/services/auth/auth-service";
import { CreditService } from "@/biz/services/credit/credit-service";
import { createServerClient } from "@/biz/utils/supabase/server";
import { UserInfo } from "@/types/api/user-info";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
    const supabase = await createServerClient();
    const authService = new AuthService(new UserRepository(supabase));
    const userResult = await authService.getCurrentUser();
    if (userResult.error) {
        return NextResponse.json({ error: "Internal Server Error", data: null }, { status: 500 });
    }
    if (!userResult.data) {
        return NextResponse.json({ error: null, data: null }, { status: 401 });
    }
    const userEntity = userResult.data;

    const creditService = new CreditService(
        new TopUpConfigRepository(supabase),
        new UserTransactionsRepository(supabase),
        new PricingConfigRepository(supabase),
        new UserCreditsRepository(supabase),
    );

    const userCreditsResult = await creditService.getCreditBalance(userEntity.id);
    if (userCreditsResult.error) {
        return NextResponse.json({ error: "Internal Server Error", data: null }, { status: 500 });
    }
    const userInfo: UserInfo = {
        credit: userCreditsResult.data!,
        user: {
            id: userEntity.id,
            email: userEntity.email,
        },
    };
    return NextResponse.json({ error: null, data: userInfo }, { status: 200 });
}