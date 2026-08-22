import { getUserSubscription } from "@/actions/get-user-subscription";
import { listUserTransactions } from "@/actions/list-user-transactions";
import { SubscriptionStatus } from "@/app/[locale]/home/billing/_components/subscription-status";
import { TransactionList } from "@/app/[locale]/home/billing/_components/transaction-list";
import { CreditService } from "@/biz/services/credit/credit-service";
import { createServerClient } from "@/biz/utils/supabase/server";
import { getTranslations } from "next-intl/server";

export default async function BillingPage() {
    const t = await getTranslations("billing");
    const supabase = await createServerClient();
    const [subscriptionResult, transactionsResult, topupConfigResult] =
        await Promise.all([
            getUserSubscription(),
            listUserTransactions(),
            CreditService.fromSupabase(supabase).getAllTopUpConfig(),
        ]);

    const subscription = subscriptionResult.data ?? null;
    const page = transactionsResult.data ?? { items: [], nextCursor: null };
    const topUpConfigs = topupConfigResult.data ?? [];

    return (
        <>
            <div>
                <h1 className="font-headline text-xl font-bold text-cc-text-primary">{t("title")}</h1>
            </div>
            <SubscriptionStatus
                subscription={subscription}
                topUpConfigs={topUpConfigs}
            />
            <TransactionList initialPage={page} />
        </>
    );
}
