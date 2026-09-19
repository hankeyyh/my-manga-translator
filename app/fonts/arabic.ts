import { Noto_Sans_Arabic } from "next/font/google";

// preload: false — 避免英文首页把 160KB+ 阿拉伯字体重资源放进关键路径。
// 仅在 locale === "ar" 时把 variable 挂到 <html>，浏览器才会下载 woff2。
export const notoSansArabic = Noto_Sans_Arabic({
    variable: "--font-arabic",
    display: "swap",
    subsets: ["arabic"],
    preload: false,
});
