import type { Metadata } from "next";
import { Geist, Noto_Sans_Arabic } from "next/font/google";
import { getLocale, getTranslations } from "next-intl/server";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { NextIntlClientProvider } from "next-intl";
import { getLocaleDir } from "@/i18n/direction";
import { getSiteUrl } from "@/biz/seo/site-url";
import { buildPageMetadata } from "@/biz/seo/site";

export async function generateMetadata(): Promise<Metadata> {
    const locale = await getLocale();
    const t = await getTranslations("meta");
    return {
        metadataBase: new URL(getSiteUrl()),
        ...buildPageMetadata({
            locale,
            href: "/",
            title: t("title"),
            description: t("description"),
        }),
    };
}

const geistSans = Geist({
    variable: "--font-geist-sans",
    display: "swap",
    subsets: ["latin"],
});

const notoSansArabic = Noto_Sans_Arabic({
    variable: "--font-arabic",
    display: "swap",
    subsets: ["arabic"],
});

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const locale = await getLocale();
    const dir = getLocaleDir(locale);

    return (
        <html lang={locale} dir={dir} className={notoSansArabic.variable} suppressHydrationWarning>
            <head>
                <link rel="describedby" href={`${getSiteUrl()}/llms.txt`} />
            </head>
            <body className={`${geistSans.className} antialiased`}>
                <NextIntlClientProvider>
                    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                        {children}
                        <Toaster position="top-center" />
                    </ThemeProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
