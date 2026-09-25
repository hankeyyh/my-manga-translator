"use client";

import {
    CcBadge,
    CcButton,
} from "@/components/cc";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
    Check,
    ChevronDown,
    Moon,
    Sun,
} from "lucide-react";
import { cn } from "@/components/utils";
import { UserInfo } from "@/types/api/user-info";
import { getPathname, Link, usePathname, useRouter } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { hasLocale, useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { hasTodayAnonymousTrialCookie } from "@/biz/utils/anonymous-trial-cookie";
import { useEffect, useState } from "react";

function pathnameWithoutLocale(pathname: string): string {
    const first = pathname.split("/")[1];
    if (!hasLocale(routing.locales, first)) {
        return pathname;
    }
    const rest = pathname.slice(`/${first}`.length);
    return rest === "" ? "/" : rest;
}

type Props = {
    userInfo?: UserInfo | null;
    showBlog: boolean;
    /**
     * 营销页（`/`、`/pricing`、`/faq`、`/blogs`、`/legal`）设为 true：SSR 只输出占位，挂载后请求 `/api/me` 再渲染积分与 Login/Dashboard。
     * 服务端不再等 Supabase，HTML 与用户无关，可与 middleware 的游客缓存、`revalidate` 配合。
     * 
     * 目的：提升页面响应速度，降低 TTFB。
     * 
     * `/home` 等需即时用户态的页面保持 false，使用 `userInfo`。
     */
    deferUser?: boolean;
};

export function ClientSiteHeader({ userInfo: initialUserInfo = null, showBlog, deferUser = false }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const locale = useLocale();
    const tLocale = useTranslations("locales");
    const tHeader = useTranslations("header");
    const tCommon = useTranslations("common");
    const { resolvedTheme, setTheme } = useTheme();
    const [userInfo, setUserInfo] = useState<UserInfo | null>(initialUserInfo);
    const [userReady, setUserReady] = useState(!deferUser);

    useEffect(() => {
        if (!deferUser) {
            return;
        }
        let cancelled = false;
        const fetchUser = async (): Promise<UserInfo | null> => {
            const res = await fetch("/api/me", { cache: "no-store" });
            const body = await (res.json() as Promise<{ data?: UserInfo | null; }>);
            return body.data ?? null;
        };
        const applyUser = (user: UserInfo | null) => {
            if (cancelled) {
                return;
            }
            setUserInfo(user);
            setUserReady(true);
        };

        void (async () => {
            try {
                const user = await fetchUser();
                if (cancelled) {
                    return;
                }
                const isFormalLogin = user != null && user.user?.isAnonymous === false;
                const isAnonymousLogin = user != null && user.user?.isAnonymous === true;
                // 正式用户 or 匿名用户且今日已发放过积分（设置过cookie），直接返回
                if (isFormalLogin || (isAnonymousLogin && hasTodayAnonymousTrialCookie(document.cookie))) {
                    applyUser(user);
                    return;
                }

                // 未登录 or 匿名用户且今日还未检查积分发放
                const response = await fetch("/api/auth/anonymous", { method: "POST", cache: "no-store" });
                if (!response.ok) {
                    console.error(`/api/auth/anonymous failed, status: ${response.status}, error: ${response.statusText}`);
                    applyUser(user);
                    return;
                }
                let anonymousData: UserInfo | null = null;
                try {
                    const body = await (response.json() as Promise<{ data?: UserInfo | null; }>);
                    anonymousData = body.data ?? null;
                } catch {
                    anonymousData = null;
                }
                // 补发结果在 anonymous 响应里。不要回退到调用前的 /api/me 余额。
                if (anonymousData) {
                    applyUser(anonymousData);
                    return;
                }
                const refreshed = await fetchUser();
                applyUser(refreshed ?? user);
            } catch (err) {
                const errMsg = err instanceof Error ? err.message : "Unknown Error";
                console.error(`load header user failed, error: ${errMsg}`);
                if (!cancelled) {
                    setUserReady(true);
                }
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [deferUser]);

    const isLogin = () => {
        return userInfo !== null && userInfo.user?.isAnonymous !== true;
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

    const onSelectLocale = (nextLocale: AppLocale) => {
        if (nextLocale === locale) return;
        // App Router 的 client navigation 会把新前缀叠在当前 [locale] 段上
        // （/zh-cn/blogs → /zh-cn/zh-tw/blogs）。走完整 URL 由 middleware 换前缀。
        const href = getPathname({
            href: pathnameWithoutLocale(pathname),
            locale: nextLocale,
            forcePrefix: true,
        });
        window.location.replace(`${href}${window.location.search}${window.location.hash}`);
    };

    const totalCredits = (userInfo?.credit?.payToUseBalance ?? 0) + (userInfo?.credit?.subscriptionBalance ?? 0);

    return (
        <>
            {/* fixed 避免触控板顶部弹性回弹把 sticky header 一起拽走 */}
            <header className="fixed inset-x-0 top-0 z-50 border-b border-cc-border/60 bg-cc-surface-white">
                <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-4">
                    <Link
                        href="/"
                        className="shrink-0 bg-gradient-to-r from-[var(--cc-brand-logo-from)] via-[var(--cc-brand-logo-via)] to-[var(--cc-brand-logo-to)] bg-clip-text font-headline text-base font-extrabold tracking-tight text-transparent"
                    >
                        {tCommon("brand")}
                    </Link>
                    <nav className="ms-4 hidden items-center gap-1 md:flex">
                        <CcButton variant="ghost" size="sm" asChild>
                            <Link href="/#tool">{tHeader("mangaTranslate")}</Link>
                        </CcButton>
                        <CcButton variant="ghost" size="sm" asChild>
                            <Link href="/pricing">{tHeader("pricing")}</Link>
                        </CcButton>
                        <CcButton variant="ghost" size="sm" asChild>
                            <Link href="/faq">{tHeader("faq")}</Link>
                        </CcButton>
                        {showBlog ? (
                            <CcButton variant="ghost" size="sm" asChild>
                                <Link href="/blogs">{tHeader("blog")}</Link>
                            </CcButton>
                        ) : null}
                        <CcButton variant="ghost" size="sm" asChild>
                            <Link href="https://discord.gg/qwX9Ygrrg" target="_blank" rel="noopener noreferrer">
                                <img
                                    src="/discord.png"
                                    alt=""
                                    aria-hidden
                                    className="size-3.5 dark:invert"
                                />
                                {tHeader("joinDiscord")}
                            </Link>
                        </CcButton>
                    </nav>
                    <div className="ms-auto flex items-center gap-2">
                        {userReady ? (
                            <CcBadge variant="accent">{tCommon("creditsCount", { count: totalCredits })}</CcBadge>
                        ) : (
                            <span className="inline-flex h-6 w-16" aria-hidden />
                        )}
                        <DropdownMenu modal={false}>
                            <DropdownMenuTrigger asChild>
                                <CcButton variant="outline" size="sm">
                                    {tLocale(locale)}
                                    <ChevronDown className="size-3" />
                                </CcButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                align="end"
                                className="max-h-[min(24rem,calc(100vh-5rem))] overflow-y-auto overscroll-contain"
                                onWheel={(event) => event.stopPropagation()}
                            >
                                {routing.locales.map((item) => {
                                    const isCurrent = item === locale;
                                    return (
                                        <DropdownMenuItem
                                            key={item}
                                            aria-current={isCurrent ? "true" : undefined}
                                            className={cn(
                                                isCurrent &&
                                                "bg-[var(--cc-brand-tint)] font-medium text-[var(--cc-brand-primary)] focus:bg-[var(--cc-brand-tint)] focus:text-[var(--cc-brand-primary)]",
                                            )}
                                            onSelect={() => onSelectLocale(item)}
                                        >
                                            {tLocale(item)}
                                            {isCurrent ? <Check className="ms-auto size-3.5" strokeWidth={3} /> : null}
                                        </DropdownMenuItem>
                                    );
                                })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <CcButton
                            variant="ghost"
                            size="icon"
                            className="size-9"
                            aria-label={tHeader("toggleTheme")}
                            onClick={onToggleTheme}
                        >
                            <Sun className="size-4 dark:hidden" />
                            <Moon className="hidden size-4 dark:block" />
                        </CcButton>
                        {!userReady ? (
                            <span className="inline-flex h-8 w-[5.5rem]" aria-hidden />
                        ) : isLogin() ? (
                            <CcButton size="sm" onClick={onClickDashboard}>{tHeader("dashboard")}</CcButton>
                        ) : (
                            <CcButton size="sm" onClick={onClickLogin}>{tHeader("login")}</CcButton>
                        )}
                    </div>
                </div>
            </header>
            <div className="h-14" aria-hidden />
        </>
    );
}
