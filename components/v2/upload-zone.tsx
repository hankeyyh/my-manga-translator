"use client";

import { useRef } from "react";
import { Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const ACCEPT =
    ".jpg,.jpeg,.png,.webp,.gif,.avif,.heic,.pdf,.epub,.cbz,.zip,image/*,application/pdf,application/epub+zip,application/zip";

export function UploadZone(props: {
    uploaded?: number;
    maxPages?: number;
    onFilesSelected?: (files: File[]) => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const uploaded = props.uploaded ?? 0;
    const maxPages = props.maxPages ?? 200;
    const remaining = Math.max(0, maxPages - uploaded);

    function openFilePicker() {
        inputRef.current?.click();
    }

    function onChange(e: React.ChangeEvent<HTMLInputElement>) {
        // FileList 是 input 的实时视图，清空 value 后会变空；先拷成 File[]
        const files = Array.from(e.target.files ?? []);
        e.target.value = "";
        if (files.length > 0) {
            props.onFilesSelected?.(files);
        }
    }

    return (
        <Card
            className="cursor-pointer transition-colors hover:bg-muted/50"
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
            <CardContent className="flex flex-col items-center gap-2 py-10 text-center">
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
                    已上传 {uploaded}/{maxPages} 页 · 剩余 {remaining} 页
                </p>
            </CardContent>
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
