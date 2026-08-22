import { getUserTranslationHistory } from "@/actions/get-user-translation-history";
import { TranslationHistory } from "@/app/[locale]/home/history/_components/translation-history";
import { getTranslations } from "next-intl/server";

export default async function HistoryPage() {
    const t = await getTranslations("history");
    const result = await getUserTranslationHistory();
    const page = result.data ?? { tasks: [], nextCursor: null };

    return (
        <>
            <div>
                <h1 className="font-headline text-xl font-bold text-cc-text-primary">{t("title")}</h1>
            </div>
            <TranslationHistory initialPage={page} />
        </>
    );
}
