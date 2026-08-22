"use client";

import { CcButton, CcCard } from "@/design/design-system/components";
import { useTranslations } from "next-intl";

type Props = {
    onClearFilters: () => void;
};

export function TranslationHistoryEmpty({ onClearFilters }: Props) {
    const t = useTranslations("history");

    return (
        <CcCard className="items-center rounded-[var(--cc-radius-lg)] p-10 text-center lg:p-10" variant="outlined">
            <p className="text-sm text-cc-text-muted">
                {t("empty")}
            </p>
            <CcButton className="mt-3" size="sm" type="button" variant="outline" onClick={onClearFilters}>
                {t("clearFilters")}
            </CcButton>
        </CcCard>
    );
}
