import Link from "next/link";

const PRODUCT_LINKS = [
    { label: "工具", href: "/#tool" },
    { label: "博客", href: "/blogs" },
    { label: "价格", href: "/#pricing" },
] as const;

const LEGAL_LINKS = [
    { label: "关于", href: "/legal/about" },
    { label: "隐私政策", href: "/legal/privacy" },
    { label: "使用条款", href: "/legal/terms" },
    { label: "退款政策", href: "/legal/refund" },
    { label: "常见问题", href: "/#faq" },
    { label: "DMCA", href: "/legal/dmca" },
] as const;

function XIcon({ className }: { className?: string; }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden
        >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.227-8.922L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
        </svg>
    );
}

export function Footer() {
    return (
        <footer className="border-t border-cc-border/40 bg-cc-surface-page">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="max-w-xs">
                        <p className="font-headline text-lg font-bold tracking-tight text-cc-text-primary">
                            Manga Sense
                        </p>
                        <p className="mt-3 text-sm leading-relaxed text-cc-text-secondary">
                            上传漫画，获取AI驱动的精准翻译。智能OCR、忠实翻译、无缝排版。
                        </p>
                    </div>

                    <div>
                        <p className="font-headline font-semibold text-cc-text-primary">产品</p>
                        <ul className="mt-4 space-y-3 text-sm text-cc-text-secondary">
                            {PRODUCT_LINKS.map((item) => (
                                <li key={item.label}>
                                    <Link
                                        href={item.href}
                                        className="transition-colors hover:text-cc-brand-primary"
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <p className="font-headline font-semibold text-cc-text-primary">法律</p>
                        <ul className="mt-4 space-y-3 text-sm text-cc-text-secondary">
                            {LEGAL_LINKS.map((item) => (
                                <li key={item.label}>
                                    <Link
                                        href={item.href}
                                        className="transition-colors hover:text-cc-brand-primary"
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <p className="font-headline font-semibold text-cc-text-primary">联系我们</p>
                        <p className="mt-4 text-sm text-cc-text-secondary">
                            邮箱:{" "}
                            <Link
                                href="#"
                                className="text-cc-brand-primary transition-colors hover:text-cc-brand-primary-hover"
                            >
                                hello@mangasense.com
                            </Link>
                        </p>
                        <p className="mt-6 text-sm font-medium text-cc-text-primary">关注我们</p>
                        <Link
                            href="#"
                            aria-label="X"
                            className="mt-3 inline-flex text-cc-text-primary transition-colors hover:text-cc-brand-primary"
                        >
                            <XIcon className="size-5" />
                        </Link>
                    </div>
                </div>

                <div className="mt-12 flex flex-col gap-4 border-t border-cc-border/40 pt-8 text-sm text-cc-text-muted sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-1">
                        <p>© 2026 Manga Sense. 保留所有权利。</p>
                        <p>Manga Sense 与任何漫画出版社无关。</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
