import { Check } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { CcCard } from "@/components/cc";

function BenefitItem({ benefit }: { benefit: string }) {
    return (
        <li className="flex min-w-0 items-start gap-3">
            <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--cc-brand-primary)]/10">
                <Check
                    className="size-3 text-cc-brand-primary"
                    strokeWidth={3}
                />
            </span>
            <span className="min-w-0 flex-1 text-pretty font-body text-sm leading-6 text-cc-text-secondary">
                {benefit}
            </span>
        </li>
    );
}

export async function PricingBenefits() {
    const t = await getTranslations("pricing");
    const benefits = t.raw("pageBenefits") as string[];
    const splitAt = Math.ceil(benefits.length / 2);
    const leftBenefits = benefits.slice(0, splitAt);
    const rightBenefits = benefits.slice(splitAt);

    return (
        <CcCard
            className="mx-auto mt-8 w-full max-w-7xl px-5 py-5 text-start sm:px-8 sm:py-6"
            variant="panel"
        >
            <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 md:gap-x-16">
                <ul className="flex min-w-0 flex-col gap-4">
                    {leftBenefits.map((benefit) => (
                        <BenefitItem key={benefit} benefit={benefit} />
                    ))}
                </ul>
                <ul className="flex min-w-0 flex-col gap-4">
                    {rightBenefits.map((benefit) => (
                        <BenefitItem key={benefit} benefit={benefit} />
                    ))}
                </ul>
            </div>
        </CcCard>
    );
}
