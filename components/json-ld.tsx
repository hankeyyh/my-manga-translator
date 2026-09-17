import { serializeJsonLd, type JsonLdData } from "@/biz/seo/json-ld";

export function JsonLd({ data }: { data: JsonLdData; }) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
        />
    );
}
