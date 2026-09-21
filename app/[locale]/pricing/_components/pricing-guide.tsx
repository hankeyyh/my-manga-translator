import { Plus } from "lucide-react";
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
                <div className="mx-auto max-w-7xl px-4">
                    <div className="mx-auto max-w-3xl text-center">
                        <h2 className="font-headline text-2xl font-bold text-cc-text-primary md:text-3xl">
                            {t("creditsTitle")}
                        </h2>
                        <p className="mt-3 text-cc-text-secondary">{t("creditsIntro")}</p>
                    </div>
                    <div className="mx-auto mt-8 grid max-w-4xl gap-4 md:grid-cols-2">
                        <CcCard variant="outlined" className="p-6 lg:p-8">
                            <CcCardTitle>{t("creditsFastTitle")}</CcCardTitle>
                            <CcCardDescription className="mt-2">
                                {t("creditsFastBody")}
                            </CcCardDescription>
                        </CcCard>
                        <CcCard variant="outlined" className="p-6 lg:p-8">
                            <CcCardTitle>{t("creditsQualityTitle")}</CcCardTitle>
                            <CcCardDescription className="mt-2">
                                {t("creditsQualityBody")}
                            </CcCardDescription>
                        </CcCard>
                    </div>
                </div>
            </section>

            <section className="bg-cc-surface-page py-16">
                <div className="mx-auto max-w-7xl px-4">
                    <h2 className="text-center font-headline text-2xl font-bold text-cc-text-primary md:text-3xl">
                        {t("compareTitle")}
                    </h2>
                    <div className="mx-auto mt-8 grid max-w-4xl gap-4 md:grid-cols-2">
                        <CcCard variant="outlined" className="p-6 lg:p-8">
                            <CcCardTitle>{t("comparePayToUseTitle")}</CcCardTitle>
                            <p className="mt-3 text-sm leading-relaxed text-cc-text-secondary">
                                {t("comparePayToUseBody")}
                            </p>
                        </CcCard>
                        <CcCard variant="outlined" className="p-6 lg:p-8">
                            <CcCardTitle>{t("compareSubscriptionTitle")}</CcCardTitle>
                            <p className="mt-3 text-sm leading-relaxed text-cc-text-secondary">
                                {t("compareSubscriptionBody")}
                            </p>
                        </CcCard>
                    </div>
                </div>
            </section>

            <section className="bg-cc-surface-page py-16">
                <div className="mx-auto max-w-3xl px-4">
                    <h2 className="mb-8 text-center font-headline text-2xl font-bold text-cc-text-primary md:text-3xl">
                        {t("faqTitle")}
                    </h2>
                    <div className="overflow-hidden rounded-xl border border-[var(--cc-border-default)] bg-[var(--cc-surface-white)]">
                        {faqs.map((faq, index) => (
                            <details
                                key={faq.question}
                                className="group border-b border-[var(--cc-border-light)] last:border-b-0"
                                open={index === 0}
                            >
                                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 font-body text-sm font-medium text-[var(--cc-text-primary)] transition-colors hover:bg-[var(--cc-brand-tint)] [&::-webkit-details-marker]:hidden">
                                    {faq.question}
                                    <Plus
                                        className="size-4 shrink-0 text-[var(--cc-brand-primary)] transition-transform group-open:rotate-45"
                                        aria-hidden
                                    />
                                </summary>
                                <p className="px-4 pb-4 font-body text-sm text-[var(--cc-text-secondary)]">
                                    {faq.answer}
                                </p>
                            </details>
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
