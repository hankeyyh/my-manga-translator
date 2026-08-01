import { getUserSubscription, listUserTransactions } from "@/actions/billing";
import { SubscriptionStatus } from "@/app/(main)/v2/home/billing/_components/subscription-status";
import { TransactionList } from "@/app/(main)/v2/home/billing/_components/transaction-list";

export default async function BillingPage() {
    const [subscriptionResult, transactionsResult] = await Promise.all([
        getUserSubscription(),
        listUserTransactions(),
    ]);

    const subscription = subscriptionResult.data ?? null;
    const page = transactionsResult.data ?? { items: [], nextCursor: null };

    return (
        <>
            <div>
                <h1 className="text-xl font-semibold">账单与订阅</h1>
            </div>
            <SubscriptionStatus subscription={subscription} />
            <TransactionList initialPage={page} />
        </>
    );
}
