import { Suspense } from "react";
import { ClientPage } from "./client-page";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

function ConfirmFallback() {
    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">正在验证邮箱…</CardTitle>
                        <CardDescription>请稍候，正在完成注册确认。</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        </div>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<ConfirmFallback />}>
            <ClientPage />
        </Suspense>
    );
}
