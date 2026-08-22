"use client";

import { useRef, useState } from "react";
import { Plus, Upload } from "lucide-react";
import { cn } from "@/components/utils";
import { useTranslations } from "next-intl";

const ACCEPT =
    ".jpg,.jpeg,.png,.webp,.gif,.avif,.heic,.pdf,.epub,.cbz,.zip,image/*,application/pdf,application/epub+zip,application/zip";

export function UploadZone(props: {
    uploaded: number;
    maxPages: number;
    compact: boolean;
    onFilesSelected: (files: File[]) => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const dragDepthRef = useRef(0);
    const [isDragging, setIsDragging] = useState(false);
    const remaining = Math.max(0, props.maxPages - props.uploaded);
    const t = useTranslations("upload");

    function openFilePicker() {
        inputRef.current?.click();
    }

    function emitFiles(files: File[]) {
        if (files.length > 0) {
            props.onFilesSelected(files);
        }
    }

    function onChange(e: React.ChangeEvent<HTMLInputElement>) {
        // FileList 是 input 的实时视图，清空 value 后会变空；先拷成 File[]
        const files = Array.from(e.target.files ?? []);
        e.target.value = "";
        emitFiles(files);
    }

    function hasFiles(e: React.DragEvent) {
        return Array.from(e.dataTransfer.types).includes("Files");
    }

    function onDragEnter(e: React.DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        if (!hasFiles(e)) {
            return;
        }
        dragDepthRef.current += 1;
        setIsDragging(true);
    }

    function onDragLeave(e: React.DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        dragDepthRef.current -= 1;
        if (dragDepthRef.current <= 0) {
            dragDepthRef.current = 0;
            setIsDragging(false);
        }
    }

    function onDragOver(e: React.DragEvent) {
        // 不 preventDefault 的话浏览器不派发 drop，只会打开文件
        e.preventDefault();
        e.stopPropagation();
        if (hasFiles(e)) {
            e.dataTransfer.dropEffect = "copy";
        }
    }

    function onDrop(e: React.DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        dragDepthRef.current = 0;
        setIsDragging(false);
        emitFiles(Array.from(e.dataTransfer.files));
    }

    return (
        <div
            className={cn(
                "cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed bg-cc-surface-white shadow-[var(--cc-shadow-sm)] transition-colors hover:border-cc-brand-primary hover:bg-[var(--cc-brand-tint)]",
                isDragging
                    ? "border-cc-brand-primary bg-[var(--cc-brand-tint)]"
                    : "border-cc-brand-primary/30",
            )}
            onClick={openFilePicker}
            onDragEnter={onDragEnter}
            onDragLeave={onDragLeave}
            onDragOver={onDragOver}
            onDrop={onDrop}
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
                    <div
                        className={cn(
                            "flex flex-col items-center gap-2 px-6 py-10 text-center transition-opacity duration-300",
                            props.compact ? "opacity-0" : "opacity-100",
                        )}
                    >
                        <div className="flex size-14 items-center justify-center rounded-full bg-[var(--cc-brand-tint)]">
                            <Upload className="size-7 text-cc-brand-primary" />
                        </div>
                        <p className="font-headline text-sm font-semibold text-cc-text-primary">
                            {t("dropHint")}{" "}
                            <span className="text-cc-brand-primary underline">{t("browse")}</span>
                        </p>
                        <p className="text-xs text-cc-text-muted">
                            {t("formats")}
                        </p>
                        <p className="text-xs text-cc-text-muted">
                            {t("quota", { uploaded: props.uploaded, max: props.maxPages, remaining })}
                        </p>
                    </div>
                </div>
            </div>
            <div
                className={cn(
                    "grid transition-[grid-template-rows] duration-300 ease-out",
                    props.compact ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                )}
            >
                <div className="overflow-hidden">
                    <div
                        className={cn(
                            "flex items-center justify-between px-4 py-2.5 transition-opacity duration-300",
                            props.compact ? "opacity-100" : "opacity-0",
                        )}
                    >
                        <p className="flex items-center gap-1.5 text-sm text-cc-text-primary">
                            <Plus className="size-4 text-cc-brand-primary" />
                            {t("addOrDrop")}
                        </p>
                        <p className="text-sm text-cc-text-muted">
                            {t("compactQuota", { uploaded: props.uploaded, max: props.maxPages })}
                        </p>
                    </div>
                </div>
            </div>
            <input
                ref={inputRef}
                type="file"
                accept={ACCEPT}
                multiple
                className="hidden"
                onChange={onChange}
                /**
                 * 需要通过stopPropagation 截住子控件的点击事件向父控件传递
                 * 用自定义控件打开input的通用做法：
                 * 1. 在自定义控件上注册onClick事件
                 * 2. onClick事件上通过ref执行input.click，打开文件选择器
                 * 3. 选好文件「确定」后，input onChange 处理选中文件
                 * 4. input onClick 需要阻止点击事件向父组件传递，不然会发生递归click：
                 *      4.1 父组件onClick通过ref执行input.click
                 *      4.2 input click事件向上传递，又触发了父组件onClick
                 *  注意：递归会让父组件上的onClick执行两次，不会无限递归，因为浏览器对 click() 有重入保护：
                 *      第一次 input.click() 还在派发、冒泡的过程中，元素会带「click 进行中」标记，
                 *      第二次 input.click() 往往直接 return
                 */
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    );
}
