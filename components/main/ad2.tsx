import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { ArrowRight, Languages } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

const BENTO_IMAGE = "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?q=80&w=2942&auto=format&fit=crop";
const GLOSSARY_IMAGE = "https://images.unsplash.com/photo-1611457194403-d3aca4cf9d11?q=80&w=2942&auto=format&fit=crop";

export function Ad2() {
    return (
        <section className="px-8 pb-32">
            <div className="mx-auto max-w-[1400px]">
                <div className="grid h-auto grid-cols-12 grid-rows-2 gap-6 md:h-[600px]">
                    <div className="group relative col-span-12 overflow-hidden rounded-[2rem] bg-[#dee3e7] md:col-span-8">
                        <Image
                            alt=""
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            fill
                            sizes="(min-width: 768px) 66vw, 100vw"
                            src={BENTO_IMAGE}
                        />
                        <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-10">
                            <Badge className="mb-4 w-fit border-0 bg-[#3370FF]/20 px-4 py-1 font-body text-xs font-bold uppercase tracking-widest text-white backdrop-blur-md hover:bg-[#3370FF]/30">
                                Pro Feature
                            </Badge>
                            <h4 className="mb-2 font-headline text-3xl font-bold text-white">
                                Lossless Upscaling
                            </h4>
                            <p className="max-w-md font-body text-white/70">
                                Restore low-resolution scans to modern webtoon standards with a
                                single click.
                            </p>
                        </div>
                    </div>
                    <Card className="col-span-12 flex flex-col justify-between rounded-[2rem] border-0 bg-[#3370FF] p-10 text-white shadow-none md:col-span-4">
                        <CardHeader className="p-0">
                            <CardTitle className="mb-6 font-headline text-3xl font-bold leading-tight text-white">
                                Join 50k+ Curators
                            </CardTitle>
                            <CardDescription className="font-body text-base text-white/80">
                                The largest community of comic enthusiasts, translators, and
                                creators sharing their passion.
                            </CardDescription>
                        </CardHeader>
                        <div className="flex -space-x-4">
                            <div className="h-12 w-12 rounded-full border-4 border-[#3370FF] bg-slate-300" />
                            <div className="h-12 w-12 rounded-full border-4 border-[#3370FF] bg-slate-400" />
                            <div className="h-12 w-12 rounded-full border-4 border-[#3370FF] bg-slate-500" />
                            <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-[#3370FF] bg-slate-200 text-xs font-bold text-[#3370FF]">
                                +12k
                            </div>
                        </div>
                    </Card>
                    <Card className="col-span-12 flex flex-col items-center justify-center rounded-[2rem] border-0 bg-[#f1f4f7] p-10 text-center shadow-none md:col-span-4">
                        <Languages className="mb-4 h-12 w-12 text-[#3370FF]" />
                        <CardHeader className="p-0">
                            <CardTitle className="mb-2 font-headline text-2xl font-bold">
                                40+ Languages
                            </CardTitle>
                            <CardDescription className="font-body text-base text-[#5a6064]">
                                Supporting major global languages including specialized dialects.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                    <Card className="col-span-12 flex items-center gap-10 rounded-[2rem] border border-[#ebeef1] bg-white p-10 shadow-sm md:col-span-8">
                        <div className="hidden h-32 w-32 shrink-0 overflow-hidden rounded-2xl bg-[#ebeef1] sm:block">
                            <Image
                                alt="Comic panel excerpt"
                                className="h-full w-full object-cover"
                                height={128}
                                src={GLOSSARY_IMAGE}
                                width={128}
                            />
                        </div>
                        <CardContent className="p-0">
                            <CardTitle className="mb-2 font-headline text-2xl font-bold">
                                Visual Glossary
                            </CardTitle>
                            <CardDescription className="font-body text-base text-[#5a6064]">
                                Maintain consistency across series with character name tracking
                                and recurring phrase detection.
                            </CardDescription>
                            <Button
                                className="mt-4 gap-2 p-0 font-body font-bold text-[#3370FF] hover:gap-4 hover:bg-transparent hover:text-[#3370FF]"
                                variant="link"
                            >
                                Learn more
                                <ArrowRight className="h-5 w-5" />
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    )
}