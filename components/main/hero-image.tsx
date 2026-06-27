import Image from "next/image";

const HERO_IMAGE = "/hero.avif";

export function HeroImage() {
    return (
        <div className="relative flex h-[614px] min-h-[500px] w-full items-end overflow-hidden">
            <Image
                alt=""
                className="object-cover brightness-[0.4] saturate-[120%]"
                fill
                priority
                sizes="100vw"
                src={HERO_IMAGE}
                unoptimized
            />
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-[rgba(12,15,16,0.7)]"
            />
            <div className="relative mx-auto w-full max-w-[1920px] px-8 pb-16 lg:pb-24">
                <div className="max-w-3xl">
                    <h1 className="mb-6 font-headline text-5xl font-extrabold leading-[1.1] tracking-tight text-white lg:text-7xl">
                        AI-Powered Comic Translation
                    </h1>
                    <p className="max-w-xl text-xl font-medium leading-relaxed text-white/90">
                        Preserving the soul of visual storytelling through context-aware
                        artificial intelligence and smart redraw technology.
                    </p>
                </div>
            </div>
        </div>
    )
}