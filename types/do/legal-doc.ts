export const LEGAL_SLUGS = [
    "about",
    "privacy",
    "terms",
    "refund",
    "dmca",
] as const;

export type LegalSlug = (typeof LEGAL_SLUGS)[number];

export function isLegalSlug(value: string): value is LegalSlug {
    return (LEGAL_SLUGS as readonly string[]).includes(value);
}

/** 法律/说明文档 */
export interface LegalDoc {
    id: string;
    slug: string;
    kind: string;
    title: string;
    content: string;
    status: string;
    effectiveAt: string | null;
    createdAt: string;
    updatedAt: string;
}
