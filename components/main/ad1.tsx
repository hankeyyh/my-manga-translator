import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { CheckCircle2, Pencil, Star } from "lucide-react";

export function Ad1() {
    return (
        <section className="px-8 pb-24">
            <div className="mx-auto max-w-[1400px]">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    <Card className="flex flex-col gap-6 rounded-[2rem] border-0 bg-[#f1f4f7] p-10 shadow-none">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white">
                            <CheckCircle2 className="h-8 w-8 text-[#3370FF]" />
                        </div>
                        <CardHeader className="p-0">
                            <CardTitle className="mb-4 font-headline text-2xl font-bold">
                                Context-Aware AI
                            </CardTitle>
                            <CardDescription className="font-body text-base leading-relaxed text-[#5a6064]">
                                Our models don&apos;t just translate words; they understand
                                narrative flow, character relationships, and cultural nuances
                                within every panel.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                    <Card className="flex flex-col gap-6 rounded-[2rem] border-0 bg-[#f1f4f7] p-10 shadow-none">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white">
                            <Pencil className="h-8 w-8 text-[#3370FF]" strokeWidth={2} />
                        </div>
                        <CardHeader className="p-0">
                            <CardTitle className="mb-4 font-headline text-2xl font-bold">
                                Smart Redrawing
                            </CardTitle>
                            <CardDescription className="font-body text-base leading-relaxed text-[#5a6064]">
                                Advanced in-painting technology automatically fills in artwork
                                behind removed text, maintaining the original artist&apos;s
                                brushstrokes.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                    <Card className="flex flex-col gap-6 rounded-[2rem] border-0 bg-[#f1f4f7] p-10 shadow-none">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white">
                            <Star className="h-8 w-8 fill-current text-[#3370FF]" />
                        </div>
                        <CardHeader className="p-0">
                            <CardTitle className="mb-4 font-headline text-2xl font-bold">
                                Style Preservation
                            </CardTitle>
                            <CardDescription className="font-body text-base leading-relaxed text-[#5a6064]">
                                We analyze original typography and SFX styles to render
                                translated text that looks like it was part of the first
                                printing.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            </div>
        </section>
    )
}