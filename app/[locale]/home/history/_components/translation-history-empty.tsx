import { CcButton, CcCard } from "@/design/design-system/components";

type Props = {
    onClearFilters: () => void;
};

export function TranslationHistoryEmpty({ onClearFilters }: Props) {
    return (
        <CcCard className="items-center rounded-[var(--cc-radius-lg)] p-10 text-center lg:p-10" variant="outlined">
            <p className="text-sm text-cc-text-muted">
                暂无翻译历史 / 无匹配结果
            </p>
            <CcButton className="mt-3" size="sm" type="button" variant="outline" onClick={onClearFilters}>
                清除筛选
            </CcButton>
        </CcCard>
    );
}
