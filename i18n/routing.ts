import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
    locales: ["en", "zh-cn", "zh-tw"],
    defaultLocale: "en",
    localePrefix: "as-needed",
});

export type AppLocale = (typeof routing.locales)[number];
