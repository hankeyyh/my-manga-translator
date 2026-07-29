import { UserRepository } from "@/biz/repositories/auth/user-repository";
import { UserCreditsRepository } from "@/biz/repositories/credit/user-credits";
import { PricingConfigRepository } from "@/biz/repositories/pricing/pricing-config";
import { TopUpConfigRepository } from "@/biz/repositories/topup/topup-config";
import { UserTransactionsRepository } from "@/biz/repositories/topup/user-transactions";
import { AuthService } from "@/biz/services/auth/auth-service";
import { CreditService } from "@/biz/services/credit/credit-service";
import { createServerClient } from "@/biz/utils/supabase/server";
import { UserInfo } from "@/types/api/user-info";
import { ClientSiteHeader } from "./client-site-header";

export async function SiteHeader() {
    let userInfo: UserInfo | null = null;

    try {
        const supabase = await createServerClient();
        const authService = new AuthService(new UserRepository(supabase));
        const userResult = await authService.getCurrentUser();

        if (userResult.error) {
            console.error(`SiteHeader getCurrentUser fail: ${userResult.error}`);
        } else if (userResult.data) {
            const creditService = new CreditService(
                new TopUpConfigRepository(supabase),
                new UserTransactionsRepository(supabase),
                new PricingConfigRepository(supabase),
                new UserCreditsRepository(supabase),
            );
            const creditsResult = await creditService.getCreditBalance(userResult.data.id);
            if (creditsResult.error) {
                console.error(`SiteHeader getCreditBalance fail: ${creditsResult.error}`);
            } else {
                userInfo = {
                    credit: creditsResult.data!,
                    user: {
                        id: userResult.data.id,
                        email: userResult.data.email,
                    },
                };
            }
        }
    } catch (err) {
        const errMsg = err instanceof Error ? err.message : "Unknown Error";
        console.error(`SiteHeader unexpected error: ${errMsg}`);
    }

    return <ClientSiteHeader userInfo={userInfo} />;
}
