import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { getLocale, getTranslations } from "next-intl/server";
import { Toaster } from "@/components/ui/sonner";
import { notoSansArabic } from "@/app/fonts/arabic";
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

const inter = Inter({
    variable: "--font-inter",
    display: "swap",
    subsets: ["latin"],
    weight: ["400", "500", "600"],
});

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const locale = await getLocale();
    const dir = getLocaleDir(locale);

    /**
     * 当前字体分工：
     * 拉丁                   Inter + Manrope
     * 西里尔（俄） 		    Inter 只配了 latin，缺字会回退 system-ui
     * CJK（简中/繁中/日/韩） 	同样回退系统字体（苹方、Noto CJK 等）
     * 泰语 				  系统回退
     * 阿拉伯语 			   显式加载 Noto Sans Arabic
     */
    return (
        <html
            lang={locale}
            dir={dir}
            className={locale === "ar" ? notoSansArabic.variable : undefined}
            suppressHydrationWarning
        >
            <head>
                <link rel="describedby" href={`${getSiteUrl()}/llms.txt`} />
            </head>
            <body className={`${inter.variable} ${inter.className} antialiased`}>
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
