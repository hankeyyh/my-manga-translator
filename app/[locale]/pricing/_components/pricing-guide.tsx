import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CcButton, CcCard, CcCardDescription, CcCardTitle } from "@/components/cc";
import { PRICING_FAQ_KEYS } from "./pricing-faq-keys";

export async function PricingGuide() {
    const t = await getTranslations("pricing");
    const tHero = await getTranslations("hero");
    const tFooter = await getTranslations("footer");
    const faqs = PRICING_FAQ_KEYS.map((key) => ({
        question: t(`faq.${key}.question`),
        answer: t(`faq.${key}.answer`),
    }));

    return (
        <>
            <section className="bg-cc-surface-page py-16">
                <div className="mx-auto max-w-3xl px-4">
                    <h2 className="mb-8 text-center font-headline text-2xl font-bold text-cc-text-primary md:text-3xl">
                        {t("faqTitle")}
                    </h2>
                    <div className="overflow-hidden rounded-xl border border-[var(--cc-border-default)] bg-[var(--cc-surface-white)] px-4 sm:px-6">
                        {faqs.map((faq) => (
                            <article
                                key={faq.question}
                                className="border-b border-[var(--cc-border-light)] py-5 last:border-b-0 last:pb-5"
                            >
                                <h3 className="font-body text-sm font-medium text-[var(--cc-text-primary)]">
                                    {faq.question}
                                </h3>
                                <p className="mt-2 font-body text-sm leading-relaxed text-[var(--cc-text-secondary)]">
                                    {faq.answer}
                                </p>
                            </article>
                        ))}
                    </div>
                    <p className="mt-4 text-center text-sm text-cc-text-muted">
                        <Link
                            href="/legal/refund"
                            className="text-cc-brand-primary transition-colors hover:underline"
                        >
                            {tFooter("links.refund")}
                        </Link>
                    </p>
                </div>
            </section>

            <section className="bg-cc-surface-white py-16">
                <div className="mx-auto max-w-3xl px-4 text-center">
                    <h2 className="font-headline text-2xl font-bold text-cc-text-primary md:text-3xl">
                        {t("ctaTitle")}
                    </h2>
                    <p className="mt-3 text-cc-text-secondary">{t("ctaBody")}</p>
                    <CcButton className="mt-6" asChild>
                        <Link href="/#tool">{tHero("tryFree")}</Link>
                    </CcButton>
                </div>
            </section>
        </>
    );
}
