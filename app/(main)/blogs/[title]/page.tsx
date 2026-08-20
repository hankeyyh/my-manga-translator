import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MarkdownContent } from "@/components/markdown-content";
import { BlogService } from "@/biz/services/blog/blog-service";
import { createServerClient } from "@/biz/utils/supabase/server";

type Props = {
    params: Promise<{ title: string; }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { title: slug } = await params;
    const supabase = await createServerClient();
    const result = await BlogService.fromSupabase(supabase).getPublishedPost(slug);
    if (result.error || !result.data) {
        return { title: "博客 | Manga Sense" };
    }

    return {
        title: `${result.data.title} | Manga Sense`,
        description: result.data.description || undefined,
    };
}

function formatBlogDate(publishedAt: string | null) {
    if (!publishedAt) return "";
    const date = publishedAt.slice(0, 10);
    const [year, month, day] = date.split("-").map(Number);
    if (!year || !month || !day) return date;
    return `${year}年${month}月${day}日`;
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
    const supabase = await createServerClient();
    const result = await BlogService.fromSupabase(supabase).getPublishedPost(slug);
    if (result.error || !result.data) {
        notFound();
    }

    const post = result.data;
    const { heading, body } = splitLeadingH1(post.content);

    return (
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
            <Link
                href="/blogs"
                className="mb-8 inline-block text-sm text-muted-foreground hover:text-foreground"
            >
                ← 返回博客
            </Link>
            {post.publishedAt ? (
                <p className="mb-4 text-sm text-muted-foreground">
                    {formatBlogDate(post.publishedAt)}
                </p>
            ) : null}
            {heading ? (
                <h1 className="mb-6 text-3xl font-bold tracking-tight">{heading}</h1>
            ) : null}
            {post.coverUrl ? (
                <img
                    src={post.coverUrl}
                    alt={heading ?? post.title}
                    className="mb-8 w-full rounded-lg object-cover"
                />
            ) : null}
            <MarkdownContent content={body} />
        </div>
    );
}
