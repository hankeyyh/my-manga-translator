"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import faqData from "@/content/faq/faq.json";

export function FaqSection() {
    const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

    return (
        <section id="faq" className="scroll-mt-16 border-t bg-muted/40 py-16">
            <div className="mx-auto max-w-2xl px-4">
                <h2 className="mb-8 text-center text-2xl font-semibold">常见问题</h2>
                <div className="divide-y rounded-xl border bg-background">
                    {faqData.faqs.map((item, index) => (
                        <div key={item.q}>
                            <Button
                                variant="ghost"
                                className="h-auto w-full justify-between rounded-none px-4 py-4 text-left font-normal"
                                onClick={() =>
                                    setExpandedFaq(expandedFaq === index ? null : index)
                                }
                            >
                                <span>{item.q}</span>
                                <Plus
                                    className={`size-4 shrink-0 transition-transform ${expandedFaq === index ? "rotate-45" : ""
                                        }`}
                                />
                            </Button>
                            {expandedFaq === index && (
                                <p className="px-4 pb-4 text-sm text-muted-foreground">
                                    {item.a}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
