import Image from "next/image";
import {
    ChevronRight,
    ImageIcon,
    MoreHorizontal,
    Plus,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/components/utils";

export type HomeHistoryRecord = {
    id: number;
    filename: string;
    size: string;
    language: string;
    date: string;
    status: "completed" | "queued";
    image: string | null;
};

export type HomeHistorySectionProps = {
    records: HomeHistoryRecord[];
};

export function HomeHistorySection({ records }: HomeHistorySectionProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="font-headline text-xl font-bold">历史记录</h3>
                <Button
                    className="gap-1 font-headline text-sm font-semibold text-[#0053dd] hover:underline"
                    variant="link"
                >
                    查看全部
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
            <Card className="overflow-hidden border border-[#adb3b7]/15 p-0">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="bg-[#f1f4f7]/50">
                                <th className="px-6 py-4 font-headline text-xs font-bold uppercase tracking-wider text-[#5a6064]">
                                    文件名
                                </th>
                                <th className="px-6 py-4 font-headline text-xs font-bold uppercase tracking-wider text-[#5a6064]">
                                    日期
                                </th>
                                <th className="px-6 py-4 font-headline text-xs font-bold uppercase tracking-wider text-[#5a6064]">
                                    状态
                                </th>
                                <th className="px-6 py-4 text-right font-headline text-xs font-bold uppercase tracking-wider text-[#5a6064]">
                                    操作
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#ebeef1]">
                            {records.map((record) => (
                                <tr
                                    key={record.id}
                                    className="group transition-colors hover:bg-[#f1f4f7]"
                                >
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            {record.image ? (
                                                <div className="relative h-12 w-10 flex-shrink-0 overflow-hidden rounded bg-[#ebeef1]">
                                                    <Image
                                                        alt=""
                                                        className="object-cover"
                                                        fill
                                                        sizes="40px"
                                                        src={record.image}
                                                        unoptimized
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex h-12 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded bg-[#dee3e7]">
                                                    <ImageIcon className="h-5 w-5 text-[#5a6064]/40" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-sm font-bold">{record.filename}</p>
                                                <p className="text-xs text-[#5a6064]">
                                                    {record.size} • {record.language}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-sm text-[#5a6064]">
                                        {record.date}
                                    </td>
                                    <td className="px-6 py-5">
                                        {record.status === "completed" ? (
                                            <Badge className="gap-1.5 border-0 bg-green-100 font-headline text-xs font-bold text-green-700 hover:bg-green-100">
                                                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                                完成
                                            </Badge>
                                        ) : (
                                            <Badge className="gap-1.5 border-0 bg-amber-100 font-headline text-xs font-bold text-amber-700 hover:bg-amber-100">
                                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                                队列中
                                            </Badge>
                                        )}
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                className={cn(
                                                    "h-9 w-9 p-0",
                                                    record.status === "completed"
                                                        ? "text-[#0053dd] hover:bg-[#0053dd]/10"
                                                        : "cursor-not-allowed opacity-30",
                                                )}
                                                disabled={record.status !== "completed"}
                                                size="icon"
                                                variant="ghost"
                                            >
                                                <Plus className="h-5 w-5" />
                                            </Button>
                                            <Button
                                                className="h-9 w-9 p-0 text-[#5a6064] hover:bg-[#ebeef1]"
                                                size="icon"
                                                variant="ghost"
                                            >
                                                <MoreHorizontal className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
