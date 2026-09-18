"use client";

import { CcCard } from "@/components/cc";
import { useTranslations } from "next-intl";

export function TransactionListEmpty() {
    const t = useTranslations("billing");

    return (
        <CcCard className="items-center rounded-[var(--cc-radius-lg)] p-10 text-center lg:p-10" variant="outlined">
            <p className="text-sm text-cc-text-muted">{t("emptyTransactions")}</p>
        </CcCard>
    );
}
