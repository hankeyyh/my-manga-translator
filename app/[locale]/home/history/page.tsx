import { getUserTranslationHistory } from "@/actions/get-user-translation-history";
import { TranslationHistory } from "@/app/[locale]/home/history/_components/translation-history";

export default async function HistoryPage() {
    const result = await getUserTranslationHistory();
    const page = result.data ?? { tasks: [], nextCursor: null };

    return (
        <>
            <div>
                <h1 className="font-headline text-xl font-bold text-cc-text-primary">翻译历史</h1>
            </div>
            <TranslationHistory initialPage={page} />
        </>
    );
}
