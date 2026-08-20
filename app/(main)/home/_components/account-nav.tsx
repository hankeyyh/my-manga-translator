"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { CreditCard, History, LogOut } from "lucide-react";

import { CcButton } from "@/design/design-system/components";
import { cn } from "@/components/utils";

const NAV_ITEMS = [
    {
        href: "/home/history",
        label: "翻译历史",
        icon: History,
        match: (pathname: string) => pathname.startsWith("/home/history"),
    },
    {
        href: "/home/billing",
        label: "账单与订阅",
        icon: CreditCard,
        match: (pathname: string) => pathname.startsWith("/home/billing"),
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
                router.push("/");
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
                    <CcButton
                        key={href}
                        asChild
                        variant={active ? "soft" : "ghost"}
                        className={cn(
                            "h-auto w-full justify-start gap-2 px-3 py-2.5",
                            !active && "text-cc-text-muted",
                        )}
                    >
                        <Link href={href}>
                            <Icon className="size-4" />
                            {label}
                        </Link>
                    </CcButton>
                );
            })}
            <div className="border-t border-cc-border/40 pt-2">
                <CcButton
                    variant="ghost"
                    className="h-auto w-full justify-start gap-2 px-3 py-2.5 text-[var(--cc-status-error)] hover:text-[var(--cc-status-error)]"
                    disabled={signingOut}
                    onClick={handleSignOut}
                    type="button"
                >
                    <LogOut className="size-4" />
                    退出登录
                </CcButton>
            </div>
        </nav>
    );
}
