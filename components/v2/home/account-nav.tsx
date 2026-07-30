"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CreditCard, History, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";

export function AccountNav() {
    const router = useRouter();
    const [signingOut, setSigningOut] = useState(false);

    async function handleSignOut() {
        if (signingOut) return;
        setSigningOut(true);
        try {
            const res = await fetch("/api/auth/signout", { method: "POST" });
            if (res.ok) {
                router.push("/v2");
            }
        } finally {
            setSigningOut(false);
        }
    }

    return (
        <nav aria-label="Account" className="space-y-1">
            <Button
                variant="secondary"
                className="h-auto w-full justify-start gap-2 px-3 py-2.5"
                type="button"
            >
                <History className="size-4" />
                翻译历史
            </Button>
            <Button
                variant="ghost"
                className="h-auto w-full justify-start gap-2 px-3 py-2.5 text-muted-foreground"
                type="button"
            >
                <CreditCard className="size-4" />
                账单与订阅
            </Button>
            <div className="border-t pt-2">
                <Button
                    variant="ghost"
                    className="h-auto w-full justify-start gap-2 px-3 py-2.5 text-destructive"
                    disabled={signingOut}
                    onClick={handleSignOut}
                    type="button"
                >
                    <LogOut className="size-4" />
                    退出登录
                </Button>
            </div>
        </nav>
    );
}
