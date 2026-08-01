"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { listUserTransactions } from "@/actions/billing";
import type { ListUserTransactionsPage } from "@/types/dto/user-transaction";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TransactionListEmpty } from "@/app/(main)/v2/home/billing/_components/transaction-list-empty";
import type { UserTransaction } from "@/types/do/user-transaction";

type Props = {
    initialPage: ListUserTransactionsPage;
};

function formatDateTime(iso: string) {
    return iso.slice(0, 16).replace("T", " ");
}

function formatAmount(amount: number) {
    return `$${Number(amount).toFixed(2)}`;
}

function formatCredits(credits: number | null) {
    if (credits == null) return "—";
    return credits.toLocaleString();
}

function statusBadgeClassName(status: string) {
    switch (status) {
        case "success":
            return "border-transparent bg-green-100 text-green-700 hover:bg-green-100";
        case "failed":
            return "border-transparent bg-red-100 text-red-700 hover:bg-red-100";
        case "pending":
            return "border-transparent bg-yellow-100 text-yellow-700 hover:bg-yellow-100";
        case "canceled":
            return "border-transparent bg-muted text-muted-foreground hover:bg-muted";
        default:
            return "";
    }
}

export function TransactionList({ initialPage }: Props) {
    const [transactions, setTransactions] = useState<UserTransaction[]>(initialPage.items);
    const [nextCursor, setNextCursor] = useState<string | null>(initialPage.nextCursor);
    const [isPending, startTransition] = useTransition();

    function handleLoadMore() {
        if (!nextCursor || isPending) return;
        startTransition(async () => {
            const result = await listUserTransactions({
                cursor: nextCursor,
            });
            if (result.error || !result.data) {
                toast(result.error?.message ?? "Unknown Error");
                return;
            }
            startTransition(() => {
                setTransactions((prev) => [...prev, ...result.data!.items]);
                setNextCursor(result.data!.nextCursor);
            });
        });
    }

    return (
        <div className="space-y-3">
            <div>
                <h2 className="text-sm font-semibold">交易记录</h2>
            </div>

            {transactions.length === 0 ? (
                <TransactionListEmpty />
            ) : (
                <>
                    <div className="overflow-x-auto rounded-md border">
                        <table className="w-full min-w-[560px] text-left text-xs">
                            <thead className="bg-muted/50 text-[10px] uppercase tracking-wide text-muted-foreground">
                                <tr>
                                    <th className="px-3 py-2 font-medium">
                                        created_at
                                    </th>
                                    <th className="px-3 py-2 text-right font-medium">
                                        recharge_amount
                                    </th>
                                    <th className="px-3 py-2 text-right font-medium">
                                        Credits
                                    </th>
                                    <th className="px-3 py-2 font-medium">
                                        transaction_type
                                    </th>
                                    <th className="px-3 py-2 font-medium">
                                        transaction_status
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((tx) => (
                                    <tr key={tx.id} className="border-t">
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            {formatDateTime(tx.createdAt)}
                                        </td>
                                        <td className="px-3 py-2 text-right tabular-nums">
                                            {formatAmount(tx.rechargeAmount)}
                                        </td>
                                        <td className="px-3 py-2 text-right tabular-nums">
                                            {formatCredits(tx.credits)}
                                        </td>
                                        <td className="px-3 py-2">
                                            {tx.transactionType}
                                        </td>
                                        <td className="px-3 py-2">
                                            <Badge
                                                variant="outline"
                                                className={statusBadgeClassName(
                                                    tx.transactionStatus,
                                                )}
                                            >
                                                {tx.transactionStatus}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {nextCursor && (
                        <div className="flex justify-center">
                            <Button
                                size="sm"
                                type="button"
                                variant="outline"
                                disabled={isPending}
                                onClick={handleLoadMore}
                            >
                                {isPending ? "加载中…" : "加载更多"}
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
