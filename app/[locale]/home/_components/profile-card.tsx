import { CcCard } from "@/design/design-system/components";

export type ProfileCardProps = {
    email: string;
    totalCredits: number;
};

export function ProfileCard({ email, totalCredits }: ProfileCardProps) {
    return (
        <CcCard className="rounded-[var(--cc-radius-lg)] p-4 lg:p-4" variant="outlined">
            <div>
                <p className="text-xs text-cc-text-muted">邮箱</p>
                <p className="mt-1 break-all text-sm text-cc-text-primary">{email}</p>
            </div>
            <div className="mt-4">
                <p className="text-xs text-cc-text-muted">积分余额</p>
                <p className="mt-1 font-headline text-xl font-semibold text-cc-brand-primary">
                    {totalCredits.toLocaleString()}
                </p>
            </div>
        </CcCard>
    );
}
