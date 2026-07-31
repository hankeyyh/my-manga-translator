import { ChevronDown, Clock, Download } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import type { ApiGetTranslationTaskResponse } from "@/types/api/translation-task";
import type { TaskStatus } from "@/types/do/translation-task";

const SOURCE_LANG = "Auto";

function canDownload(status: TaskStatus) {
    return status === "completed" || status === "partial";
}

function onDownload(taskId: string) {
    window.location.href = `${window.origin}/api/download?taskId=${taskId}`;
}

function statusBadgeClassName(status: TaskStatus) {
    switch (status) {
        case "completed":
            return "border-transparent bg-green-100 text-green-700 hover:bg-green-100";
        case "failed":
            return "border-transparent bg-red-100 text-red-700 hover:bg-red-100";
        case "pending":
            return "border-transparent bg-yellow-100 text-yellow-700 hover:bg-yellow-100";
        case "processing":
            return "border-transparent bg-blue-100 text-blue-700 hover:bg-blue-100";
        case "partial":
            return "border-transparent bg-orange-100 text-orange-700 hover:bg-orange-100";
    }
}

function formatDate(iso: string) {
    return iso.slice(0, 10);
}

type Props = {
    task: ApiGetTranslationTaskResponse;
};

export function TranslationHistoryTaskItem({ task }: Props) {
    const downloadable = canDownload(task.status);
    const targetCode = task.config.translator?.target_lang ?? "—";

    return (
        <li>
            <Card className="gap-0 py-4 shadow-none">
                <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 px-4 py-0">
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <CardTitle className="text-sm">
                                {SOURCE_LANG} → {targetCode}
                            </CardTitle>
                            <Badge
                                variant="outline"
                                className={statusBadgeClassName(task.status)}
                            >
                                {task.status}
                            </Badge>
                        </div>
                        <CardDescription className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                            <span className="inline-flex items-center gap-1">
                                <Clock className="size-3 text-muted-foreground" />
                                {formatDate(task.created_at)}
                            </span>
                            <span>{task.total_images} 页</span>
                        </CardDescription>
                    </div>
                    <div className="flex shrink-0 gap-2">
                        <Button
                            size="sm"
                            type="button"
                            variant="ghost"
                            disabled={!downloadable}
                            onClick={() => onDownload(task.id)}
                        >
                            <Download className="size-3.5" />
                        </Button>
                        <Button size="sm" type="button" variant="ghost">
                            <ChevronDown className="size-3.5" />
                        </Button>
                    </div>
                </CardHeader>
            </Card>
        </li>
    );
}
