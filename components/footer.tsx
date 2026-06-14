import { Button } from "./ui/button";
import Link from "next/link";

export function Footer() {
    return (
        <footer className="w-full border-t border-slate-200/20 bg-[#f1f4f7] px-8 py-12">
            <div className="mx-auto flex w-full max-w-[1920px] flex-col items-center justify-between gap-8 md:flex-row">
                <div className="flex flex-col gap-4">
                    <div className="font-headline text-xl font-bold text-slate-900">
                        ComicCurator
                    </div>
                    <p className="font-body text-sm tracking-wide text-slate-500">
                        © 2024 ComicCurator. The Digital Curator for Visual Storytelling.
                    </p>
                </div>
                <div className="flex flex-wrap justify-center gap-8 font-body text-sm tracking-wide">
                    <Link
                        className="text-slate-500 transition-all hover:text-[#3370FF]"
                        href="#"
                    >
                        Privacy Policy
                    </Link>
                    <Link
                        className="text-slate-500 transition-all hover:text-[#3370FF]"
                        href="#"
                    >
                        Terms of Service
                    </Link>
                    <Link
                        className="text-slate-500 transition-all hover:text-[#3370FF]"
                        href="#"
                    >
                        API Documentation
                    </Link>
                    <Link
                        className="text-slate-500 transition-all hover:text-[#3370FF]"
                        href="#"
                    >
                        Contact Support
                    </Link>
                </div>
                <div className="flex gap-4">
                    <Button
                        asChild
                        className="h-10 w-10 rounded-full bg-white hover:text-[#3370FF]"
                        size="icon"
                        variant="ghost"
                    >
                        <Link aria-label="Community" href="#">
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                            </svg>
                        </Link>
                    </Button>
                    <Button
                        asChild
                        className="h-10 w-10 rounded-full bg-white hover:text-[#3370FF]"
                        size="icon"
                        variant="ghost"
                    >
                        <Link aria-label="Profile" href="#">
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                            </svg>
                        </Link>
                    </Button>
                </div>
            </div>
        </footer>
    );
}