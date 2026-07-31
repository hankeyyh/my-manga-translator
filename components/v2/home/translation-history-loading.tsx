import { Card, CardContent } from "@/components/ui/card";

export function TranslationHistoryLoading() {
    return (
        <Card className="gap-0 py-10 shadow-none">
            <CardContent className="px-4 text-center">
                <p className="text-sm text-muted-foreground">加载中…</p>
            </CardContent>
        </Card>
    );
}
