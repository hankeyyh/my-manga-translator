import Link from "next/link";

export function HomeFooter() {
    return (
        <footer className="mt-12 w-full shrink-0 border-t border-slate-200 bg-[#f1f4f7] px-8 py-12">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
                <div className="font-headline font-bold text-slate-900">ComicCurator</div>
                <div className="flex flex-wrap justify-center gap-6">
                    <Link
                        className="text-sm text-slate-500 transition-colors hover:text-[#0053dd]"
                        href="#"
                    >
                        Terms of Service
                    </Link>
                    <Link
                        className="text-sm text-slate-500 transition-colors hover:text-[#0053dd]"
                        href="#"
                    >
                        Privacy Policy
                    </Link>
                    <Link
                        className="text-sm text-slate-500 transition-colors hover:text-[#0053dd]"
                        href="#"
                    >
                        API Docs
                    </Link>
                    <Link
                        className="text-sm text-slate-500 transition-colors hover:text-[#0053dd]"
                        href="#"
                    >
                        Support
                    </Link>
                </div>
                <div className="text-sm text-slate-500">
                    © 2024 ComicCurator. Precision in every panel.
                </div>
            </div>
        </footer>
    );
}
