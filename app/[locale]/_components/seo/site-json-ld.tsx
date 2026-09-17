import { getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/json-ld";
import { buildOrganization, buildWebSite } from "@/biz/seo/json-ld";
import { schemaLanguages } from "@/biz/seo/site";

export async function SiteJsonLd() {
    const tCommon = await getTranslations("common");
    const tMeta = await getTranslations("meta");

    return (
        <JsonLd
            data={[
                buildOrganization(tCommon("brand")),
                buildWebSite(tCommon("brand"), tMeta("description"), schemaLanguages()),
            ]}
        />
    );
}
