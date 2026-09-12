import type { Json } from "@/types/database";
import {
    SUPPORTED_MODES,
    type TranslationIntent,
    type TranslationMode,
} from "@/types/do/translation-intent";

export function toTranslationIntentJson(intent: TranslationIntent): Json {
    const json: { [key: string]: Json | undefined } = {
        targetLang: intent.targetLang,
        mode: intent.mode,
        fontName: intent.fontName,
    };
    if (intent.rtl !== undefined) {
        json.rtl = intent.rtl;
    }
    if (intent.hyphenation !== undefined) {
        json.hyphenation = intent.hyphenation;
    }
    return json;
}

export function parseTranslationIntent(input: unknown): TranslationIntent {
    if (input == null || typeof input !== "object" || Array.isArray(input)) {
        throw new Error("translation intent must be an object");
    }
    const record = input as Record<string, unknown>;
    if (hasIntentShape(record)) {
        return readIntent(record);
    }
    if (hasLegacyConfigShape(record)) {
        return readLegacyConfig(record);
    }
    throw new Error("translation intent invalid");
}

function hasIntentShape(record: Record<string, unknown>): boolean {
    return typeof record.targetLang === "string"
        && typeof record.mode === "string"
        && typeof record.fontName === "string";
}

function readIntent(record: Record<string, unknown>): TranslationIntent {
    const targetLang = asNonEmptyString(record.targetLang, "targetLang");
    const mode = asTranslationMode(record.mode);
    const fontName = asNonEmptyString(record.fontName, "fontName");
    const intent: TranslationIntent = { targetLang, mode, fontName };
    if (record.rtl !== undefined) {
        intent.rtl = asBoolean(record.rtl, "rtl");
    }
    if (record.hyphenation !== undefined) {
        intent.hyphenation = asBoolean(record.hyphenation, "hyphenation");
    }
    return intent;
}

function hasLegacyConfigShape(record: Record<string, unknown>): boolean {
    const translator = asRecord(record.translator);
    const render = asRecord(record.render);
    return typeof translator?.target_lang === "string"
        && typeof render?.font_name === "string";
}

function readLegacyConfig(record: Record<string, unknown>): TranslationIntent {
    const translator = asRecord(record.translator);
    const render = asRecord(record.render);
    const intent: TranslationIntent = {
        targetLang: asNonEmptyString(translator?.target_lang, "translator.target_lang"),
        mode: legacyMode(translator),
        fontName: asNonEmptyString(render?.font_name, "render.font_name"),
    };
    if (render?.rtl !== undefined) {
        intent.rtl = asBoolean(render.rtl, "render.rtl");
    }
    if (render?.no_hyphenation !== undefined) {
        intent.hyphenation = !asBoolean(render.no_hyphenation, "render.no_hyphenation");
    }
    return intent;
}

function legacyMode(translator: Record<string, unknown> | undefined): TranslationMode {
    const modelName = typeof translator?.model_name === "string" ? translator.model_name : "";
    const translatorName = typeof translator?.translator === "string" ? translator.translator : "";
    if (modelName === "deepl" || translatorName === "deepl") {
        return "quality";
    }
    return "fast";
}

function asTranslationMode(value: unknown): TranslationMode {
    if (typeof value === "string" && (SUPPORTED_MODES as readonly string[]).includes(value)) {
        return value as TranslationMode;
    }
    throw new Error(`translation intent mode invalid: ${String(value)}`);
}

function asNonEmptyString(value: unknown, field: string): string {
    if (typeof value !== "string" || value.trim() === "") {
        throw new Error(`translation intent ${field} invalid`);
    }
    return value;
}

function asBoolean(value: unknown, field: string): boolean {
    if (typeof value !== "boolean") {
        throw new Error(`translation intent ${field} invalid`);
    }
    return value;
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
    if (value == null || typeof value !== "object" || Array.isArray(value)) {
        return undefined;
    }
    return value as Record<string, unknown>;
}
