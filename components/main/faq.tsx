"use client"

import { useState } from "react";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { cn } from "../utils";

export function Faq() {
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
    
    const faqs = [
        {
            question: "Can I try ComicCurator for free first?",
            answer:
                "Yes! We offer a free trial with limited translation credits to help you experience our service.",
        },
        {
            question: "How do translation credits work?",
            answer:
                "Each translation consumes credits based on the complexity and length of the content. Credits refresh monthly with your subscription.",
        },
        {
            question: "Can I use these credits across multiple devices?",
            answer:
                "Absolutely! Your account and credits are accessible from any device where you're logged in.",
        },
        {
            question: "Why do I need to login with email or Google?",
            answer:
                "Login ensures your translations are saved and synced across devices, and helps us provide personalized service.",
        },
        {
            question: "Does ComicCurator have an API?",
            answer:
                "Yes! Ultra plan includes enterprise API access for integration with your own applications.",
        },
        {
            question: "Do you have a Discord community?",
            answer:
                "Yes! Join our Discord to connect with 50k+ comic enthusiasts and get support from our community.",
        },
    ];

    return (
        <section className="scroll-mt-16 bg-[#f8f9fb] px-8 py-32" id="faq">
            <div className="mx-auto max-w-3xl">
                <h2 className="mb-16 text-center font-headline text-4xl font-bold text-[#2d3337] md:text-5xl">
                    Frequently asked questions
                </h2>
                <div className="flex flex-col border-t border-[#adb3b7]/20">
                    {faqs.map((faq, index) => (
                        <div
                            key={faq.question}
                            className="group border-b border-[#adb3b7]/20"
                        >
                            <Button
                                className="h-auto w-full justify-between gap-4 py-8 font-headline text-lg font-medium text-[#2d3337] hover:bg-transparent hover:text-[#3370FF] md:text-xl"
                                onClick={() =>
                                    setExpandedFaq(expandedFaq === index ? null : index)
                                }
                                variant="ghost"
                            >
                                <span className="text-left">{faq.question}</span>
                                <Plus
                                    className={cn(
                                        "h-6 w-6 shrink-0 text-[#767b7f] transition-transform group-hover:text-[#3370FF]",
                                        expandedFaq === index && "rotate-45",
                                    )}
                                />
                            </Button>
                            {expandedFaq === index && (
                                <div className="px-2 pb-8">
                                    <p className="font-body text-[#5a6064]">{faq.answer}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="mt-16 text-center">
                    <p className="mb-6 font-body text-[#5a6064]">Still have questions?</p>
                    <Button
                        className="font-body font-bold text-[#3370FF] hover:bg-transparent hover:underline"
                        variant="link"
                    >
                        Contact our support team
                    </Button>
                </div>
            </div>
        </section>
    )
}