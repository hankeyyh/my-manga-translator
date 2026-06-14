import { Button } from "@/components/ui/button";

export function TranslationHistoryHeader() {
    return (
        <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <h2 className="font-headline text-2xl font-bold text-[#2d3337]">
                    Translation History
                </h2>
                <Button
                    className="h-8 rounded-full border-[#d6dce1] bg-white px-4 text-xs font-semibold text-[#5a6064] hover:bg-white"
                    variant="outline"
                >
                    Auto-delete after: 1 week
                </Button>
            </div>
            <div className="flex items-center gap-2">
                <Button
                    className="h-8 rounded-md border-[#d6dce1] bg-white px-4 text-xs font-semibold text-[#5a6064] hover:bg-white"
                    variant="outline"
                >
                    Amount
                </Button>
                <Button className="h-8 rounded-md bg-[#0053dd] px-4 text-xs font-semibold text-white hover:bg-[#0053dd]/90">
                    Bulk Download
                </Button>
            </div>
        </div>
    );
}
