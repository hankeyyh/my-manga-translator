import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { PageBreadcrumb } from "@/components/page-breadcrumb";
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
    const tCommon = await getTranslations("common");
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
                <div className="mt-16 sm:mt-8">
                    {faqs.map((faq) => (
                        <article
                            key={faq.key}
                            id={faq.key}
                            className="scroll-mt-20 border-b border-cc-border/40 py-8 first:pt-0 last:border-b-0 last:pb-0"
                        >
                            <h2 className="font-headline text-xl font-bold text-cc-text-primary md:text-2xl">
                                {faq.question}
                            </h2>
                            <p className="mt-3 text-base leading-relaxed text-cc-text-secondary">
                                {faq.answer}
                            </p>
                        </article>
                    ))}
                </div>
            </div>
        </div>
    );
}
