"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
    ChevronDown,
    Moon,
} from "lucide-react";
import { UserInfo } from "@/types/api/user-info";
import { useRouter } from "next/navigation";

type Props = {
    userInfo: UserInfo | null
}

export function ClientSiteHeader({ userInfo }: Props) {
    const router = useRouter();

    const isLogin = () => {
        return userInfo !== null;
    };

    const onClickLogin = () => {
        router.push("/auth/login");
    };

    const onClickDashboard = () => {
        router.push("/v2/home/history");
    };

    const totalCredits = (userInfo?.credit?.payToUseBalance ?? 0) + (userInfo?.credit?.subscriptionBalance ?? 0);

    return (
        <header className="sticky top-0 z-50 border-b bg-background">
            <div className="mx-auto flex h-14 max-w-5xl items-center gap-2 px-4">
                <a href="/v2" className="shrink-0 text-sm font-semibold">
                    AI Manga Translator
                </a>
                <nav className="ml-4 hidden items-center gap-1 md:flex">
                    <Button variant="ghost" size="sm" asChild>
                        <a href="/v2#tool">Manga Translate</a>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                        <a href="/v2#pricing">Pricing</a>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                        <a href="/v2#faq">FAQ</a>
                    </Button>
                    <Button variant="ghost" size="sm">
                        Join Discord
                    </Button>
                </nav>
                <div className="ml-auto flex items-center gap-2">
                    <Badge variant="secondary">Credits · {totalCredits}</Badge>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                Lang
                                <ChevronDown className="size-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>中文</DropdownMenuItem>
                            <DropdownMenuItem>English</DropdownMenuItem>
                            <DropdownMenuItem>日本語</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="ghost" size="icon" aria-label="主题">
                        <Moon className="size-4" />
                    </Button>
                    {isLogin() ? <Button size="sm" onClick={onClickDashboard}>Dashboard</Button> : <Button size="sm" onClick={onClickLogin}>Login</Button>}
                </div>
            </div>
        </header>
    );
}