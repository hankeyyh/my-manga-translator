import { readFile } from "node:fs/promises";
import path from "node:path";

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

export async function getLegalDocument(slug: LegalSlug) {
    const filePath = path.join(process.cwd(), "content/legal", `${slug}.md`);
    const content = await readFile(filePath, "utf8");
    const title = content.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? slug;

    return { slug, title, content };
}
