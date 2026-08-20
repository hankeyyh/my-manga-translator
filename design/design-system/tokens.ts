/**
 * ComicCurator Design System — blue-white theme for Manga Sense.
 * Single source of truth for colors, typography, spacing, radii, and shadows.
 */

export const colors = {
    brand: {
        primary: "#0053dd",
        primaryHover: "#0046b8",
        accent: "#3370FF",
        accentSecondary: "#1d5ef5",
        tint: "#e8f0fe",
        tintStrong: "#d4e4fc",
    },
    surface: {
        page: "#f5f8ff",
        muted: "#eef4ff",
        subtle: "#e4edfb",
        panel: "#dce8f8",
        panelDark: "#d0dff2",
        white: "#ffffff",
        avatar: "#d6e4f5",
    },
    text: {
        primary: "#1a2744",
        secondary: "#4a5b78",
        muted: "#6b7c96",
        toolRail: "#5a6d88",
        onBrand: "#ffffff",
    },
    border: {
        default: "#d4e0f0",
        light: "#e2ebf6",
        subtle: "#b4c6dc",
        frost: "rgba(255, 255, 255, 0.7)",
        divider: "rgba(180, 198, 220, 0.45)",
        card: "rgba(180, 198, 220, 0.35)",
        upload: "rgba(0, 83, 221, 0.28)",
    },
    status: {
        error: "#dc2626",
        errorBg: "#fef2f2",
        success: "#15803d",
        successBg: "#dcfce7",
        warning: "#b45309",
        warningBg: "#fef3c7",
        info: "#0053dd",
        infoBg: "#e8f0fe",
    },
} as const;

export const typography = {
    fontFamily: {
        headline: "var(--font-manrope), system-ui, sans-serif",
        body: "var(--font-inter), system-ui, sans-serif",
    },
    fontSize: {
        xs: "0.625rem", // 10px — labels, meta
        sm: "0.75rem", // 12px — task bar, badges
        base: "0.875rem", // 14px — body default
        md: "1rem", // 16px
        lg: "1.125rem", // 18px — FAQ questions
        xl: "1.25rem", // 20px — card titles
        "2xl": "1.5rem", // 24px — section subheads
        "3xl": "1.875rem", // 30px — card hero
        "4xl": "2.25rem", // 36px — page headings
        "5xl": "3rem", // 48px — hero headings
    },
    fontWeight: {
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
        extrabold: "800",
    },
    letterSpacing: {
        tight: "-0.025em",
        wide: "0.05em",
        widest: "0.1em",
    },
    lineHeight: {
        tight: "1.25",
        normal: "1.5",
        relaxed: "1.625",
    },
} as const;

export const spacing = {
    0: "0",
    1: "0.25rem",
    2: "0.5rem",
    3: "0.75rem",
    4: "1rem",
    5: "1.25rem",
    6: "1.5rem",
    8: "2rem",
    10: "2.5rem",
    12: "3rem",
    16: "4rem",
    20: "5rem",
    24: "6rem",
    32: "8rem",
    page: "2rem", // px-8
    section: "6rem", // py-24
    sectionLg: "8rem", // py-32
    container: "1440px",
    containerLg: "1920px",
} as const;

export const radii = {
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    "2xl": "1.5rem",
    "3xl": "2rem",
    pill: "9999px",
    toolRail: "1.75rem",
} as const;

export const shadows = {
    sm: "0 1px 2px 0 rgba(0, 83, 221, 0.06)",
    card: "0px 8px 24px rgba(0, 83, 221, 0.08)",
    panel: "0 4px 20px rgba(0, 83, 221, 0.1)",
    accent: "0 10px 15px -3px rgba(51, 112, 255, 0.28)",
    header: "0 1px 2px 0 rgba(0, 83, 221, 0.06)",
} as const;

export const motion = {
    duration: {
        fast: "150ms",
        normal: "200ms",
        slow: "300ms",
    },
    easing: {
        default: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
} as const;

/** Flat token list for the design showcase page */
export const tokenGroups = [
    {
        name: "Brand",
        tokens: [
            { name: "brand.primary", value: colors.brand.primary, cssVar: "--cc-brand-primary" },
            { name: "brand.primaryHover", value: colors.brand.primaryHover, cssVar: "--cc-brand-primary-hover" },
            { name: "brand.accent", value: colors.brand.accent, cssVar: "--cc-brand-accent" },
            { name: "brand.accentSecondary", value: colors.brand.accentSecondary, cssVar: "--cc-brand-accent-secondary" },
            { name: "brand.tint", value: colors.brand.tint, cssVar: "--cc-brand-tint" },
            { name: "brand.tintStrong", value: colors.brand.tintStrong, cssVar: "--cc-brand-tint-strong" },
        ],
    },
    {
        name: "Surface",
        tokens: [
            { name: "surface.page", value: colors.surface.page, cssVar: "--cc-surface-page" },
            { name: "surface.muted", value: colors.surface.muted, cssVar: "--cc-surface-muted" },
            { name: "surface.subtle", value: colors.surface.subtle, cssVar: "--cc-surface-subtle" },
            { name: "surface.panel", value: colors.surface.panel, cssVar: "--cc-surface-panel" },
            { name: "surface.panelDark", value: colors.surface.panelDark, cssVar: "--cc-surface-panel-dark" },
            { name: "surface.white", value: colors.surface.white, cssVar: "--cc-surface-white" },
            { name: "surface.avatar", value: colors.surface.avatar, cssVar: "--cc-surface-avatar" },
        ],
    },
    {
        name: "Text",
        tokens: [
            { name: "text.primary", value: colors.text.primary, cssVar: "--cc-text-primary" },
            { name: "text.secondary", value: colors.text.secondary, cssVar: "--cc-text-secondary" },
            { name: "text.muted", value: colors.text.muted, cssVar: "--cc-text-muted" },
            { name: "text.toolRail", value: colors.text.toolRail, cssVar: "--cc-text-tool-rail" },
            { name: "text.onBrand", value: colors.text.onBrand, cssVar: "--cc-text-on-brand" },
        ],
    },
    {
        name: "Border",
        tokens: [
            { name: "border.default", value: colors.border.default, cssVar: "--cc-border-default" },
            { name: "border.light", value: colors.border.light, cssVar: "--cc-border-light" },
            { name: "border.subtle", value: colors.border.subtle, cssVar: "--cc-border-subtle" },
        ],
    },
    {
        name: "Status",
        tokens: [
            { name: "status.error", value: colors.status.error, cssVar: "--cc-status-error" },
            { name: "status.errorBg", value: colors.status.errorBg, cssVar: "--cc-status-error-bg" },
            { name: "status.success", value: colors.status.success, cssVar: "--cc-status-success" },
            { name: "status.successBg", value: colors.status.successBg, cssVar: "--cc-status-success-bg" },
            { name: "status.warning", value: colors.status.warning, cssVar: "--cc-status-warning" },
            { name: "status.warningBg", value: colors.status.warningBg, cssVar: "--cc-status-warning-bg" },
            { name: "status.info", value: colors.status.info, cssVar: "--cc-status-info" },
            { name: "status.infoBg", value: colors.status.infoBg, cssVar: "--cc-status-info-bg" },
        ],
    },
    {
        name: "Radius",
        tokens: Object.entries(radii).map(([key, value]) => ({
            name: `radius.${key}`,
            value,
            cssVar: `--cc-radius-${key}`,
        })),
    },
    {
        name: "Shadow",
        tokens: Object.entries(shadows).map(([key, value]) => ({
            name: `shadow.${key}`,
            value,
            cssVar: `--cc-shadow-${key}`,
        })),
    },
    {
        name: "Spacing",
        tokens: Object.entries(spacing).map(([key, value]) => ({
            name: `spacing.${key}`,
            value,
            cssVar: `--cc-spacing-${key}`,
        })),
    },
    {
        name: "Typography",
        tokens: [
            ...Object.entries(typography.fontSize).map(([key, value]) => ({
                name: `fontSize.${key}`,
                value,
                cssVar: `--cc-font-size-${key}`,
            })),
            ...Object.entries(typography.fontWeight).map(([key, value]) => ({
                name: `fontWeight.${key}`,
                value,
                cssVar: `--cc-font-weight-${key}`,
            })),
        ],
    },
] as const;

export type CcColor = keyof typeof colors;
export type CcRadius = keyof typeof radii;
export type CcShadow = keyof typeof shadows;
