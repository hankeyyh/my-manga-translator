import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { MarkdownContent } from "@/components/markdown-content";
import { CcButton } from "@/design/design-system/components";
import { BlogService } from "@/biz/services/blog/blog-service";
import { createServerClient } from "@/biz/utils/supabase/server";
import { getTranslations } from "next-intl/server";

type Props = {
    params: Promise<{ title: string; }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { title: slug } = await params;
    const t = await getTranslations("meta");
    const supabase = await createServerClient();
    const result = await BlogService.fromSupabase(supabase).getPublishedPost(slug);
    if (result.error || !result.data) {
        return { title: t("blogTitle") };
    }

    return {
        title: t("blogTitleWithName", { title: result.data.title }),
        description: result.data.description || undefined,
    };
}

function formatBlogDate(
    publishedAt: string | null,
    t: Awaited<ReturnType<typeof getTranslations<"blog">>>,
) {
    if (!publishedAt) return "";
    const date = publishedAt.slice(0, 10);
    const [year, month, day] = date.split("-").map(Number);
    if (!year || !month || !day) return date;
    return t("date", { year, month, day });
}

/** Split body into leading `# heading` and the remaining markdown. */
function splitLeadingH1(content: string) {
    const match = content.trimStart().match(/^#\s+(.+)\r?\n+([\s\S]*)$/);
    if (!match) {
        return { heading: null as string | null, body: content };
    }
    return { heading: match[1].trim(), body: match[2] };
}

export default async function Page({ params }: Props) {
    const { title: slug } = await params;
    const t = await getTranslations("blog");
    const supabase = await createServerClient();
    const result = await BlogService.fromSupabase(supabase).getPublishedPost(slug);
    if (result.error || !result.data) {
        notFound();
    }

    const post = result.data;
    const { heading, body } = splitLeadingH1(post.content);

    return (
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
            <CcButton className="mb-8 px-0" variant="link" asChild>
                <Link href="/blogs">{t("back")}</Link>
            </CcButton>
            {post.publishedAt ? (
                <p className="mb-4 text-sm text-cc-text-muted">
                    {formatBlogDate(post.publishedAt, t)}
                </p>
            ) : null}
            {heading ? (
                <h1 className="mb-6 font-headline text-3xl font-bold tracking-tight text-cc-text-primary">
                    {heading}
                </h1>
            ) : null}
            {post.coverUrl ? (
                <img
                    src={post.coverUrl}
                    alt={heading ?? post.title}
                    className="mb-8 w-full rounded-2xl object-cover"
                />
            ) : null}
            <MarkdownContent content={body} variant="cc" />
        </div>
    );
}
