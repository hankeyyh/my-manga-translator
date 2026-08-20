"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { CreditCard, History, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/components/utils";

const NAV_ITEMS = [
    {
        href: "/v2/home/history",
        label: "翻译历史",
        icon: History,
        match: (pathname: string) => pathname.startsWith("/v2/home/history"),
    },
    {
        href: "/v2/home/billing",
        label: "账单与订阅",
        icon: CreditCard,
        match: (pathname: string) => pathname.startsWith("/v2/home/billing"),
    },
] as const;

export function AccountNav() {
    const router = useRouter();
    const pathname = usePathname();
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
            {NAV_ITEMS.map(({ href, label, icon: Icon, match }) => {
                const active = match(pathname);
                return (
                    <Button
                        key={href}
                        asChild
                        variant={active ? "secondary" : "ghost"}
                        className={cn(
                            "h-auto w-full justify-start gap-2 px-3 py-2.5",
                            !active && "text-muted-foreground",
                        )}
                    >
                        <Link href={href}>
                            <Icon className="size-4" />
                            {label}
                        </Link>
                    </Button>
                );
            })}
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
