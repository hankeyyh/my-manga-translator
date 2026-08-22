import { Suspense } from "react";
import { ClientPage } from "./client-page";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { getTranslations } from "next-intl/server";

async function ConfirmFallback() {
    const t = await getTranslations("auth.confirm");

    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">{t("verifyingTitle")}</CardTitle>
                        <CardDescription>{t("verifyingDescription")}</CardDescription>
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
