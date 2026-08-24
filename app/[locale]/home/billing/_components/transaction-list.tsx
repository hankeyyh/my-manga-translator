"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { listUserTransactions } from "@/actions/list-user-transactions";
import type { ListUserTransactionsPage } from "@/types/dto/user-transaction";
import { CcBadge, CcButton } from "@/design/design-system/components";
import { TransactionListEmpty } from "@/app/[locale]/home/billing/_components/transaction-list-empty";
import type { UserTransaction } from "@/types/do/user-transaction";
import { SUCCESS_CODE } from "@/types/dto/response";
import { useTranslations } from "next-intl";

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

function statusBadgeVariant(status: string) {
    switch (status) {
        case "success":
            return "success" as const;
        case "failed":
            return "error" as const;
        case "pending":
            return "warning" as const;
        case "canceled":
            return "outline" as const;
        default:
            return "outline" as const;
    }
}

export function TransactionList({ initialPage }: Props) {
    const t = useTranslations("billing");
    const tHistory = useTranslations("history");
    const tStatus = useTranslations("status");
    const tCommon = useTranslations("common");
    const [transactions, setTransactions] = useState<UserTransaction[]>(initialPage.items);
    const [nextCursor, setNextCursor] = useState<string | null>(initialPage.nextCursor);
    const [isPending, startTransition] = useTransition();

    function handleLoadMore() {
        if (!nextCursor || isPending) return;
        startTransition(async () => {
            const result = await listUserTransactions({
                cursor: nextCursor,
            });
            if (result.code !== SUCCESS_CODE || !result.data) {
                toast(result.message || tCommon("unknownError"));
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
                <h2 className="font-headline text-sm font-semibold text-cc-text-primary">{t("transactions")}</h2>
            </div>

            {transactions.length === 0 ? (
                <TransactionListEmpty />
            ) : (
                <>
                    <div className="overflow-x-auto rounded-[var(--cc-radius-lg)] border border-cc-border/40 bg-cc-surface-white">
                        <table className="w-full min-w-[560px] text-start text-xs">
                            <thead className="bg-cc-surface-page text-[10px] uppercase tracking-wide text-cc-text-muted">
                                <tr>
                                    <th className="px-3 py-2 font-medium">
                                        {t("columns.createdAt")}
                                    </th>
                                    <th className="px-3 py-2 text-end font-medium">
                                        {t("columns.amount")}
                                    </th>
                                    <th className="px-3 py-2 text-end font-medium">
                                        {t("columns.credits")}
                                    </th>
                                    <th className="px-3 py-2 font-medium">
                                        {t("columns.type")}
                                    </th>
                                    <th className="px-3 py-2 font-medium">
                                        {t("columns.status")}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="text-cc-text-secondary">
                                {transactions.map((tx) => (
                                    <tr key={tx.id} className="border-t border-cc-border/40">
                                        <td className="px-3 py-2 whitespace-nowrap">
                                            {formatDateTime(tx.createdAt)}
                                        </td>
                                        <td className="px-3 py-2 text-end tabular-nums" dir="ltr">
                                            {formatAmount(tx.rechargeAmount)}
                                        </td>
                                        <td className="px-3 py-2 text-end tabular-nums" dir="ltr">
                                            {formatCredits(tx.credits)}
                                        </td>
                                        <td className="px-3 py-2">
                                            {tx.transactionType === "pay-to-use" || tx.transactionType === "subscription"
                                                ? t(`transactionType.${tx.transactionType}`)
                                                : tx.transactionType}
                                        </td>
                                        <td className="px-3 py-2">
                                            <CcBadge
                                                variant={statusBadgeVariant(
                                                    tx.transactionStatus,
                                                )}
                                            >
                                                {tx.transactionStatus === "success"
                                                    || tx.transactionStatus === "failed"
                                                    || tx.transactionStatus === "pending"
                                                    || tx.transactionStatus === "canceled"
                                                    ? tStatus(tx.transactionStatus)
                                                    : tx.transactionStatus}
                                            </CcBadge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {nextCursor && (
                        <div className="flex justify-center">
                            <CcButton
                                size="sm"
                                type="button"
                                variant="outline"
                                disabled={isPending}
                                onClick={handleLoadMore}
                            >
                                {isPending ? tHistory("loading") : tHistory("loadMore")}
                            </CcButton>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
