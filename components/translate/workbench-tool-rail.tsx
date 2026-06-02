/*
工具栏，控制翻译配置
*/
"use client";
import type { LucideIcon } from "lucide-react";
import {
    History,
    Settings,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/components/utils";

import { TranslationSettingsPanel } from "./translation-settings-panel";
import type { TranslationSettingsPanelProps } from "./translation-settings-panel";
import { useState } from "react";

const WORKBENCH_TOOLS: {
    id: number;
    title: string;
    icon: LucideIcon;
    iconStrokeWidth?: number;
}[] = [
        { id: 0, title: "设置", icon: Settings },
        { id: 1, title: "历史", icon: History, iconStrokeWidth: 1.75 },
    ];

export function WorkbenchToolRail({ ...settings }: TranslationSettingsPanelProps) {
    const [leftTool, setLeftTool] = useState(0);
    const [showSettings, setShowSettings] = useState(false);

    const handleToolClick = (toolId: number) => {
        setLeftTool(toolId);
        if (toolId === 0) {
            setShowSettings((s) => !s);
            return;
        }
        setShowSettings(false);
    };

    return (
        <div
            className={cn(
                "absolute left-5 top-1/2 z-20 flex -translate-y-1/2 items-start gap-0",
            )}
        >
            <nav
                aria-label="Workbench tools"
                className="flex flex-col gap-1 rounded-[28px] border border-[#eef0f3] bg-white p-2 shadow-[0_4px_20px_rgba(15,23,42,0.08)]"
            >
                {WORKBENCH_TOOLS.map((tool) => {
                    const Icon = tool.icon;
                    return (
                        <Button
                            key={tool.id}
                            className={cn(
                                "h-11 w-11 shrink-0 rounded-xl",
                                leftTool === tool.id
                                    ? "bg-[#0053dd] text-white shadow-sm hover:bg-[#0053dd]/90"
                                    : "text-[#5F6368] hover:bg-[#f1f3f5]",
                            )}
                            onClick={() => handleToolClick(tool.id)}
                            size="icon"
                            title={tool.title}
                            type="button"
                            variant="ghost"
                        >
                            <Icon
                                className="h-[22px] w-[22px]"
                                strokeWidth={tool.iconStrokeWidth}
                            />
                        </Button>
                    );
                })}
            </nav>

            <div
                className={cn(
                    "absolute left-full top-0 ml-3 min-w-[280px] transition-all duration-200 ease-out",
                    showSettings && leftTool === 0
                        ? "pointer-events-auto visible translate-y-0 opacity-100"
                        : "pointer-events-none invisible -translate-y-2 opacity-0",
                )}
            >
                <TranslationSettingsPanel {...settings} />
            </div>
        </div>
    );
}
