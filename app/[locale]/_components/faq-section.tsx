"use client";

import {
    CcAccordion,
    CcSectionHeading,
} from "@/design/design-system/components";

const faqs = [
    {
        question: "可以翻译日漫吗？",
        answer: "可以。支持日语漫画自动识别与翻译，保留气泡排版与画风。",
    },
    {
        question: "可以翻译韩漫吗？",
        answer: "可以。支持韩语竖向阅读漫画，并适配常见条漫版式。",
    },
    {
        question: "可以翻译中漫吗？",
        answer: "可以。支持简体/繁体中文漫画的跨语言翻译。",
    },
    {
        question: "使用什么 AI？",
        answer: "采用面向漫画场景优化的多模型流水线，覆盖文字检测、翻译与重绘。",
    },
    {
        question: "翻译需要多久？",
        answer: "单页通常数秒到数十秒，具体取决于图片尺寸与队列负载。",
    },
    {
        question: "支持哪些格式？",
        answer: "JPG、PNG、WebP、GIF、AVIF、HEIC、PDF、EPUB、CBZ、ZIP。",
    },
    {
        question: "页数会过期吗？",
        answer: "按量购买的页数永不过期；订阅页数按账单周期刷新。",
    },
    {
        question: "支持哪些语言？",
        answer: "支持 20+ 语言，包括日、中、英、韩等常见漫画语言。",
    },
    {
        question: "数据安全吗？",
        answer: "上传内容仅用于翻译处理，不会用于公开训练或对外分享。",
    },
    {
        question: "如何退款？",
        answer: "未使用的付费额度可按政策申请退款，详情见服务条款。",
    },
    {
        question: "有浏览器插件吗？",
        answer: "浏览器插件即将推出，当前请使用网页版上传翻译。",
    },
];

export function FaqSection() {
    return (
        <section id="faq" className="scroll-mt-16 border-t border-cc-border/40 bg-cc-surface-page py-16">
            <div className="mx-auto max-w-3xl px-4">
                <CcSectionHeading className="mb-8" size="md" title="常见问题" />
                <CcAccordion items={faqs} />
            </div>
        </section>
    );
}
