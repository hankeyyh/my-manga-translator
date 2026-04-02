"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

/** 与 translate 页一致的导航项，便于首页锚点与路由复用 */
export const SITE_NAV_ITEMS = [
  { key: "workbench" as const, href: "/translate", label: "翻译" },
  { key: "pricing" as const, href: "/#pricing", label: "价格" },
  { key: "blog" as const, href: "#", label: "Blog" },
  { key: "faq" as const, href: "/#faq", label: "FAQ" },
] as const;

export function SiteHeader() {
  const router = useRouter();
  const [authState, setAuthState] = useState<"authed" | "anon">(
    "anon",
  );

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getClaims();
        const user = data?.claims;

        console.log("checkAuth, user", user);

        if (!cancelled) setAuthState(user ? "authed" : "anon");
      } catch (err) {
        // 异常时保守处理：当作未登录
        console.error("checkAuth error", err);
        if (!cancelled) setAuthState("anon");
      }
    }

    checkAuth();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleUserCenterClick = useCallback(() => {
    router.push(authState === "authed" ? "/home" : "/auth/login");
  }, [authState, router]);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/40 bg-[#f8f9fb]/80 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-8">
        <div className="flex items-center gap-8">
          <Link className="flex items-center gap-2" href="/">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0053dd] text-white">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="font-headline text-xl font-bold tracking-tighter text-[#2d3337]">
              ComicCurator
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            {SITE_NAV_ITEMS.map((item) => {
           
              return (
                <Link
                  key={item.key}
                  className={cn(
                    "transition-colors",
                    "text-[#2d3337] hover:text-[#0053dd]",
                  )}
                  href={item.href}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Button
            asChild
            className="scale-95 rounded-full bg-[#0053dd] px-5 py-2 text-sm font-bold text-white hover:bg-[#0053dd]/90"
          >
            <a href="#" rel="noopener noreferrer">
              Join Discord
            </a>
          </Button>
          {authState === "authed" ? (
            <Button
              onClick={handleUserCenterClick}
              className="h-10 w-10 rounded-full bg-[#dee3e7] hover:bg-[#f1f4f7]"
              size="icon"
              variant="secondary"
              aria-label="个人中心"
            >
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </Button>
          ) : (
            <Button
              onClick={handleUserCenterClick}
              className="h-10 rounded-full bg-[#dee3e7] px-4 text-sm font-bold text-[#2d3337] hover:bg-[#f1f4f7]"
              variant="secondary"
              aria-label="登录"
            >
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
