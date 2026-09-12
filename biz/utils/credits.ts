import { TranslationIntent } from "@/types/do/translation-intent";

export function estimateCreditPerImage(intent: TranslationIntent): number {
    if (intent.mode === "fast") {
        return 1;
    } else if (intent.mode === "quality") {
        return 3;
    }
    return 0;
}

export function estimateCreditCost(imageLength: number, intent: TranslationIntent): number {
    return estimateCreditPerImage(intent) * imageLength;
}