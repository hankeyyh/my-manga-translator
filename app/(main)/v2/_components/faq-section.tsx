"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const FAQ_ITEMS = [
    {
        q: "可以翻译日漫吗？",
        a: "可以。支持日语漫画自动识别与翻译，保留气泡排版与画风。",
    },
    {
        q: "可以翻译韩漫吗？",
        a: "可以。支持韩语竖向阅读漫画，并适配常见条漫版式。",
    },
    {
        q: "可以翻译中漫吗？",
        a: "可以。支持简体/繁体中文漫画的跨语言翻译。",
    },
    {
        q: "使用什么 AI？",
        a: "采用面向漫画场景优化的多模型流水线，覆盖文字检测、翻译与重绘。",
    },
    {
        q: "翻译需要多久？",
        a: "单页通常数秒到数十秒，具体取决于图片尺寸与队列负载。",
    },
    {
        q: "支持哪些格式？",
        a: "JPG、PNG、WebP、GIF、AVIF、HEIC、PDF、EPUB、CBZ、ZIP。",
    },
    {
        q: "页数会过期吗？",
        a: "按量购买的页数永不过期；订阅页数按账单周期刷新。",
    },
    {
        q: "支持哪些语言？",
        a: "支持 20+ 语言，包括日、中、英、韩等常见漫画语言。",
    },
    {
        q: "数据安全吗？",
        a: "上传内容仅用于翻译处理，不会用于公开训练或对外分享。",
    },
    {
        q: "如何退款？",
        a: "未使用的付费额度可按政策申请退款，详情见服务条款。",
    },
    {
        q: "有浏览器插件吗？",
        a: "浏览器插件即将推出，当前请使用网页版上传翻译。",
    },
];

export function FaqSection() {
    const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

    return (
        <section id="faq" className="scroll-mt-16 border-t bg-muted/40 py-16">
            <div className="mx-auto max-w-2xl px-4">
                <h2 className="mb-8 text-center text-2xl font-semibold">常见问题</h2>
                <div className="divide-y rounded-xl border bg-background">
                    {FAQ_ITEMS.map((item, index) => (
                        <div key={item.q}>
                            <Button
                                variant="ghost"
                                className="h-auto w-full justify-between rounded-none px-4 py-4 text-left font-normal"
                                onClick={() =>
                                    setExpandedFaq(expandedFaq === index ? null : index)
                                }
                            >
                                <span>{item.q}</span>
                                <Plus
                                    className={`size-4 shrink-0 transition-transform ${expandedFaq === index ? "rotate-45" : ""
                                        }`}
                                />
                            </Button>
                            {expandedFaq === index && (
                                <p className="px-4 pb-4 text-sm text-muted-foreground">
                                    {item.a}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
