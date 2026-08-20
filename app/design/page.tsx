"use client";

import { useState } from "react";
import { Manrope, Inter } from "next/font/google";
import { BookOpen, CheckCircle2, Download, Phone, Star } from "lucide-react";

import { cn } from "@/components/utils";
import { tokenGroups, typography } from "@/design/design-system/tokens";
import {
    CcBadge,
    CcButton,
    CcCard,
    CcCardDescription,
    CcCardTitle,
    CcLabel,
    CcSectionHeading,
    CcSegmentedControl,
    CcSelectTrigger,
    CcUploadZone,
} from "@/design/design-system/components";
import {
    ComponentPreview,
    DesignSection,
    TokenGroup,
    TokenSwatch,
} from "@/design/design-system/showcase/primitives";

const manrope = Manrope({
    subsets: ["latin"],
    weight: ["400", "600", "700", "800"],
    variable: "--font-manrope",
});

const inter = Inter({
    subsets: ["latin"],
    weight: ["400", "500", "600"],
    variable: "--font-inter",
});

const NAV_ITEMS = [
    { id: "colors", label: "Colors" },
    { id: "typography", label: "Typography" },
    { id: "spacing", label: "Spacing & Radius" },
    { id: "shadows", label: "Shadows" },
    { id: "buttons", label: "Buttons" },
    { id: "cards", label: "Cards" },
    { id: "forms", label: "Forms" },
    { id: "patterns", label: "Patterns" },
] as const;

export default function DesignSystemPage() {
    const [plan, setPlan] = useState<"pay" | "subscription">("subscription");

    const colorGroups = tokenGroups.filter((g) =>
        ["Brand", "Surface", "Text", "Border"].includes(g.name),
    );
    const radiusGroup = tokenGroups.find((g) => g.name === "Radius");
    const shadowGroup = tokenGroups.find((g) => g.name === "Shadow");
    const spacingGroup = tokenGroups.find((g) => g.name === "Spacing");

    return (
        <div
            className={cn(
                manrope.variable,
                inter.variable,
                "min-h-screen bg-cc-surface-page font-body text-cc-text-primary",
            )}
        >
            <header className="sticky top-0 z-50 border-b border-white/40 bg-cc-surface-page/80 shadow-sm backdrop-blur-xl">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-8">
                    <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-cc-brand-primary text-cc-text-on-brand">
                            <BookOpen className="size-5" />
                        </div>
                        <div>
                            <p className="font-headline text-lg font-bold tracking-tight">
                                ComicCurator Design System
                            </p>
                            <p className="text-xs text-cc-text-muted">/design</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <a
                            className="text-sm font-medium text-cc-text-secondary transition-colors hover:text-cc-brand-primary"
                            href="/design/wireframe"
                        >
                            Wireframes →
                        </a>
                        <CcBadge variant="accent">v1.0</CcBadge>
                    </div>
                </div>
            </header>

            <div className="mx-auto flex max-w-6xl gap-10 px-8 py-10">
                <nav className="sticky top-24 hidden h-fit w-44 shrink-0 flex-col gap-1 lg:flex">
                    {NAV_ITEMS.map((item) => (
                        <a
                            key={item.id}
                            className="rounded-lg px-3 py-2 text-sm font-medium text-cc-text-secondary transition-colors hover:bg-cc-surface-muted hover:text-cc-brand-primary"
                            href={`#${item.id}`}
                        >
                            {item.label}
                        </a>
                    ))}
                </nav>

                <main className="min-w-0 flex-1 space-y-16">
                    <div className="space-y-4">
                        <h1 className="font-headline text-4xl font-extrabold md:text-5xl">
                            Design Tokens & Components
                        </h1>
                        <p className="max-w-2xl text-lg text-cc-text-secondary">
                            Extracted from the ComicCurator app — homepage, translate workbench,
                            pricing, and auth flows. Use these tokens and components for consistent UI.
                        </p>
                    </div>

                    <DesignSection
                        description="Semantic color palette used across the app."
                        id="colors"
                        title="Colors"
                    >
                        {colorGroups.map((group) => (
                            <TokenGroup key={group.name} title={group.name}>
                                {group.tokens.map((token) => (
                                    <TokenSwatch
                                        key={token.name}
                                        cssVar={token.cssVar}
                                        name={token.name}
                                        type="color"
                                        value={token.value}
                                    />
                                ))}
                            </TokenGroup>
                        ))}
                    </DesignSection>

                    <DesignSection
                        description="Manrope for headlines, Inter for body copy."
                        id="typography"
                        title="Typography"
                    >
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="rounded-xl border border-cc-border/20 bg-cc-surface-white p-6">
                                <p className="mb-2 font-mono text-xs text-cc-brand-accent">
                                    font-headline · Manrope
                                </p>
                                <p className="font-headline text-4xl font-extrabold">
                                    Choose Your Plan
                                </p>
                                <p className="mt-4 font-headline text-xl font-bold">
                                    Quick Translation Preview
                                </p>
                            </div>
                            <div className="rounded-xl border border-cc-border/20 bg-cc-surface-white p-6">
                                <p className="mb-2 font-mono text-xs text-cc-brand-accent">
                                    font-body · Inter
                                </p>
                                <p className="text-lg text-cc-text-secondary">
                                    Unlock professional-grade translation tools tailored for your needs.
                                </p>
                                <p className="mt-4 text-sm text-cc-text-secondary">
                                    Start your journey from raw panels to translated masterpieces.
                                </p>
                            </div>
                        </div>
                        <TokenGroup title="Font Sizes">
                            {Object.entries(typography.fontSize).map(([key, value]) => (
                                <div
                                    key={key}
                                    className="flex flex-col gap-2 rounded-xl border border-cc-border/20 bg-cc-surface-white p-4"
                                >
                                    <p
                                        className="font-headline font-bold text-cc-text-primary"
                                        style={{ fontSize: value }}
                                    >
                                        Aa
                                    </p>
                                    <p className="font-mono text-xs text-cc-text-muted">
                                        fontSize.{key} · {value}
                                    </p>
                                </div>
                            ))}
                        </TokenGroup>
                    </DesignSection>

                    <DesignSection
                        description="Layout rhythm and corner radii from cards, workbench, and panels."
                        id="spacing"
                        title="Spacing & Radius"
                    >
                        {spacingGroup && (
                            <TokenGroup title="Spacing">
                                {spacingGroup.tokens.map((token) => (
                                    <TokenSwatch
                                        key={token.name}
                                        cssVar={token.cssVar}
                                        name={token.name}
                                        type="spacing"
                                        value={token.value}
                                    />
                                ))}
                            </TokenGroup>
                        )}
                        {radiusGroup && (
                            <TokenGroup title="Radius">
                                {radiusGroup.tokens.map((token) => (
                                    <TokenSwatch
                                        key={token.name}
                                        cssVar={token.cssVar}
                                        name={token.name}
                                        type="radius"
                                        value={token.value}
                                    />
                                ))}
                            </TokenGroup>
                        )}
                    </DesignSection>

                    <DesignSection
                        description="Elevation levels for cards, panels, and CTAs."
                        id="shadows"
                        title="Shadows"
                    >
                        {shadowGroup && (
                            <TokenGroup title="Shadow">
                                {shadowGroup.tokens.map((token) => (
                                    <TokenSwatch
                                        key={token.name}
                                        cssVar={token.cssVar}
                                        name={token.name}
                                        type="shadow"
                                        value={token.value}
                                    />
                                ))}
                            </TokenGroup>
                        )}
                    </DesignSection>

                    <DesignSection
                        description="Button variants matching header, task bar, pricing, and CTA styles."
                        id="buttons"
                        title="Buttons"
                    >
                        <div className="grid gap-6 md:grid-cols-2">
                            <ComponentPreview title="Primary & Accent">
                                <div className="flex flex-wrap gap-3">
                                    <CcButton variant="primary">
                                        <Phone className="size-4" />
                                        Start All
                                    </CcButton>
                                    <CcButton size="xl" variant="accent">
                                        <Star className="size-6" />
                                        Start Automatic Translation
                                    </CcButton>
                                </div>
                            </ComponentPreview>
                            <ComponentPreview title="Outline & Secondary">
                                <div className="flex flex-wrap gap-3">
                                    <CcButton variant="outline">Get Started</CcButton>
                                    <CcButton variant="secondary">
                                        <Download className="size-4" />
                                        Download All
                                    </CcButton>
                                </div>
                            </ComponentPreview>
                            <ComponentPreview title="Ghost & Link">
                                <div className="flex flex-wrap items-center gap-3">
                                    <CcButton variant="ghost">Login</CcButton>
                                    <CcButton variant="link">Contact our support team</CcButton>
                                </div>
                            </ComponentPreview>
                            <ComponentPreview title="Pill & Icon">
                                <div className="flex flex-wrap items-center gap-3">
                                    <CcButton size="lg" variant="pill">
                                        Join Discord
                                    </CcButton>
                                    <CcButton size="icon" variant="ghost" aria-label="Profile">
                                        <BookOpen className="size-5" />
                                    </CcButton>
                                </div>
                            </ComponentPreview>
                        </div>
                    </DesignSection>

                    <DesignSection
                        description="Surface containers for marketing, pricing, and workbench."
                        id="cards"
                        title="Cards & Badges"
                    >
                        <div className="grid gap-6 lg:grid-cols-2">
                            <CcCard variant="elevated">
                                <CcCardTitle className="text-3xl">Quick Translation Preview</CcCardTitle>
                                <CcCardDescription className="text-base">
                                    Start your journey from raw panels to translated masterpieces.
                                </CcCardDescription>
                            </CcCard>
                            <CcCard variant="outlined">
                                <CcCardTitle>Pro</CcCardTitle>
                                <p className="font-headline text-4xl font-extrabold">$19</p>
                                <CcCardDescription>500 credits / monthly</CcCardDescription>
                                <CcButton className="mt-4" variant="outline">
                                    Get Started
                                </CcButton>
                            </CcCard>
                        </div>
                        <ComponentPreview title="Badges">
                            <div className="flex flex-wrap gap-3">
                                <CcBadge variant="brand">New</CcBadge>
                                <CcBadge variant="accent">Processing</CcBadge>
                                <CcBadge variant="neutral">History</CcBadge>
                                <CcBadge variant="outline">Beta</CcBadge>
                            </div>
                        </ComponentPreview>
                    </DesignSection>

                    <DesignSection
                        description="Form controls from Quick Translate and settings panels."
                        id="forms"
                        title="Form Controls"
                    >
                        <div className="grid gap-6 lg:grid-cols-2">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <CcLabel>Source Language</CcLabel>
                                    <CcSelectTrigger>Japanese</CcSelectTrigger>
                                </div>
                                <div className="space-y-2">
                                    <CcLabel>Target Language</CcLabel>
                                    <CcSelectTrigger>English</CcSelectTrigger>
                                </div>
                            </div>
                            <CcUploadZone />
                        </div>
                    </DesignSection>

                    <DesignSection
                        description="Composite UI patterns from pricing and FAQ sections."
                        id="patterns"
                        title="Composite Patterns"
                    >
                        <CcSectionHeading
                            description="Unlock professional-grade translation tools tailored for your needs."
                            title="Choose Your Plan"
                        >
                            <div className="mt-8 flex justify-center">
                                <CcSegmentedControl
                                    onChange={setPlan}
                                    options={[
                                        { value: "pay", label: "Pay As Needed" },
                                        { value: "subscription", label: "Subscription" },
                                    ]}
                                    value={plan}
                                />
                            </div>
                        </CcSectionHeading>

                        <CcCard className="mt-8" variant="outlined">
                            <ul className="flex flex-col gap-4">
                                {[
                                    "Instant processing queue",
                                    "Enterprise API access",
                                    "Commercial usage license",
                                ].map((text) => (
                                    <li
                                        key={text}
                                        className="flex items-start gap-3 text-sm text-cc-text-secondary"
                                    >
                                        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-cc-brand-accent" />
                                        {text}
                                    </li>
                                ))}
                            </ul>
                        </CcCard>
                    </DesignSection>
                </main>
            </div>
        </div>
    );
}
