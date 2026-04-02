"use client";

import { Manrope, Inter } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Languages,
  Pencil,
  Plus,
  Star,
  UploadCloud,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-manrope",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?q=80&w=2940&auto=format&fit=crop";
const BENTO_IMAGE =
  "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?q=80&w=2942&auto=format&fit=crop";
const GLOSSARY_IMAGE =
  "https://images.unsplash.com/photo-1611457194403-d3aca4cf9d11?q=80&w=2942&auto=format&fit=crop";

const SOURCE_OPTIONS = ["Japanese", "Korean", "Chinese"];
const TARGET_OPTIONS = ["English", "Spanish", "French"];

export default function ComicCuratorDemo() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [sourceLang, setSourceLang] = useState("Japanese");
  const [targetLang, setTargetLang] = useState("English");

  const faqs = [
    {
      question: "Can I try ComicCurator for free first?",
      answer:
        "Yes! We offer a free trial with limited translation credits to help you experience our service.",
    },
    {
      question: "How do translation credits work?",
      answer:
        "Each translation consumes credits based on the complexity and length of the content. Credits refresh monthly with your subscription.",
    },
    {
      question: "Can I use these credits across multiple devices?",
      answer:
        "Absolutely! Your account and credits are accessible from any device where you're logged in.",
    },
    {
      question: "Why do I need to login with email or Google?",
      answer:
        "Login ensures your translations are saved and synced across devices, and helps us provide personalized service.",
    },
    {
      question: "Does ComicCurator have an API?",
      answer:
        "Yes! Ultra plan includes enterprise API access for integration with your own applications.",
    },
    {
      question: "Do you have a Discord community?",
      answer:
        "Yes! Join our Discord to connect with 50k+ comic enthusiasts and get support from our community.",
    },
  ];

  return (
    <div
      className={cn(
        manrope.variable,
        inter.variable,
        "bg-[#f8f9fb] font-body text-[#2d3337]",
      )}
    >
      <nav className="sticky top-0 z-50 w-full bg-[#f8f9fb] font-headline text-sm font-medium tracking-tight">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-8 py-4">
          <div className="text-xl font-bold tracking-tighter text-[#2d3337]">
            ComicCurator
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link
              className="border-b-2 border-[#0053dd] pb-1 font-bold text-[#0053dd]"
              href="#"
            >
              功能页
            </Link>
            <Link
              className="text-[#2d3337] transition-colors hover:text-[#0053dd]"
              href="#"
            >
              价格
            </Link>
            <Link
              className="text-[#2d3337] transition-colors hover:text-[#0053dd]"
              href="#"
            >
              Blog
            </Link>
            <Link
              className="text-[#2d3337] transition-colors hover:text-[#0053dd]"
              href="#"
            >
              FAQ
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <Link
              className="text-[#2d3337] transition-colors hover:text-[#0053dd]"
              href="#"
            >
              Join Discord
            </Link>
            <Button
              className="scale-95 rounded-xl bg-[#3370FF] px-6 py-2.5 font-headline font-semibold shadow-sm hover:bg-[#3370FF]/90"
            >
              登录/个人中心
            </Button>
          </div>
        </div>
      </nav>

      <main>
        <section className="relative flex h-[614px] min-h-[500px] w-full items-end overflow-hidden">
          <Image
            alt=""
            className="object-cover brightness-[0.4] saturate-[120%]"
            fill
            priority
            sizes="100vw"
            src={HERO_IMAGE}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-[rgba(12,15,16,0.7)]"
          />
          <div className="relative mx-auto w-full max-w-[1920px] px-8 pb-16 lg:pb-24">
            <div className="max-w-3xl">
              <h1 className="mb-6 font-headline text-5xl font-extrabold leading-[1.1] tracking-tight text-white lg:text-7xl">
                AI-Powered Comic Translation
              </h1>
              <p className="max-w-xl text-xl font-medium leading-relaxed text-white/90">
                Preserving the soul of visual storytelling through context-aware
                artificial intelligence and smart redraw technology.
              </p>
            </div>
          </div>
        </section>

        <section className="relative z-10 -mt-20 mb-20 px-8">
          <div className="mx-auto max-w-6xl">
            <Card className="rounded-[2rem] border-0 bg-white p-8 shadow-[0px_8px_24px_rgba(12,15,16,0.06)] lg:p-12">
              <div className="flex flex-col gap-12 lg:flex-row">
                <div className="flex flex-1 flex-col gap-8">
                  <div>
                    <CardTitle className="mb-2 font-headline text-3xl font-bold text-[#2d3337]">
                      Quick Translation Preview
                    </CardTitle>
                    <CardDescription className="font-body text-base text-[#5a6064]">
                      Start your journey from raw panels to translated masterpieces.
                    </CardDescription>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <Label className="ml-2 font-body text-xs font-bold uppercase tracking-widest text-[#5a6064]">
                        Source Language
                      </Label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            className="h-auto w-full justify-between rounded-xl bg-[#f1f4f7] px-4 py-3 font-body font-medium text-[#2d3337] hover:bg-[#ebeef1]"
                            variant="ghost"
                          >
                            {sourceLang}
                            <ChevronDown className="h-5 w-5 text-[#767b7f]" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="start"
                          className="min-w-[var(--radix-dropdown-menu-trigger-width)]"
                        >
                          {SOURCE_OPTIONS.map((lang) => (
                            <DropdownMenuItem
                              key={lang}
                              className="font-body"
                              onClick={() => setSourceLang(lang)}
                            >
                              {lang}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="ml-2 font-body text-xs font-bold uppercase tracking-widest text-[#5a6064]">
                        Target Language
                      </Label>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            className="h-auto w-full justify-between rounded-xl bg-[#f1f4f7] px-4 py-3 font-body font-medium text-[#2d3337] hover:bg-[#ebeef1]"
                            variant="ghost"
                          >
                            {targetLang}
                            <ChevronDown className="h-5 w-5 text-[#767b7f]" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="start"
                          className="min-w-[var(--radix-dropdown-menu-trigger-width)]"
                        >
                          {TARGET_OPTIONS.map((lang) => (
                            <DropdownMenuItem
                              key={lang}
                              className="font-body"
                              onClick={() => setTargetLang(lang)}
                            >
                              {lang}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  <Button
                    className="h-auto rounded-xl bg-gradient-to-br from-[#3370FF] to-[#2e6dfc] py-4 font-headline text-lg font-bold text-white shadow-lg shadow-[#3370FF]/20 hover:from-[#3370FF]/90 hover:to-[#2e6dfc]/90"
                    size="lg"
                  >
                    <Star className="h-6 w-6" />
                    Start Automatic Translation
                  </Button>
                </div>
                <div className="flex-1">
                  <button
                    className="flex h-full min-h-[300px] w-full cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed border-[#adb3b7]/30 bg-[#f1f4f7] p-8 transition-all hover:bg-white group"
                    type="button"
                  >
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#ebeef1] transition-transform group-hover:scale-110">
                      <UploadCloud className="h-10 w-10 text-[#3370FF]" />
                    </div>
                    <p className="mb-2 font-headline text-xl font-bold text-[#2d3337]">
                      Drop comic panels here
                    </p>
                    <p className="max-w-[240px] text-center font-body text-[#5a6064]">
                      Support for JPG, PNG, and WebP. Max 20MB per file.
                    </p>
                  </button>
                </div>
              </div>
            </Card>
          </div>
        </section>

        <section className="px-8 pb-24">
          <div className="mx-auto max-w-[1400px]">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <Card className="flex flex-col gap-6 rounded-[2rem] border-0 bg-[#f1f4f7] p-10 shadow-none">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white">
                  <CheckCircle2 className="h-8 w-8 text-[#3370FF]" />
                </div>
                <CardHeader className="p-0">
                  <CardTitle className="mb-4 font-headline text-2xl font-bold">
                    Context-Aware AI
                  </CardTitle>
                  <CardDescription className="font-body text-base leading-relaxed text-[#5a6064]">
                    Our models don&apos;t just translate words; they understand
                    narrative flow, character relationships, and cultural nuances
                    within every panel.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="flex flex-col gap-6 rounded-[2rem] border-0 bg-[#f1f4f7] p-10 shadow-none">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white">
                  <Pencil className="h-8 w-8 text-[#3370FF]" strokeWidth={2} />
                </div>
                <CardHeader className="p-0">
                  <CardTitle className="mb-4 font-headline text-2xl font-bold">
                    Smart Redrawing
                  </CardTitle>
                  <CardDescription className="font-body text-base leading-relaxed text-[#5a6064]">
                    Advanced in-painting technology automatically fills in artwork
                    behind removed text, maintaining the original artist&apos;s
                    brushstrokes.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="flex flex-col gap-6 rounded-[2rem] border-0 bg-[#f1f4f7] p-10 shadow-none">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white">
                  <Star className="h-8 w-8 fill-current text-[#3370FF]" />
                </div>
                <CardHeader className="p-0">
                  <CardTitle className="mb-4 font-headline text-2xl font-bold">
                    Style Preservation
                  </CardTitle>
                  <CardDescription className="font-body text-base leading-relaxed text-[#5a6064]">
                    We analyze original typography and SFX styles to render
                    translated text that looks like it was part of the first
                    printing.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        <section className="px-8 pb-32">
          <div className="mx-auto max-w-[1400px]">
            <div className="grid h-auto grid-cols-12 grid-rows-2 gap-6 md:h-[600px]">
              <div className="group relative col-span-12 overflow-hidden rounded-[2rem] bg-[#dee3e7] md:col-span-8">
                <Image
                  alt=""
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  fill
                  sizes="(min-width: 768px) 66vw, 100vw"
                  src={BENTO_IMAGE}
                />
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-10">
                  <Badge className="mb-4 w-fit border-0 bg-[#3370FF]/20 px-4 py-1 font-body text-xs font-bold uppercase tracking-widest text-white backdrop-blur-md hover:bg-[#3370FF]/30">
                    Pro Feature
                  </Badge>
                  <h4 className="mb-2 font-headline text-3xl font-bold text-white">
                    Lossless Upscaling
                  </h4>
                  <p className="max-w-md font-body text-white/70">
                    Restore low-resolution scans to modern webtoon standards with a
                    single click.
                  </p>
                </div>
              </div>
              <Card className="col-span-12 flex flex-col justify-between rounded-[2rem] border-0 bg-[#3370FF] p-10 text-white shadow-none md:col-span-4">
                <CardHeader className="p-0">
                  <CardTitle className="mb-6 font-headline text-3xl font-bold leading-tight text-white">
                    Join 50k+ Curators
                  </CardTitle>
                  <CardDescription className="font-body text-base text-white/80">
                    The largest community of comic enthusiasts, translators, and
                    creators sharing their passion.
                  </CardDescription>
                </CardHeader>
                <div className="flex -space-x-4">
                  <div className="h-12 w-12 rounded-full border-4 border-[#3370FF] bg-slate-300" />
                  <div className="h-12 w-12 rounded-full border-4 border-[#3370FF] bg-slate-400" />
                  <div className="h-12 w-12 rounded-full border-4 border-[#3370FF] bg-slate-500" />
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-[#3370FF] bg-slate-200 text-xs font-bold text-[#3370FF]">
                    +12k
                  </div>
                </div>
              </Card>
              <Card className="col-span-12 flex flex-col items-center justify-center rounded-[2rem] border-0 bg-[#f1f4f7] p-10 text-center shadow-none md:col-span-4">
                <Languages className="mb-4 h-12 w-12 text-[#3370FF]" />
                <CardHeader className="p-0">
                  <CardTitle className="mb-2 font-headline text-2xl font-bold">
                    40+ Languages
                  </CardTitle>
                  <CardDescription className="font-body text-base text-[#5a6064]">
                    Supporting major global languages including specialized dialects.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="col-span-12 flex items-center gap-10 rounded-[2rem] border border-[#ebeef1] bg-white p-10 shadow-sm md:col-span-8">
                <div className="hidden h-32 w-32 shrink-0 overflow-hidden rounded-2xl bg-[#ebeef1] sm:block">
                  <Image
                    alt="Comic panel excerpt"
                    className="h-full w-full object-cover"
                    height={128}
                    src={GLOSSARY_IMAGE}
                    width={128}
                  />
                </div>
                <CardContent className="p-0">
                  <CardTitle className="mb-2 font-headline text-2xl font-bold">
                    Visual Glossary
                  </CardTitle>
                  <CardDescription className="font-body text-base text-[#5a6064]">
                    Maintain consistency across series with character name tracking
                    and recurring phrase detection.
                  </CardDescription>
                  <Button
                    className="mt-4 gap-2 p-0 font-body font-bold text-[#3370FF] hover:gap-4 hover:bg-transparent hover:text-[#3370FF]"
                    variant="link"
                  >
                    Learn more
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="bg-[#f8f9fb] px-8 py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 font-headline text-4xl font-bold text-[#2d3337] md:text-5xl">
                Choose Your Plan
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-[#5a6064]">
                Unlock professional-grade translation tools tailored for your needs.
              </p>
              <div className="mt-8 inline-flex rounded-full border border-[#adb3b7]/20 bg-[#ebeef1] p-1">
                <Button
                  className={cn(
                    "rounded-full px-6 py-2 font-body text-sm font-bold",
                    billingCycle === "monthly"
                      ? "bg-white text-[#3370FF] shadow-sm hover:bg-white"
                      : "bg-transparent text-[#5a6064] hover:text-[#2d3337]",
                  )}
                  onClick={() => setBillingCycle("monthly")}
                  variant="ghost"
                >
                  Monthly
                </Button>
                <Button
                  className={cn(
                    "rounded-full px-6 py-2 font-body text-sm font-bold",
                    billingCycle === "yearly"
                      ? "bg-white text-[#3370FF] shadow-sm hover:bg-white"
                      : "bg-transparent text-[#5a6064] hover:text-[#2d3337]",
                  )}
                  onClick={() => setBillingCycle("yearly")}
                  variant="ghost"
                >
                  Yearly (Save 20%)
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <Card className="flex flex-col rounded-[2rem] border border-[#adb3b7]/10 bg-white p-10 shadow-sm transition-shadow hover:shadow-xl">
                <CardHeader className="p-0">
                  <CardTitle className="mb-2 font-headline text-xl font-bold">
                    Basic
                  </CardTitle>
                  <div className="mb-6 flex items-baseline gap-1">
                    <span className="font-headline text-4xl font-extrabold">$8</span>
                    <span className="font-body text-[#5a6064]">/monthly</span>
                  </div>
                  <CardDescription className="mb-8 font-body text-sm font-medium text-[#5a6064]">
                    1800 translations/mo
                  </CardDescription>
                </CardHeader>
                <Button
                  className="mb-10 rounded-xl border-2 border-[#3370FF] bg-transparent font-headline font-bold text-[#3370FF] hover:bg-[#3370FF] hover:text-white"
                  variant="outline"
                >
                  Get Started
                </Button>
                <ul className="flex flex-col gap-4">
                  {[
                    "Priority professional recognition",
                    "Standard translation models",
                    "10% bonus translations",
                    "No watermark",
                  ].map((text) => (
                    <li
                      key={text}
                      className="flex items-start gap-3 font-body text-sm text-[#5a6064]"
                    >
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#3370FF]" />
                      {text}
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="relative z-10 flex scale-105 flex-col rounded-[2rem] border-4 border-[#3370FF] bg-white p-10 shadow-xl">
                <Badge className="absolute -top-5 left-1/2 -translate-x-1/2 border-0 bg-[#3370FF] px-6 py-1 font-body text-xs font-bold uppercase tracking-widest text-white hover:bg-[#3370FF]">
                  Recommended
                </Badge>
                <CardHeader className="p-0">
                  <div className="mb-2 flex items-start justify-between">
                    <CardTitle className="font-headline text-xl font-bold">Pro</CardTitle>
                    <Badge
                      className="border-0 bg-[#fa746f]/10 px-2 py-0.5 font-body text-[10px] font-bold uppercase tracking-tighter text-[#a83836] hover:bg-[#fa746f]/20"
                      variant="secondary"
                    >
                      Save 4%
                    </Badge>
                  </div>
                  <div className="mb-6 flex items-baseline gap-1">
                    <span className="font-headline text-4xl font-extrabold">$30</span>
                    <span className="font-body text-[#5a6064]">/monthly</span>
                  </div>
                  <CardDescription className="mb-8 font-body text-sm font-medium text-[#5a6064]">
                    7000 translations/mo
                  </CardDescription>
                </CardHeader>
                <Button
                  className="mb-10 rounded-xl bg-[#3370FF] font-headline font-bold text-white shadow-lg shadow-[#3370FF]/30 hover:scale-[1.02] hover:bg-[#3370FF]/90 active:scale-95"
                >
                  Get Started
                </Button>
                <ul className="flex flex-col gap-4">
                  {[
                    "Fast priority processing",
                    "GPT-4o & specialized models",
                    "Advanced redrawing tools",
                    "Bulk upload (100 images)",
                  ].map((text) => (
                    <li
                      key={text}
                      className="flex items-start gap-3 font-body text-sm text-[#2d3337]"
                    >
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#3370FF]" />
                      {text}
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="flex flex-col rounded-[2rem] border border-[#adb3b7]/10 bg-white p-10 shadow-sm transition-shadow hover:shadow-xl">
                <CardHeader className="p-0">
                  <CardTitle className="mb-2 font-headline text-xl font-bold">
                    Ultra
                  </CardTitle>
                  <div className="mb-6 flex items-baseline gap-1">
                    <span className="font-headline text-4xl font-extrabold">$80</span>
                    <span className="font-body text-[#5a6064]">/monthly</span>
                  </div>
                  <CardDescription className="mb-8 font-body text-sm font-medium text-[#5a6064]">
                    Unlimited translations
                  </CardDescription>
                </CardHeader>
                <Button
                  className="mb-10 rounded-xl border-2 border-[#3370FF] bg-transparent font-headline font-bold text-[#3370FF] hover:bg-[#3370FF] hover:text-white"
                  variant="outline"
                >
                  Get Started
                </Button>
                <ul className="flex flex-col gap-4">
                  {[
                    "Instant processing queue",
                    "Enterprise API access",
                    "Commercial usage license",
                    "24/7 dedicated support",
                  ].map((text) => (
                    <li
                      key={text}
                      className="flex items-start gap-3 font-body text-sm text-[#5a6064]"
                    >
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#3370FF]" />
                      {text}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </section>

        <section className="bg-[#f8f9fb] px-8 py-32">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-16 text-center font-headline text-4xl font-bold text-[#2d3337] md:text-5xl">
              Frequently asked questions
            </h2>
            <div className="flex flex-col border-t border-[#adb3b7]/20">
              {faqs.map((faq, index) => (
                <div
                  key={faq.question}
                  className="group border-b border-[#adb3b7]/20"
                >
                  <Button
                    className="h-auto w-full justify-between gap-4 py-8 font-headline text-lg font-medium text-[#2d3337] hover:bg-transparent hover:text-[#3370FF] md:text-xl"
                    onClick={() =>
                      setExpandedFaq(expandedFaq === index ? null : index)
                    }
                    variant="ghost"
                  >
                    <span className="text-left">{faq.question}</span>
                    <Plus
                      className={cn(
                        "h-6 w-6 shrink-0 text-[#767b7f] transition-transform group-hover:text-[#3370FF]",
                        expandedFaq === index && "rotate-45",
                      )}
                    />
                  </Button>
                  {expandedFaq === index && (
                    <div className="px-2 pb-8">
                      <p className="font-body text-[#5a6064]">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-16 text-center">
              <p className="mb-6 font-body text-[#5a6064]">Still have questions?</p>
              <Button
                className="font-body font-bold text-[#3370FF] hover:bg-transparent hover:underline"
                variant="link"
              >
                Contact our support team
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full border-t border-slate-200/20 bg-[#f1f4f7] px-8 py-12">
        <div className="mx-auto flex w-full max-w-[1920px] flex-col items-center justify-between gap-8 md:flex-row">
          <div className="flex flex-col gap-4">
            <div className="font-headline text-xl font-bold text-slate-900">
              ComicCurator
            </div>
            <p className="font-body text-sm tracking-wide text-slate-500">
              © 2024 ComicCurator. The Digital Curator for Visual Storytelling.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-8 font-body text-sm tracking-wide">
            <Link
              className="text-slate-500 transition-all hover:text-[#3370FF]"
              href="#"
            >
              Privacy Policy
            </Link>
            <Link
              className="text-slate-500 transition-all hover:text-[#3370FF]"
              href="#"
            >
              Terms of Service
            </Link>
            <Link
              className="text-slate-500 transition-all hover:text-[#3370FF]"
              href="#"
            >
              API Documentation
            </Link>
            <Link
              className="text-slate-500 transition-all hover:text-[#3370FF]"
              href="#"
            >
              Contact Support
            </Link>
          </div>
          <div className="flex gap-4">
            <Button
              asChild
              className="h-10 w-10 rounded-full bg-white hover:text-[#3370FF]"
              size="icon"
              variant="ghost"
            >
              <Link aria-label="Community" href="#">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                </svg>
              </Link>
            </Button>
            <Button
              asChild
              className="h-10 w-10 rounded-full bg-white hover:text-[#3370FF]"
              size="icon"
              variant="ghost"
            >
              <Link aria-label="Profile" href="#">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                </svg>
              </Link>
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
