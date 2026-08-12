"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
        router.push("/v2/home/history");
    };

    const onToggleTheme = () => {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
    };

    const totalCredits = (userInfo?.credit?.payToUseBalance ?? 0) + (userInfo?.credit?.subscriptionBalance ?? 0);

    return (
        <>
            {/* fixed 避免触控板顶部弹性回弹把 sticky header 一起拽走 */}
            <header className="fixed inset-x-0 top-0 z-50 border-b bg-background">
                <div className="mx-auto flex h-14 max-w-5xl items-center gap-2 px-4">
                    <a href="/v2" className="shrink-0 text-sm font-semibold">
                        Manga Sense
                    </a>
                    <nav className="ml-4 hidden items-center gap-1 md:flex">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/v2#tool">Manga Translate</Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/v2#pricing">Pricing</Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/v2#faq">FAQ</Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/v2/blogs">Blog</Link>
                        </Button>
                        <Button variant="ghost" size="sm">
                            Join Discord
                        </Button>
                    </nav>
                    <div className="ml-auto flex items-center gap-2">
                        <Badge variant="secondary">Credits · {totalCredits}</Badge>
                        <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    {lang}
                                    <ChevronDown className="size-3" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {LANGS.map((item) => (
                                    <DropdownMenuItem key={item} onSelect={() => setLang(item)}>
                                        {item}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                            variant="ghost"
                            size="icon"
                            aria-label="切换主题"
                            onClick={onToggleTheme}
                        >
                            <Sun className="size-4 dark:hidden" />
                            <Moon className="hidden size-4 dark:block" />
                        </Button>
                        {isLogin() ? <Button size="sm" onClick={onClickDashboard}>Dashboard</Button> : <Button size="sm" onClick={onClickLogin}>Login</Button>}
                    </div>
                </div>
            </header>
            <div className="h-14" aria-hidden />
        </>
    );
}
