"use client";

import {
    CcAccordion,
    CcSectionHeading,
} from "@/components/cc";
import { useTranslations } from "next-intl";
import { FAQ_KEYS } from "./faq-keys";

export function FaqSection() {
    const t = useTranslations("faq");
    const faqs = FAQ_KEYS.map((key) => ({
        question: t(`items.${key}.question`),
        answer: t(`items.${key}.answer`),
    }));

    return (
        <section id="faq" className="scroll-mt-16 border-t border-cc-border/40 bg-cc-surface-page py-16">
            <div className="mx-auto max-w-3xl px-4">
                <CcSectionHeading className="mb-8" size="md" title={t("title")} />
                <CcAccordion items={faqs} />
            </div>
        </section>
    );
}
