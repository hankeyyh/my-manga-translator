const RTL_LOCALES = new Set<string>(["ar"]);

export function getLocaleDir(locale: string): "rtl" | "ltr" {
    return RTL_LOCALES.has(locale) ? "rtl" : "ltr";
}
