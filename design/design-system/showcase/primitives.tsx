import { cn } from "@/components/utils";

type TokenSwatchProps = {
    name: string;
    value: string;
    cssVar?: string;
    type?: "color" | "shadow" | "radius" | "spacing" | "text";
};

export function TokenSwatch({ name, value, cssVar, type = "color" }: TokenSwatchProps) {
    const isColor = type === "color";
    const isShadow = type === "shadow";
    const isRadius = type === "radius";
    const isSpacing = type === "spacing";

    return (
        <div className="flex flex-col gap-2 rounded-xl border border-cc-border/40 bg-cc-surface-white p-4">
            <div
                className={cn(
                    "flex items-center justify-center overflow-hidden border border-cc-border/30 bg-cc-surface-muted",
                    isColor ? "h-16" : "h-12",
                )}
                style={{
                    backgroundColor: isColor ? value : undefined,
                    boxShadow: isShadow ? value : undefined,
                    borderRadius: isRadius ? value : isSpacing ? "0.25rem" : "0.5rem",
                    width: isSpacing ? value : undefined,
                }}
            >
                {isSpacing && (
                    <span className="font-mono text-xs text-cc-text-muted">{value}</span>
                )}
                {isShadow && (
                    <div className="size-8 rounded-md bg-cc-surface-white" />
                )}
            </div>
            <div>
                <p className="font-mono text-xs font-semibold text-cc-text-primary">{name}</p>
                <p className="mt-0.5 truncate font-mono text-[10px] text-cc-text-muted">{value}</p>
                {cssVar && (
                    <p className="mt-0.5 truncate font-mono text-[10px] text-cc-brand-primary">
                        {cssVar}
                    </p>
                )}
            </div>
        </div>
    );
}

export function TokenGroup({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section className="space-y-4">
            <h3 className="font-headline text-xl font-bold text-cc-text-primary">{title}</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {children}
            </div>
        </section>
    );
}

export function DesignSection({
    id,
    title,
    description,
    children,
}: {
    id: string;
    title: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <section className="scroll-mt-24 space-y-8" id={id}>
            <div className="border-b border-cc-border/40 pb-4">
                <h2 className="font-headline text-3xl font-bold text-cc-text-primary">{title}</h2>
                {description && (
                    <p className="mt-2 font-body text-cc-text-secondary">{description}</p>
                )}
            </div>
            {children}
        </section>
    );
}

export function ComponentPreview({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-3">
            <p className="font-body text-sm font-semibold text-cc-text-secondary">{title}</p>
            <div className="rounded-xl border border-cc-border/40 bg-cc-surface-white p-6">
                {children}
            </div>
        </div>
    );
}
