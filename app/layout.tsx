import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { getLocale } from "next-intl/server";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { NextIntlClientProvider } from "next-intl";

export const metadata: Metadata = {
    title: "Manga Translation",
    description: "Ai Powered Manga Translation",
};

const geistSans = Geist({
    variable: "--font-geist-sans",
    display: "swap",
    subsets: ["latin"],
});

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const locale = await getLocale();

    return (
        <html lang={locale} suppressHydrationWarning>
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
