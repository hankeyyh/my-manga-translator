import { CcCard } from "@/design/design-system/components";

export function TransactionListEmpty() {
    return (
        <CcCard className="items-center rounded-[var(--cc-radius-lg)] p-10 text-center lg:p-10" variant="outlined">
            <p className="text-sm text-cc-text-muted">暂无账单记录</p>
        </CcCard>
    );
}
