import { getLocale, getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/json-ld";
import {
    buildFaqPage,
    buildHowTo,
    buildSoftwareApplication,
    compactJsonLd,
} from "@/biz/seo/json-ld";
import { absoluteUrl, asAppLocale, schemaLanguages } from "@/biz/seo/site";
import { HERO_IMAGE_PATH, absoluteAssetUrl } from "@/biz/seo/site-url";
import { FAQ_KEYS } from "../faq-keys";
import { HOW_STEPS } from "../how-steps";

export async function HomeJsonLd() {
    const appLocale = asAppLocale(await getLocale());
    const homeUrl = absoluteUrl(appLocale, "/");
    const tMeta = await getTranslations("meta");
    const tCommon = await getTranslations("common");
    const tFaq = await getTranslations("faq");
    const tHow = await getTranslations("how");

    const faqs = FAQ_KEYS.map((key) => ({
        question: tFaq(`items.${key}.question`),
        answer: tFaq(`items.${key}.answer`),
    }));
    const steps = HOW_STEPS.map((step) => ({
        name: tHow(`steps.${step.key}.title`),
        text: tHow(`steps.${step.key}.desc`),
        image: absoluteAssetUrl(step.coverSrc),
    }));

    return (
        <JsonLd
            data={compactJsonLd([
                buildSoftwareApplication({
                    name: tCommon("brand"),
                    description: tMeta("description"),
                    url: homeUrl,
                    inLanguage: schemaLanguages(),
                    image: absoluteAssetUrl(HERO_IMAGE_PATH),
                    featureList: steps.map((step) => step.name),
                }),
                buildFaqPage({ url: homeUrl, faqs }),
                buildHowTo({
                    name: tHow("title"),
                    url: homeUrl,
                    steps,
                }),
            ])}
        />
    );
}
