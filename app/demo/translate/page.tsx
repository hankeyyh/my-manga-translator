"use client";

import { Manrope, Inter } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Download,
  HelpCircle,
  History,
  Layers,
  Loader2,
  Minus,
  Phone,
  Plus,
  Settings,
  Wand2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["200", "400", "600", "800"],
  variable: "--font-manrope",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
});

const ENGINES = ["GPT-4o Vision", "GPT-4o mini", "Claude 3.5 Sonnet"] as const;
const STYLES = ["WildWords BB", "Standard", "Artistic"] as const;

export default function TranslateWorkbench() {
  const [zoom, setZoom] = useState(100);
  const [showSettings, setShowSettings] = useState(false);
  const [engine, setEngine] = useState<string>(ENGINES[0]);
  const [sourceLang, setSourceLang] = useState("JPN");
  const [targetLang, setTargetLang] = useState("ENG");
  const [style, setStyle] = useState<string>(STYLES[0]);
  const [activeTab, setActiveTab] = useState(0);
  /** 左侧竖条：0 设置 1 历史 2 图层 3 魔法棒 4 帮助 */
  const [leftTool, setLeftTool] = useState(0);

  const thumbnails = [
    {
      id: 1,
      label: "PAGE 01",
      status: "active" as const,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDVgPiUCUOaLyzK97yM_eskfUDY5SdtoRxSM2x3xk2O3wMrJbAYt-PlT9a38tNB7B8kvBH4ilidXeI_Wl8zxJYLF3O1qAX_EL6XhAsP9MGXt10AuYLQKlLqoMYAci_GEO-tbc9P67ncL4n9OprdHIz7bYAS3GBK11TvMjol6SDlTt0db3XoAysE-90Pwrwt26BJfeuW51Xjyn2w8JWeBPFDzHtBvNIoo71QPMWD4lRtSZCQwSUio4lgfQnGirbet7ISZC9FN8U",
    },
    {
      id: 2,
      label: "PAGE 02",
      status: "completed" as const,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDywl8KjHUH1F0ck3WN6-3N2phaKoEjSP3NhuxqeIBFrLQjfu9A0-oe4GYpY2R3Dt_ek8Wj3cU48aTxeLMJAJC0UWlcvMiu626E3PRYGRK-DUHziRHvfLa8fKkymVpshh-CM085fL6Gz6bQrXX_qvsdtqyxvM9TmirhQ2jc72xLvAX2nsQKDqQfYRcNOG5RuFXRoDwpxI4bTxoCg7eUpdizrIFr8_RXIHJVNDrEZhE4bzTLU3L0YCeQOetpBXp94Ui7u7sL548",
    },
    {
      id: 3,
      label: "PAGE 03",
      status: "processing" as const,
      progress: 65,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBR5Tj7_TwjuUmLbMM3Be1DvbRvahwb8SJjNGwcJtVinj9OgjP2MwolPmPVeuBjRPYl6uCDiCB982HdnD_pwyI8e2ubeNr-1VVhApEGYofqp6RAfjBikD6mefZlovyNXth1kUmTAtXg9eJUrqDW1UR_caYJndn-lHDH7OLHsOUjCWWkuqsz38OV_pbXav1nMvJKeiZehW10ZmXK2Vmopljxv9OmhwhB7Hae-SOMTttdg2dLlgmBLDDGSbglYH7c9n2Qb1q46W8",
    },
  ];

  const zoomIn = () => setZoom((z) => Math.min(z + 25, 200));
  const zoomOut = () => setZoom((z) => Math.max(z - 25, 50));

  const isThumbSelected = (index: number) => activeTab === index;

  return (
    <div
      className={cn(
        manrope.variable,
        inter.variable,
        "font-body text-[#2d3337]",
      )}
    >
      <main className="flex h-screen flex-col bg-[#f8f9fb] pt-16">
        <header className="fixed top-0 z-50 w-full border-b border-white/40 bg-[#f8f9fb]/80 shadow-sm backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-8">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0053dd] text-white">
                  <BookOpen className="h-5 w-5" />
                </div>
                <span className="font-headline text-xl font-bold tracking-tighter text-[#2d3337]">
                  ComicCurator
                </span>
              </div>
              <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
                <Link
                  className="border-b-2 border-[#0053dd] pb-1 font-bold text-[#0053dd]"
                  href="/demo"
                >
                  Workbench (功能页)
                </Link>
                <Link
                  className="text-[#2d3337] transition-colors hover:text-[#0053dd]"
                  href="/demo"
                >
                  Pricing (价格)
                </Link>
                <Link
                  className="text-[#2d3337] transition-colors hover:text-[#0053dd]"
                  href="/demo"
                >
                  Blog
                </Link>
                <Link
                  className="text-[#2d3337] transition-colors hover:text-[#0053dd]"
                  href="/demo"
                >
                  FAQ
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <Button className="scale-95 rounded-full bg-[#0053dd] px-5 py-2 text-sm font-bold text-white hover:bg-[#0053dd]/90">
                Join Discord
              </Button>
              <Button
                className="h-10 w-10 rounded-full bg-[#dee3e7] hover:bg-[#f1f4f7]"
                size="icon"
                variant="secondary"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </Button>
            </div>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-6">
          <section className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-white/40 bg-[#f1f4f7] shadow-sm">
            <div
              className={cn(
                "absolute left-5 top-1/2 z-20 flex -translate-y-1/2 items-start gap-0",
              )}
            >
              <nav
                aria-label="Workbench tools"
                className="flex flex-col gap-1 rounded-[28px] border border-[#eef0f3] bg-white p-2 shadow-[0_4px_20px_rgba(15,23,42,0.08)]"
              >
                <Button
                  className={cn(
                    "h-11 w-11 shrink-0 rounded-xl",
                    leftTool === 0
                      ? "bg-[#0053dd] text-white shadow-sm hover:bg-[#0053dd]/90"
                      : "text-[#5F6368] hover:bg-[#f1f3f5]",
                  )}
                  onClick={() => {
                    setLeftTool(0);
                    setShowSettings((s) => !s);
                  }}
                  size="icon"
                  title="设置"
                  type="button"
                  variant="ghost"
                >
                  <Settings className="h-[22px] w-[22px]" />
                </Button>
                <Button
                  className={cn(
                    "h-11 w-11 shrink-0 rounded-xl",
                    leftTool === 1
                      ? "bg-[#0053dd] text-white shadow-sm hover:bg-[#0053dd]/90"
                      : "text-[#5F6368] hover:bg-[#f1f3f5]",
                  )}
                  onClick={() => {
                    setLeftTool(1);
                    setShowSettings(false);
                  }}
                  size="icon"
                  title="历史"
                  type="button"
                  variant="ghost"
                >
                  <History className="h-[22px] w-[22px]" strokeWidth={1.75} />
                </Button>
                <Button
                  className={cn(
                    "h-11 w-11 shrink-0 rounded-xl",
                    leftTool === 2
                      ? "bg-[#0053dd] text-white shadow-sm hover:bg-[#0053dd]/90"
                      : "text-[#5F6368] hover:bg-[#f1f3f5]",
                  )}
                  onClick={() => {
                    setLeftTool(2);
                    setShowSettings(false);
                  }}
                  size="icon"
                  title="图层"
                  type="button"
                  variant="ghost"
                >
                  <Layers className="h-[22px] w-[22px]" strokeWidth={1.75} />
                </Button>
                <Button
                  className={cn(
                    "h-11 w-11 shrink-0 rounded-xl",
                    leftTool === 3
                      ? "bg-[#0053dd] text-white shadow-sm hover:bg-[#0053dd]/90"
                      : "text-[#5F6368] hover:bg-[#f1f3f5]",
                  )}
                  onClick={() => {
                    setLeftTool(3);
                    setShowSettings(false);
                  }}
                  size="icon"
                  title="魔法 / 自动"
                  type="button"
                  variant="ghost"
                >
                  <Wand2 className="h-[22px] w-[22px]" strokeWidth={1.75} />
                </Button>
                <Button
                  className={cn(
                    "h-11 w-11 shrink-0 rounded-xl",
                    leftTool === 4
                      ? "bg-[#0053dd] text-white shadow-sm hover:bg-[#0053dd]/90"
                      : "text-[#5F6368] hover:bg-[#f1f3f5]",
                  )}
                  onClick={() => {
                    setLeftTool(4);
                    setShowSettings(false);
                  }}
                  size="icon"
                  title="帮助"
                  type="button"
                  variant="ghost"
                >
                  <HelpCircle className="h-[22px] w-[22px]" strokeWidth={1.75} />
                </Button>
              </nav>

              <div
                className={cn(
                  "absolute left-full top-0 ml-3 min-w-[280px] transition-all duration-200 ease-out",
                  showSettings && leftTool === 0
                    ? "pointer-events-auto visible translate-y-0 opacity-100"
                    : "pointer-events-none invisible -translate-y-2 opacity-0",
                )}
              >
                <Card className="rounded-2xl border border-white bg-[#f8f9fb]/80 shadow-xl backdrop-blur-md">
                  <CardContent className="flex flex-col gap-3 p-4">
                    <div className="flex flex-col gap-0.5">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-[#5a6064] opacity-60">
                        Translation Engine
                      </Label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            className="h-auto justify-between px-0 py-0 font-headline text-sm font-bold text-[#0053dd] hover:bg-transparent hover:text-[#0053dd]"
                            variant="ghost"
                          >
                            {engine}
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56">
                          <DropdownMenuLabel>Engine</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuRadioGroup
                            onValueChange={setEngine}
                            value={engine}
                          >
                            {ENGINES.map((e) => (
                              <DropdownMenuRadioItem key={e} value={e}>
                                {e}
                              </DropdownMenuRadioItem>
                            ))}
                          </DropdownMenuRadioGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex gap-8 border-t border-[#dee3e7] pt-3">
                      <div className="flex flex-col gap-0.5">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-[#5a6064] opacity-60">
                          Languages
                        </Label>
                        <div className="flex items-center gap-2 text-sm font-bold">
                          <Input
                            className="h-8 w-12 border-[#dee3e7] bg-[#f8f9fb] px-1 text-center font-headline font-bold text-[#0053dd]"
                            onChange={(e) => setSourceLang(e.target.value)}
                            value={sourceLang}
                          />
                          <ChevronDown className="h-4 w-4 text-[#767b7f]" />
                          <Input
                            className="h-8 w-12 border-[#dee3e7] bg-[#f8f9fb] px-1 text-center font-headline font-bold text-[#0053dd]"
                            onChange={(e) => setTargetLang(e.target.value)}
                            value={targetLang}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-[#5a6064] opacity-60">
                          Style
                        </Label>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              className="h-8 justify-between border border-[#dee3e7] bg-[#f8f9fb] px-2 font-headline text-sm font-bold text-[#2d3337] hover:bg-[#f8f9fb]"
                              variant="outline"
                            >
                              {style}
                              <ChevronDown className="h-3 w-3 opacity-60" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            {STYLES.map((s) => (
                              <DropdownMenuItem
                                key={s}
                                className="font-headline font-bold"
                                onClick={() => setStyle(s)}
                              >
                                {s}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="absolute right-4 top-4 z-10 flex items-center gap-1 rounded-lg border border-[#dee3e7] bg-white/90 px-1 py-0.5 shadow-sm backdrop-blur-sm">
              <Button
                className="h-8 w-8"
                onClick={zoomOut}
                size="icon"
                type="button"
                variant="ghost"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="min-w-[2.75rem] text-center font-headline text-xs font-bold text-[#5a6064]">
                {zoom}%
              </span>
              <Button
                className="h-8 w-8"
                onClick={zoomIn}
                size="icon"
                type="button"
                variant="ghost"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex min-h-0 flex-1 gap-2 overflow-hidden bg-[#ebeef1] px-4 py-8">
              <div className="flex min-h-0 min-w-0 flex-1 justify-end">
                <div className="flex h-full min-h-0 w-full max-w-full flex-col items-center justify-end gap-2">
                  <span className="shrink-0 font-headline text-[10px] font-bold uppercase tracking-widest text-[#5a6064]">
                    Original ({sourceLang})
                  </span>
                  <div
                    className="relative flex min-h-0 w-full min-w-0 flex-1 items-center justify-center overflow-hidden rounded-lg bg-[#ebeef1]"
                    style={{
                      transform: `scale(${zoom / 100})`,
                      transformOrigin: "right center",
                    }}
                  >
                    <Image
                      alt="Original Comic Panel"
                      className="object-contain"
                      fetchPriority="high"
                      fill
                      priority
                      sizes="50vw"
                      src="/op-1178-raw.jpg"
                    />
                  </div>
                </div>
              </div>

              <div className="flex min-h-0 min-w-0 flex-1 justify-start">
                <div className="flex h-full min-h-0 w-full max-w-full flex-col items-center justify-start gap-2">
                  <span className="shrink-0 font-headline text-[10px] font-bold uppercase tracking-widest text-[#0053dd]">
                    Translated ({targetLang})
                  </span>
                  <div
                    className="relative flex min-h-0 w-full min-w-0 flex-1 items-center justify-center overflow-hidden rounded-lg bg-[#ebeef1]"
                    style={{
                      transform: `scale(${zoom / 100})`,
                      transformOrigin: "left center",
                    }}
                  >
                    <Image
                      alt="Translated Comic Panel"
                      className="object-contain"
                      fetchPriority="high"
                      fill
                      priority
                      sizes="50vw"
                      src="/op-1178-en.png"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="flex h-32 shrink-0 gap-4">
            <div className="flex w-48 flex-col gap-2">
              <Button className="flex-1 justify-start gap-3 rounded-xl bg-[#0053dd] text-xs font-bold text-white hover:bg-[#0053dd]/90">
                <Phone className="h-4 w-4" />
                Start All
              </Button>
              <Button
                className="flex-1 justify-start gap-3 rounded-xl border-[#dee3e7] text-xs font-bold text-[#5a6064] hover:border-[#0053dd] hover:text-[#0053dd]"
                variant="outline"
              >
                <Download className="h-4 w-4" />
                Download All
              </Button>
            </div>

            <div
              className={cn(
                "flex flex-1 gap-3 overflow-x-auto rounded-2xl bg-[#f1f4f7] p-2",
                "[scrollbar-width:thin]",
                "[&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#dee3e7]",
              )}
            >
              {thumbnails.map((thumb, index) => (
                <button
                  key={thumb.id}
                  className={cn(
                    "group relative flex h-full w-24 shrink-0 cursor-pointer flex-col rounded-xl p-1.5 transition-all",
                    isThumbSelected(index)
                      ? "border-2 border-[#0053dd] bg-white"
                      : "border border-transparent bg-white hover:border-[#dee3e7]",
                  )}
                  onClick={() => setActiveTab(index)}
                  type="button"
                >
                  <div
                    className={cn(
                      "relative mb-1 flex-1 overflow-hidden rounded-lg",
                      thumb.status === "completed" &&
                        "grayscale group-hover:grayscale-0",
                    )}
                  >
                    {thumb.status === "processing" && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40">
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                      </div>
                    )}
                    <Image
                      alt={thumb.label}
                      className="h-full w-full object-cover"
                      fetchPriority="low"
                      height={96}
                      sizes="96px"
                      src={thumb.image}
                      unoptimized
                      width={96}
                    />
                  </div>
                  <div className="flex items-center justify-between px-0.5">
                    <span
                      className={cn(
                        "font-headline text-[9px] font-bold uppercase",
                        isThumbSelected(index)
                          ? "text-[#0053dd]"
                          : "text-[#5a6064]",
                      )}
                    >
                      {thumb.label}
                    </span>
                    {thumb.status === "active" && isThumbSelected(index) && (
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#0053dd]" />
                    )}
                    {thumb.status === "completed" && (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    )}
                    {thumb.status === "processing" && (
                      <span className="font-headline text-[8px] font-bold italic text-[#5a6064]">
                        {thumb.progress}%
                      </span>
                    )}
                  </div>
                  {thumb.status !== "active" && (
                    <div className="pointer-events-none absolute inset-0 rounded-xl bg-[#0053dd]/5 opacity-0 transition-opacity group-hover:opacity-100" />
                  )}
                </button>
              ))}

              <button
                className="flex h-full w-24 shrink-0 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[#dee3e7] bg-white transition-colors hover:border-[#0053dd] group"
                type="button"
              >
                <Plus className="h-5 w-5 text-[#dee3e7] transition-colors group-hover:text-[#0053dd]" />
                <span className="font-headline text-[9px] font-bold text-[#5a6064]">
                  Add Page
                </span>
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
