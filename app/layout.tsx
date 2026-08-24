import type { Metadata } from "next";
import { Geist, Noto_Sans_Arabic } from "next/font/google";
import { getLocale, getTranslations } from "next-intl/server";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { NextIntlClientProvider } from "next-intl";
import { getLocaleDir } from "@/i18n/direction";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("meta");
    return {
        title: t("title"),
        description: t("description"),
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
