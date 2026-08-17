"use client";

import { useRef } from "react";
import { Plus, Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/components/utils";

const ACCEPT =
    ".jpg,.jpeg,.png,.webp,.gif,.avif,.heic,.pdf,.epub,.cbz,.zip,image/*,application/pdf,application/epub+zip,application/zip";

export function UploadZone(props: {
    uploaded: number;
    maxPages: number;
    compact: boolean;
    onFilesSelected: (files: File[]) => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const remaining = Math.max(0, props.maxPages - props.uploaded);

    function openFilePicker() {
        inputRef.current?.click();
    }

    function onChange(e: React.ChangeEvent<HTMLInputElement>) {
        // FileList 是 input 的实时视图，清空 value 后会变空；先拷成 File[]
        const files = Array.from(e.target.files ?? []);
        e.target.value = "";
        if (files.length > 0) {
            props.onFilesSelected(files);
        }
    }

    return (
        <Card
            className="cursor-pointer gap-0 overflow-hidden py-0 transition-colors hover:bg-muted/50"
            onClick={openFilePicker}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openFilePicker();
                }
            }}
            role="button"
            tabIndex={0}
        >
            <div
                className={cn(
                    "grid transition-[grid-template-rows] duration-300 ease-out",
                    props.compact ? "grid-rows-[0fr]" : "grid-rows-[1fr]",
                )}
            >
                <div className="overflow-hidden">
                    <CardContent
                        className={cn(
                            "flex flex-col items-center gap-2 py-10 text-center transition-opacity duration-300",
                            props.compact ? "opacity-0" : "opacity-100",
                        )}
                    >
                        <Upload className="size-8 text-muted-foreground" />
                        <p className="text-sm">
                            将漫画页拖放到此处，或{" "}
                            <span className="underline">浏览文件</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                            JPG、PNG、WebP、GIF、AVIF、HEIC、PDF、EPUB、CBZ、ZIP · 图片最大
                            50MB, 文档最大 200MB
                        </p>
                        <p className="text-xs text-muted-foreground">
                            已上传 {props.uploaded}/{props.maxPages} 页 · 剩余 {remaining} 页
                        </p>
                    </CardContent>
                </div>
            </div>
            <div
                className={cn(
                    "grid transition-[grid-template-rows] duration-300 ease-out",
                    props.compact ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                )}
            >
                <div className="overflow-hidden">
                    <CardContent
                        className={cn(
                            "flex items-center justify-between py-2.5 transition-opacity duration-300",
                            props.compact ? "opacity-100" : "opacity-0",
                        )}
                    >
                        <p className="flex items-center gap-1.5 text-sm">
                            <Plus className="size-4" />
                            添加图片 / 拖拽上传
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {props.uploaded} / {props.maxPages} 页
                        </p>
                    </CardContent>
                </div>
            </div>
            <input
                ref={inputRef}
                type="file"
                accept={ACCEPT}
                multiple
                className="hidden"
                onChange={onChange}
                onClick={(e) => e.stopPropagation()}
            />
        </Card>
    );
}
