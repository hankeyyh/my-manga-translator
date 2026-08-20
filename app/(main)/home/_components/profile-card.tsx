import { Card, CardContent } from "@/components/ui/card";

export type ProfileCardProps = {
    email: string;
    totalCredits: number;
};

export function ProfileCard({ email, totalCredits }: ProfileCardProps) {
    return (
        <Card className="gap-0 py-4 shadow-none">
            <CardContent className="space-y-4 px-4">
                <div>
                    <p className="text-xs text-muted-foreground">邮箱</p>
                    <p className="mt-1 break-all text-sm">{email}</p>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">积分余额</p>
                    <p className="mt-1 text-xl font-semibold">
                        {totalCredits.toLocaleString()}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
