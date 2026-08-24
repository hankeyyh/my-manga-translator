"use client";

import { useState } from "react";
import { Manrope, Inter } from "next/font/google";
import { BookOpen, CheckCircle2, Download, Phone, Star } from "lucide-react";

import { cn } from "@/components/utils";
import { tokenGroups, typography } from "@/design/design-system/tokens";
import {
    CcAccordion,
    CcAlert,
    CcBadge,
    CcButton,
    CcCard,
    CcCardDescription,
    CcCardTitle,
    CcCheckbox,
    CcDialog,
    CcInput,
    CcLabel,
    CcSectionHeading,
    CcSegmentedControl,
    CcSelectTrigger,
    CcSwitch,
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
    { id: "feedback", label: "Feedback" },
    { id: "patterns", label: "Patterns" },
] as const;

export default function DesignSystemPage() {
    const [plan, setPlan] = useState<"pay" | "subscription">("subscription");
    const [autoDetect, setAutoDetect] = useState(true);
    const [agree, setAgree] = useState(true);

    const colorGroups = tokenGroups.filter((g) =>
        ["Brand", "Surface", "Text", "Border", "Status"].includes(g.name),
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
            <header className="sticky top-0 z-50 border-b border-cc-border/60 bg-cc-surface-white/90 shadow-[var(--cc-shadow-header)] backdrop-blur-xl">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-8">
                    <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-cc-brand-primary text-cc-text-on-brand">
                            <BookOpen className="size-5" />
                        </div>
                        <div>
                            <p className="font-headline text-lg font-bold tracking-tight">
                                ComicCurator Design System
                            </p>
                            <p className="text-xs text-cc-text-muted">蓝白主题 · /design</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <a
                            className="text-sm font-medium text-cc-text-secondary transition-colors hover:text-cc-brand-primary"
                            href="/design/wireframe"
                        >
                            Wireframes →
                        </a>
                        <CcBadge variant="accent">v1.1</CcBadge>
                    </div>
                </div>
            </header>

            <div className="mx-auto flex max-w-6xl gap-10 px-8 py-10">
                <nav className="sticky top-24 hidden h-fit w-44 shrink-0 flex-col gap-1 lg:flex">
                    {NAV_ITEMS.map((item) => (
                        <a
                            key={item.id}
                            className="rounded-lg px-3 py-2 text-sm font-medium text-cc-text-secondary transition-colors hover:bg-[var(--cc-brand-tint)] hover:text-cc-brand-primary"
                            href={`#${item.id}`}
                        >
                            {item.label}
                        </a>
                    ))}
                </nav>

                <main className="min-w-0 flex-1 space-y-16">
                    <div className="space-y-4">
                        <p className="text-sm font-semibold text-cc-brand-primary">
                            Blue / White
                        </p>
                        <h1 className="font-headline text-4xl font-extrabold md:text-5xl">
                            Design Tokens & Components
                        </h1>
                        <p className="max-w-2xl text-lg text-cc-text-secondary">
                            从首页、翻译工作台、定价、登录与账单流程提取。主体为品牌蓝 + 冰白底，
                            中性色带蓝调，用于保持 UI 一致。
                        </p>
                    </div>

                    <DesignSection
                        description="品牌蓝、冰白表面、冷色文字与状态色。"
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
                            <div className="rounded-xl border border-cc-border/40 bg-cc-surface-white p-6">
                                <p className="mb-2 font-mono text-xs text-cc-brand-primary">
                                    font-headline · Manrope
                                </p>
                                <p className="font-headline text-4xl font-extrabold">
                                    Choose Your Plan
                                </p>
                                <p className="mt-4 font-headline text-xl font-bold">
                                    Quick Translation Preview
                                </p>
                            </div>
                            <div className="rounded-xl border border-cc-border/40 bg-cc-surface-white p-6">
                                <p className="mb-2 font-mono text-xs text-cc-brand-primary">
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
                                    className="flex flex-col gap-2 rounded-xl border border-cc-border/40 bg-cc-surface-white p-4"
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
                        description="Elevation with a light blue tint instead of neutral gray."
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
                        description="Header、CTA、定价、取消订阅等场景。"
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
                                    <CcButton variant="soft">Credits · 120</CcButton>
                                </div>
                            </ComponentPreview>
                            <ComponentPreview title="Ghost, Link & Destructive">
                                <div className="flex flex-wrap items-center gap-3">
                                    <CcButton variant="ghost">Login</CcButton>
                                    <CcButton variant="link">Contact our support team</CcButton>
                                    <CcButton variant="destructive">取消订阅</CcButton>
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
                        description="营销卡片、定价 featured、工作台面板。"
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
                            <CcCard variant="featured">
                                <div className="mb-2 flex items-center gap-2">
                                    <CcCardTitle>Pro</CcCardTitle>
                                    <CcBadge>★</CcBadge>
                                </div>
                                <p className="font-headline text-4xl font-extrabold">$19</p>
                                <CcCardDescription>500 credits / monthly</CcCardDescription>
                                <CcButton className="mt-4" variant="primary">
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
                                <CcBadge variant="success">completed</CcBadge>
                                <CcBadge variant="warning">pending</CcBadge>
                                <CcBadge variant="error">failed</CcBadge>
                            </div>
                        </ComponentPreview>
                    </DesignSection>

                    <DesignSection
                        description="登录、翻译工作台：Input、Select、Switch、Checkbox、Upload。"
                        id="forms"
                        title="Form Controls"
                    >
                        <div className="grid gap-6 lg:grid-cols-2">
                            <div className="space-y-4 rounded-xl border border-cc-border/40 bg-cc-surface-white p-6">
                                <div className="space-y-2">
                                    <CcLabel htmlFor="ds-email">邮箱</CcLabel>
                                    <CcInput
                                        id="ds-email"
                                        placeholder="you@example.com"
                                        type="email"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <CcLabel htmlFor="ds-password">密码</CcLabel>
                                    <CcInput
                                        id="ds-password"
                                        placeholder="密码"
                                        type="password"
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <CcLabel>自动识别语言</CcLabel>
                                    <CcSwitch
                                        aria-label="自动识别语言"
                                        checked={autoDetect}
                                        onCheckedChange={setAutoDetect}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <CcCheckbox
                                        aria-label="同意条款"
                                        checked={agree}
                                        onCheckedChange={setAgree}
                                    />
                                    <CcLabel>同意服务条款</CcLabel>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <CcLabel uppercase>Source Language</CcLabel>
                                    <CcSelectTrigger>Japanese</CcSelectTrigger>
                                </div>
                                <div className="space-y-2">
                                    <CcLabel uppercase>Target Language</CcLabel>
                                    <CcSelectTrigger>English</CcSelectTrigger>
                                </div>
                                <CcUploadZone className="min-h-[180px]" />
                            </div>
                        </div>
                    </DesignSection>

                    <DesignSection
                        description="表单错误、账单确认 Dialog、FAQ 手风琴。"
                        id="feedback"
                        title="Feedback"
                    >
                        <div className="grid gap-6 lg:grid-cols-2">
                            <ComponentPreview title="Alerts">
                                <div className="space-y-3">
                                    <CcAlert variant="info">翻译任务已加入队列，通常数秒完成。</CcAlert>
                                    <CcAlert variant="success">支付成功，积分已到账。</CcAlert>
                                    <CcAlert variant="warning">订阅将于周期结束时失效。</CcAlert>
                                    <CcAlert variant="error">邮箱或密码不正确，请重试。</CcAlert>
                                </div>
                            </ComponentPreview>
                            <ComponentPreview title="Dialog">
                                <CcDialog
                                    description="将从 Pro 调整为 Standard，下一账单周期生效。"
                                    title="确认调整方案"
                                />
                            </ComponentPreview>
                        </div>
                        <ComponentPreview title="FAQ Accordion">
                            <CcAccordion
                                items={[
                                    {
                                        question: "可以翻译日漫吗？",
                                        answer: "可以。支持日语漫画自动识别与翻译，保留气泡排版与画风。",
                                    },
                                    {
                                        question: "翻译需要多久？",
                                        answer: "单页通常数秒到数十秒，具体取决于图片尺寸与队列负载。",
                                    },
                                    {
                                        question: "数据安全吗？",
                                        answer: "上传内容仅用于翻译处理，不会用于公开训练或对外分享。",
                                    },
                                ]}
                            />
                        </ComponentPreview>
                    </DesignSection>

                    <DesignSection
                        description="定价分区标题 + 订阅切换。"
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
                                        { value: "pay", label: "Pay Per Use" },
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
                                        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-cc-brand-primary" />
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
