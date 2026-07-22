import type { Config } from "tailwindcss";

export default {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./design/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                chart: {
                    "1": "hsl(var(--chart-1))",
                    "2": "hsl(var(--chart-2))",
                    "3": "hsl(var(--chart-3))",
                    "4": "hsl(var(--chart-4))",
                    "5": "hsl(var(--chart-5))",
                },
                cc: {
                    brand: {
                        primary: "var(--cc-brand-primary)",
                        "primary-hover": "var(--cc-brand-primary-hover)",
                        accent: "var(--cc-brand-accent)",
                        "accent-secondary": "var(--cc-brand-accent-secondary)",
                    },
                    surface: {
                        page: "var(--cc-surface-page)",
                        muted: "var(--cc-surface-muted)",
                        subtle: "var(--cc-surface-subtle)",
                        panel: "var(--cc-surface-panel)",
                        "panel-dark": "var(--cc-surface-panel-dark)",
                        white: "var(--cc-surface-white)",
                        avatar: "var(--cc-surface-avatar)",
                    },
                    text: {
                        primary: "var(--cc-text-primary)",
                        secondary: "var(--cc-text-secondary)",
                        muted: "var(--cc-text-muted)",
                        "tool-rail": "var(--cc-text-tool-rail)",
                        "on-brand": "var(--cc-text-on-brand)",
                    },
                    border: {
                        DEFAULT: "var(--cc-border-default)",
                        light: "var(--cc-border-light)",
                        subtle: "var(--cc-border-subtle)",
                    },
                },
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
                "cc-2xl": "var(--cc-radius-2xl)",
                "cc-3xl": "var(--cc-radius-3xl)",
                "cc-pill": "var(--cc-radius-pill)",
            },
            fontFamily: {
                headline: ["var(--font-manrope)", "system-ui", "sans-serif"],
                body: ["var(--font-inter)", "system-ui", "sans-serif"],
            },
            boxShadow: {
                "cc-card": "var(--cc-shadow-card)",
                "cc-panel": "var(--cc-shadow-panel)",
                "cc-accent": "var(--cc-shadow-accent)",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
} satisfies Config;
