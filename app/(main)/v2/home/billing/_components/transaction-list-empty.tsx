import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function TransactionListEmpty() {
    return (
        <Card className="gap-0 py-10 shadow-none">
            <CardContent className="flex flex-col items-center gap-3 px-4 text-center">
                <p className="text-sm text-muted-foreground">暂无账单记录</p>
            </CardContent>
        </Card>
    );
}
