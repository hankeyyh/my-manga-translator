"use client";

import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { CreditCard, History, LogOut } from "lucide-react";
import { useTranslations } from "next-intl";

import { CcButton } from "@/design/design-system/components";
import { cn } from "@/components/utils";

const NAV_ITEMS = [
    {
        href: "/home/history",
        labelKey: "history",
        icon: History,
        match: (pathname: string) => pathname.startsWith("/home/history"),
    },
    {
        href: "/home/billing",
        labelKey: "billing",
        icon: CreditCard,
        match: (pathname: string) => pathname.startsWith("/home/billing"),
    },
] as const;

export function AccountNav() {
    const router = useRouter();
    const pathname = usePathname();
    const t = useTranslations("home");
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
        <nav aria-label={t("navAria")} className="space-y-1">
            {NAV_ITEMS.map(({ href, labelKey, icon: Icon, match }) => {
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
                            {t(labelKey)}
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
                    {t("signOut")}
                </CcButton>
            </div>
        </nav>
    );
}
