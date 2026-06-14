"use client"

import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardDescription, CardTitle } from "../ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Label } from "../ui/label";
import { ChevronDown, Star, UploadCloud } from "lucide-react";

const SOURCE_OPTIONS = ["Japanese", "Korean", "Chinese"];
const TARGET_OPTIONS = ["English", "Spanish", "French"];

export function QuickTranslate() {
    const [sourceLang, setSourceLang] = useState("Japanese");
    const [targetLang, setTargetLang] = useState("English");

    return (
        <div className="relative z-10 -mt-20 mb-20 px-8">
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
        </div>
    );
}