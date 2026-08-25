import localFont from "next/font/local";
import type { FontName } from "@/types/do/translation-config";

const animeAce = localFont({
    src: "./anime_ace.woff2",
    variable: "--font-preview-anime-ace",
    display: "swap",
    preload: false,
});

const animeAce3 = localFont({
    src: "./anime_ace_3.woff2",
    variable: "--font-preview-anime-ace-3",
    display: "swap",
    preload: false,
});

const arialUnicode = localFont({
    src: "./Arial-Unicode-Regular-preview.woff2",
    variable: "--font-preview-arial-unicode",
    display: "swap",
    preload: false,
});

const comicShanns = localFont({
    src: "./comic-shanns-2.woff2",
    variable: "--font-preview-comic-shanns",
    display: "swap",
    preload: false,
});

export const PREVIEW_FONT_VARIABLE_CLASS = [
    animeAce.variable,
    animeAce3.variable,
    arialUnicode.variable,
    comicShanns.variable,
].join(" ");

export const PREVIEW_FONT_FAMILY: Record<FontName, string> = {
    "Anime Ace": "var(--font-preview-anime-ace), sans-serif",
    "Anime Ace 3.0": "var(--font-preview-anime-ace-3), sans-serif",
    "Arial Unicode Regular": "var(--font-preview-arial-unicode), sans-serif",
    "Comic Shanns 2": "var(--font-preview-comic-shanns), sans-serif",
};

export const FONT_PREVIEW_SAMPLE = "MANGA";
