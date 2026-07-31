import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Props = {
    onClearFilters: () => void;
};

export function TranslationHistoryEmpty({ onClearFilters }: Props) {
    return (
        <Card className="gap-0 py-10 shadow-none">
            <CardContent className="flex flex-col items-center gap-3 px-4 text-center">
                <p className="text-sm text-muted-foreground">
                    暂无翻译历史 / 无匹配结果
                </p>
                <div className="flex gap-2">
                    <Button size="sm" type="button" variant="outline" onClick={onClearFilters}>
                        清除筛选
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
