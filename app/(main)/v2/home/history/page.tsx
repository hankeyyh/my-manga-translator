import { TranslationHistory } from "@/components/v2/home/translation-history";

export default function HistoryPage() {
    return (
        <>
            <div>
                <h1 className="text-xl font-semibold">翻译历史</h1>
            </div>
            <TranslationHistory />
        </>
    );
}
