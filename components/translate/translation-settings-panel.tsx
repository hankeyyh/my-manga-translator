import { ChevronDown } from "lucide-react";

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
import { Label } from "@/components/ui/label";

import { TRANSLATION_STYLES } from "./constants";
import { SUPPORTED_LANGS } from "@/types/common";
import { PricingConfig } from "@/types/do/pricing-config";

function getLangLabel(code: string) {
    return SUPPORTED_LANGS.find((lang) => lang.code === code)?.label ?? code;
}

export type TranslationSettingsPanelProps = {
    translateModel: string;
    sourceLang: string;
    targetLang: string;
    style: string;
    translateConfigs: PricingConfig[],
    onTranslateModelChange: (value: string) => void;
    onSourceLangChange: (value: string) => void;
    onTargetLangChange: (value: string) => void;
    onStyleChange: (value: string) => void;
};

export function TranslationSettingsPanel({
    translateModel,
    sourceLang,
    targetLang,
    style,
    translateConfigs,
    onTranslateModelChange,
    onSourceLangChange,
    onTargetLangChange,
    onStyleChange,
}: TranslationSettingsPanelProps) {
    return (
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
                                {translateModel}
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-56">
                            <DropdownMenuLabel>Engine</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuRadioGroup onValueChange={onTranslateModelChange} value={translateModel}>
                                {translateConfigs.map((e) => (
                                    <DropdownMenuRadioItem key={e.modelName} value={e.modelName}>
                                        {e.modelName} {` (${e.creditPerImage} Credits)`}
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
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        className="h-8 min-w-[4.5rem] justify-between border border-[#dee3e7] bg-[#f8f9fb] px-2 font-headline text-sm font-bold text-[#0053dd] hover:bg-[#f8f9fb]"
                                        title={getLangLabel(sourceLang)}
                                        variant="outline"
                                    >
                                        {sourceLang}
                                        <ChevronDown className="h-3 w-3 opacity-60" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="max-h-64 overflow-y-auto">
                                    {SUPPORTED_LANGS.map(({ code, label }) => (
                                        <DropdownMenuItem
                                            key={code}
                                            className="font-headline font-bold"
                                            onClick={() => onSourceLangChange(code)}
                                        >
                                            {code} · {label}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <span className="text-[#767b7f]">→</span>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        className="h-8 min-w-[4.5rem] justify-between border border-[#dee3e7] bg-[#f8f9fb] px-2 font-headline text-sm font-bold text-[#0053dd] hover:bg-[#f8f9fb]"
                                        title={getLangLabel(targetLang)}
                                        variant="outline"
                                    >
                                        {targetLang}
                                        <ChevronDown className="h-3 w-3 opacity-60" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="max-h-64 overflow-y-auto">
                                    {SUPPORTED_LANGS.map(({ code, label }) => (
                                        <DropdownMenuItem
                                            key={code}
                                            className="font-headline font-bold"
                                            onClick={() => onTargetLangChange(code)}
                                        >
                                            {code} · {label}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-[#5a6064] opacity-60">
                            Font Style
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
                                {TRANSLATION_STYLES.map((s) => (
                                    <DropdownMenuItem
                                        key={s}
                                        className="font-headline font-bold"
                                        onClick={() => onStyleChange(s)}
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
    );
}
