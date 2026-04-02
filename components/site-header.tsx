"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** 与 translate 页一致的导航项，便于首页锚点与路由复用 */
export const SITE_NAV_ITEMS = [
  { key: "workbench" as const, href: "/translate", label: "翻译" },
  { key: "pricing" as const, href: "/#pricing", label: "价格" },
  { key: "blog" as const, href: "#", label: "Blog" },
  { key: "faq" as const, href: "/#faq", label: "FAQ" },
] as const;

export function SiteHeader() {
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
          <Button
            asChild
            className="h-10 w-10 rounded-full bg-[#dee3e7] hover:bg-[#f1f4f7]"
            size="icon"
            variant="secondary"
          >
            <Link aria-label="个人中心" href="/home">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
