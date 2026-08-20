"use client";

import { useState } from "react";
import {
    CcBadge,
    CcButton,
} from "@/design/design-system/components";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
    ChevronDown,
    Moon,
    Sun,
} from "lucide-react";
import { UserInfo } from "@/types/api/user-info";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import Link from "next/link";

const LANGS = ["简体中文", "English", "日本語"] as const;

type Props = {
    userInfo: UserInfo | null
}

export function ClientSiteHeader({ userInfo }: Props) {
    const router = useRouter();
    const { resolvedTheme, setTheme } = useTheme();
    const [lang, setLang] = useState<string>("简体中文");

    const isLogin = () => {
        return userInfo !== null;
    };

    const onClickLogin = () => {
        router.push("/auth/login");
    };

    const onClickDashboard = () => {
        router.push("/home/history");
    };

    const onToggleTheme = () => {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
    };

    const totalCredits = (userInfo?.credit?.payToUseBalance ?? 0) + (userInfo?.credit?.subscriptionBalance ?? 0);

    return (
        <>
            {/* fixed 避免触控板顶部弹性回弹把 sticky header 一起拽走 */}
            <header className="fixed inset-x-0 top-0 z-50 border-b border-cc-border/60 bg-cc-surface-white/90 backdrop-blur-xl">
                <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-4">
                    <a href="/" className="shrink-0 font-headline text-sm font-bold text-cc-text-primary">
                        Manga Sense
                    </a>
                    <nav className="ml-4 hidden items-center gap-1 md:flex">
                        <CcButton variant="ghost" size="sm" asChild>
                            <Link href="/#tool">Manga Translate</Link>
                        </CcButton>
                        <CcButton variant="ghost" size="sm" asChild>
                            <Link href="/#pricing">Pricing</Link>
                        </CcButton>
                        <CcButton variant="ghost" size="sm" asChild>
                            <Link href="/#faq">FAQ</Link>
                        </CcButton>
                        <CcButton variant="ghost" size="sm" asChild>
                            <Link href="/blogs">Blog</Link>
                        </CcButton>
                        <CcButton variant="ghost" size="sm">
                            Join Discord
                        </CcButton>
                    </nav>
                    <div className="ml-auto flex items-center gap-2">
                        <CcBadge variant="accent">Credits · {totalCredits}</CcBadge>
                        <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                                <CcButton variant="outline" size="sm">
                                    {lang}
                                    <ChevronDown className="size-3" />
                                </CcButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {LANGS.map((item) => (
                                    <DropdownMenuItem key={item} onSelect={() => setLang(item)}>
                                        {item}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <CcButton
                            variant="ghost"
                            size="icon"
                            className="size-9"
                            aria-label="切换主题"
                            onClick={onToggleTheme}
                        >
                            <Sun className="size-4 dark:hidden" />
                            <Moon className="hidden size-4 dark:block" />
                        </CcButton>
                        {isLogin() ? (
                            <CcButton size="sm" onClick={onClickDashboard}>Dashboard</CcButton>
                        ) : (
                            <CcButton size="sm" onClick={onClickLogin}>Login</CcButton>
                        )}
                    </div>
                </div>
            </header>
            <div className="h-14" aria-hidden />
        </>
    );
}
