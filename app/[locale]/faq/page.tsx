import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { PageBreadcrumb } from "@/components/page-breadcrumb";
import { CcButton } from "@/components/cc";
import { Link } from "@/i18n/navigation";
import { buildPageMetadata } from "@/biz/seo/site";
import { FAQ_KEYS } from "../_components/faq-keys";
import { FaqJsonLd } from "./_components/seo/faq-json-ld";

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getLocale();
    const t = await getTranslations("meta");
    return buildPageMetadata({
        locale,
        href: "/faq",
        title: t("faqTitle"),
        description: t("faqDescription"),
    });
}

export const revalidate = 60;

export default async function Page() {
    const t = await getTranslations("faq");
    const tPricing = await getTranslations("pricing");
    const tCommon = await getTranslations("common");
    const tHero = await getTranslations("hero");
    const faqs = FAQ_KEYS.map((key) => ({
        key,
        question: t(`items.${key}.question`),
        answer: t(`items.${key}.answer`),
    }));

    return (
        <div className="bg-cc-surface-white">
            <FaqJsonLd />
            <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
                <PageBreadcrumb
                    className="mb-6"
                    items={[
                        { label: tCommon("home"), href: "/" },
                        { label: t("title") },
                    ]}
                />
                <header className="pb-12 pt-4 text-center sm:pb-16 sm:pt-6">
                    <h1 className="font-headline text-3xl font-extrabold tracking-tight text-cc-text-primary sm:text-5xl">
                        {t("pageTitle")}
                    </h1>
                </header>
                <div className="mt-16 flex flex-col gap-4 sm:mt-6">
                    {faqs.map((faq, index) => (
                        <div key={faq.key} className="flex flex-col gap-4">
                            <article
                                id={faq.key}
                                className="scroll-mt-20 rounded-cc-2xl border border-cc-border bg-[var(--cc-brand-tint)] px-6 py-6"
                            >
                                <h2 className="font-headline text-xl font-bold text-cc-text-primary md:text-2xl">
                                    {faq.question}
                                </h2>
                                <p className="mt-3 text-base leading-relaxed text-cc-text-secondary">
                                    {faq.answer}
                                </p>
                            </article>
                            {index === 2 && (
                                <div className="flex flex-col items-center justify-between gap-3 rounded-cc-2xl border border-cc-border bg-cc-surface-white px-5 py-4 shadow-cc-card sm:flex-row sm:px-6">
                                    <p className="text-center text-sm font-medium text-cc-text-primary sm:text-start">
                                        {t("tryHint")}
                                    </p>
                                    <CcButton className="shrink-0" asChild>
                                        <Link href="/#tool">{tHero("tryFree")}</Link>
                                    </CcButton>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <section className="bg-cc-surface-white py-16">
                <div className="mx-auto max-w-3xl px-4 text-center">
                    <h2 className="font-headline text-2xl font-bold text-cc-text-primary md:text-3xl">
                        {tPricing("ctaTitle")}
                    </h2>
                    <p className="mt-3 text-cc-text-secondary">{tPricing("ctaBody")}</p>
                    <CcButton className="mt-6" asChild>
                        <Link href="/#tool">{tHero("tryFree")}</Link>
                    </CcButton>
                </div>
            </section>
        </div>
    );
}
