import { Minus, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

export type WorkbenchZoomControlsProps = {
    zoom: number;
    onZoomIn: () => void;
    onZoomOut: () => void;
};

export function WorkbenchZoomControls({ zoom, onZoomIn, onZoomOut }: WorkbenchZoomControlsProps) {
    return (
        <div className="absolute right-4 top-4 z-10 flex items-center gap-1 rounded-lg border border-[#dee3e7] bg-white/90 px-1 py-0.5 shadow-sm backdrop-blur-sm">
            <Button
                className="h-8 w-8"
                onClick={onZoomOut}
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
                onClick={onZoomIn}
                size="icon"
                type="button"
                variant="ghost"
            >
                <Plus className="h-4 w-4" />
            </Button>
        </div>
    );
}
