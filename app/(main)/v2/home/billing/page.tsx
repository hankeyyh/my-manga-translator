import { getUserSubscription } from "@/actions/get-user-subscription";
import { listUserTransactions } from "@/actions/list-user-transactions";
import { SubscriptionStatus } from "@/app/(main)/v2/home/billing/_components/subscription-status";
import { TransactionList } from "@/app/(main)/v2/home/billing/_components/transaction-list";
import { CreditService } from "@/biz/services/credit/credit-service";
import { createServerClient } from "@/biz/utils/supabase/server";

export default async function BillingPage() {
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
                <h1 className="text-xl font-semibold">账单与订阅</h1>
            </div>
            <SubscriptionStatus
                subscription={subscription}
                topUpConfigs={topUpConfigs}
            />
            <TransactionList initialPage={page} />
        </>
    );
}
