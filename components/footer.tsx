import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

const PRODUCT_LINKS = [
    { key: "tool", href: "/#tool" },
    { key: "blog", href: "/blogs" },
    { key: "pricing", href: "/#pricing" },
] as const;

const LEGAL_LINKS = [
    { key: "about", href: "/legal/about" },
    { key: "privacy", href: "/legal/privacy" },
    { key: "terms", href: "/legal/terms" },
    { key: "refund", href: "/legal/refund" },
    { key: "faq", href: "/#faq" },
    { key: "dmca", href: "/legal/dmca" },
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

export async function Footer() {
    const t = await getTranslations("footer");
    const tCommon = await getTranslations("common");

    return (
        <footer className="border-t border-cc-border/40 bg-cc-surface-page">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="max-w-xs">
                        <p className="font-headline text-lg font-bold tracking-tight text-cc-text-primary">
                            {tCommon("brand")}
                        </p>
                        <p className="mt-3 text-sm leading-relaxed text-cc-text-secondary">
                            {t("tagline")}
                        </p>
                    </div>

                    <div>
                        <p className="font-headline font-semibold text-cc-text-primary">{t("product")}</p>
                        <ul className="mt-4 space-y-3 text-sm text-cc-text-secondary">
                            {PRODUCT_LINKS.map((item) => (
                                <li key={item.key}>
                                    <Link
                                        href={item.href}
                                        className="transition-colors hover:text-cc-brand-primary"
                                    >
                                        {t(`links.${item.key}`)}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <p className="font-headline font-semibold text-cc-text-primary">{t("legal")}</p>
                        <ul className="mt-4 space-y-3 text-sm text-cc-text-secondary">
                            {LEGAL_LINKS.map((item) => (
                                <li key={item.key}>
                                    <Link
                                        href={item.href}
                                        className="transition-colors hover:text-cc-brand-primary"
                                    >
                                        {t(`links.${item.key}`)}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <p className="font-headline font-semibold text-cc-text-primary">{t("contact")}</p>
                        <p className="mt-4 text-sm text-cc-text-secondary">
                            {t("emailLabel")}
                            <Link
                                href="#"
                                className="text-cc-brand-primary transition-colors hover:text-cc-brand-primary-hover"
                            >
                                hello@mangasense.com
                            </Link>
                        </p>
                        <p className="mt-6 text-sm font-medium text-cc-text-primary">{t("followUs")}</p>
                        <Link
                            href="#"
                            aria-label={t("followX")}
                            className="mt-3 inline-flex text-cc-text-primary transition-colors hover:text-cc-brand-primary"
                        >
                            <XIcon className="size-5" />
                        </Link>
                    </div>
                </div>

                <div className="mt-12 flex flex-col gap-4 border-t border-cc-border/40 pt-8 text-sm text-cc-text-muted sm:flex-row sm:items-end sm:justify-between">
                    <div className="space-y-1">
                        <p>{t("copyright", { year: 2026 })}</p>
                        <p>{t("disclaimer")}</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
