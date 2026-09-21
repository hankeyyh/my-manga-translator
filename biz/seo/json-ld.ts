import {
    BRAND_EMAIL,
    DISCORD_URL,
    getSiteUrl,
    organizationId,
    softwareId,
    toSchemaLanguage,
    websiteId,
} from "./site-url";

export type JsonLdNode = Record<string, unknown>;
export type JsonLdData = JsonLdNode | JsonLdNode[];

export type FaqItem = {
    question: string;
    answer: string;
};

export type HowToStepInput = {
    name: string;
    text: string;
    image?: string;
};

export type BreadcrumbItem = {
    name: string;
    url: string;
};

export function serializeJsonLd(data: JsonLdData): string {
    const payload = Array.isArray(data)
        ? { "@context": "https://schema.org", "@graph": data }
        : { "@context": "https://schema.org", ...data };
    return JSON.stringify(payload).replace(/</g, "\\u003c");
}

export function buildOrganization(name: string): JsonLdNode {
    return {
        "@type": "Organization",
        "@id": organizationId(),
        name,
        url: getSiteUrl(),
        email: BRAND_EMAIL,
        sameAs: [DISCORD_URL],
        contactPoint: {
            "@type": "ContactPoint",
            email: BRAND_EMAIL,
            contactType: "customer support",
        },
    };
}

export function buildWebSite(
    name: string,
    description: string,
    inLanguage: string[],
): JsonLdNode {
    return {
        "@type": "WebSite",
        "@id": websiteId(),
        name,
        url: getSiteUrl(),
        description,
        inLanguage,
        publisher: { "@id": organizationId() },
    };
}

export function buildSoftwareApplication(input: {
    name: string;
    description: string;
    url: string;
    inLanguage: string[];
    image?: string;
    featureList?: string[];
}): JsonLdNode {
    const node: JsonLdNode = {
        "@type": "WebApplication",
        "@id": softwareId(),
        name: input.name,
        description: input.description,
        url: input.url,
        applicationCategory: "MultimediaApplication",
        operatingSystem: "Web",
        isAccessibleForFree: true,
        inLanguage: input.inLanguage,
        offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
        },
        publisher: { "@id": organizationId() },
    };
    if (input.image) {
        node.image = input.image;
    }
    if (input.featureList && input.featureList.length > 0) {
        node.featureList = input.featureList;
    }
    return node;
}

export function buildFaqPage(input: { url: string; faqs: FaqItem[]; }): JsonLdNode | null {
    if (input.faqs.length === 0) return null;
    return {
        "@type": "FAQPage",
        "@id": `${input.url}#faq`,
        url: `${input.url}#faq`,
        mainEntity: input.faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
            },
        })),
        isPartOf: { "@id": websiteId() },
    };
}

export function buildHowTo(input: {
    name: string;
    url: string;
    steps: HowToStepInput[];
}): JsonLdNode | null {
    if (input.steps.length === 0) return null;
    return {
        "@type": "HowTo",
        "@id": `${input.url}#how`,
        name: input.name,
        url: `${input.url}#how`,
        step: input.steps.map((step, index) => {
            const node: JsonLdNode = {
                "@type": "HowToStep",
                position: index + 1,
                name: step.name,
                text: step.text,
            };
            if (step.image) {
                node.image = step.image;
            }
            return node;
        }),
        isPartOf: { "@id": websiteId() },
    };
}

export function buildCollectionPage(input: {
    name: string;
    url: string;
    description?: string;
}): JsonLdNode {
    const node: JsonLdNode = {
        "@type": "CollectionPage",
        name: input.name,
        url: input.url,
        isPartOf: { "@id": websiteId() },
    };
    if (input.description) {
        node.description = input.description;
    }
    return node;
}

export function buildBlogPosting(input: {
    headline: string;
    url: string;
    locale: string;
    description?: string;
    image?: string;
    datePublished?: string;
    author?: string | null;
}): JsonLdNode {
    const node: JsonLdNode = {
        "@type": "BlogPosting",
        headline: input.headline,
        url: input.url,
        mainEntityOfPage: input.url,
        inLanguage: toSchemaLanguage(input.locale),
        publisher: { "@id": organizationId() },
        isPartOf: { "@id": websiteId() },
    };
    if (input.description) {
        node.description = input.description;
    }
    if (input.image) {
        node.image = input.image;
    }
    if (input.datePublished) {
        node.datePublished = input.datePublished;
    }
    if (input.author) {
        node.author = { "@type": "Person", name: input.author };
    } else {
        node.author = { "@id": organizationId() };
    }
    return node;
}

export function buildWebPage(input: {
    type?: "WebPage" | "AboutPage";
    name: string;
    url: string;
    locale: string;
    description?: string;
}): JsonLdNode {
    const node: JsonLdNode = {
        "@type": input.type ?? "WebPage",
        name: input.name,
        url: input.url,
        inLanguage: toSchemaLanguage(input.locale),
        isPartOf: { "@id": websiteId() },
    };
    if (input.description) {
        node.description = input.description;
    }
    return node;
}

export type OfferInput = {
    name: string;
    description?: string;
    price: number | string;
    priceCurrency?: string;
    url: string;
    billingCycle?: "monthly" | "yearly" | null;
};

export function buildOfferCatalog(input: {
    name: string;
    url: string;
    description?: string;
    offers: OfferInput[];
}): JsonLdNode | null {
    if (input.offers.length === 0) return null;
    const node: JsonLdNode = {
        "@type": "OfferCatalog",
        "@id": `${input.url}#offers`,
        name: input.name,
        url: input.url,
        itemListElement: input.offers.map((offer, index) => {
            const item: JsonLdNode = {
                "@type": "Offer",
                position: index + 1,
                name: offer.name,
                url: offer.url,
                price: String(offer.price),
                priceCurrency: offer.priceCurrency ?? "USD",
                availability: "https://schema.org/InStock",
                itemOffered: {
                    "@type": "Service",
                    name: offer.name,
                    ...(offer.description ? { description: offer.description } : {}),
                },
            };
            if (offer.description) {
                item.description = offer.description;
            }
            if (offer.billingCycle === "monthly") {
                item.eligibleDuration = {
                    "@type": "QuantitativeValue",
                    value: 1,
                    unitCode: "MON",
                };
            } else if (offer.billingCycle === "yearly") {
                item.eligibleDuration = {
                    "@type": "QuantitativeValue",
                    value: 1,
                    unitCode: "ANN",
                };
            }
            return item;
        }),
        isPartOf: { "@id": websiteId() },
    };
    if (input.description) {
        node.description = input.description;
    }
    return node;
}

export function buildBreadcrumbList(items: BreadcrumbItem[]): JsonLdNode | null {
    if (items.length === 0) return null;
    return {
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };
}

export function compactJsonLd(nodes: Array<JsonLdNode | null | undefined>): JsonLdNode[] {
    return nodes.filter((node): node is JsonLdNode => node != null);
}
