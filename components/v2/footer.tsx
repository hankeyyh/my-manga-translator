import { Button } from "../ui/button";

export function Footer() {
    return (
        <footer className="border-t py-10">
            <div className="mx-auto grid max-w-5xl gap-8 px-4 sm:grid-cols-3">
                <div>
                    <p className="font-semibold">Manga Sense</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        © 2026 All rights reserved.
                    </p>
                </div>
                <div className="flex flex-col gap-1 text-sm">
                    <Button variant="link" className="h-auto justify-start px-0">
                        Privacy
                    </Button>
                    <Button variant="link" className="h-auto justify-start px-0">
                        Terms
                    </Button>
                    <Button variant="link" className="h-auto justify-start px-0">
                        Support
                    </Button>
                </div>
                <div className="flex gap-2 sm:justify-end">
                    <Button variant="outline" size="icon" aria-label="Discord">
                        D
                    </Button>
                    <Button variant="outline" size="icon" aria-label="Twitter">
                        X
                    </Button>
                </div>
            </div>
        </footer>
    );
}