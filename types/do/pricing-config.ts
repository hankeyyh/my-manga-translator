import type { Translator } from "./translation-config";

export interface PricingConfig {
    id: string;
    translator: Translator;
    modelName: string;
    creditPerImage: number;
}