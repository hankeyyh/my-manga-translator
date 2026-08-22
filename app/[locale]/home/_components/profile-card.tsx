import { CcCard } from "@/design/design-system/components";
import { getTranslations } from "next-intl/server";

export type ProfileCardProps = {
    email: string;
    totalCredits: number;
};

export async function ProfileCard({ email, totalCredits }: ProfileCardProps) {
    const t = await getTranslations("home");

    return (
        <CcCard className="rounded-[var(--cc-radius-lg)] p-4 lg:p-4" variant="outlined">
            <div>
                <p className="text-xs text-cc-text-muted">{t("email")}</p>
                <p className="mt-1 break-all text-sm text-cc-text-primary">{email}</p>
            </div>
            <div className="mt-4">
                <p className="text-xs text-cc-text-muted">{t("creditBalance")}</p>
                <p className="mt-1 font-headline text-xl font-semibold text-cc-brand-primary">
                    {totalCredits.toLocaleString()}
                </p>
            </div>
        </CcCard>
    );
}
