import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MarkdownContent } from "@/components/v2/markdown-content";
import { getBlogPost, getBlogPosts } from "@/biz/utils/blog";

type Props = {
    params: Promise<{ title: string }>;
};

export async function generateStaticParams() {
    const posts = await getBlogPosts();
    return posts.map((post) => ({ title: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { title: slug } = await params;
    const post = await getBlogPost(slug);
    if (!post) return { title: "博客 | Manga Sense" };

    return {
        title: `${post.title} | Manga Sense`,
        description: post.description || undefined,
    };
}

function formatBlogDate(date: string) {
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
    const post = await getBlogPost(slug);

    if (!post) {
        notFound();
    }

    const { heading, body } = splitLeadingH1(post.content);

    return (
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
            <Link
                href="/v2/blogs"
                className="mb-8 inline-block text-sm text-muted-foreground hover:text-foreground"
            >
                ← 返回博客
            </Link>
            {post.date ? (
                <p className="mb-4 text-sm text-muted-foreground">
                    {formatBlogDate(post.date)}
                </p>
            ) : null}
            {heading ? (
                <h1 className="mb-6 text-3xl font-bold tracking-tight">{heading}</h1>
            ) : null}
            {post.cover ? (
                <img
                    src={post.cover}
                    alt={heading ?? post.title}
                    className="mb-8 w-full rounded-lg object-cover"
                />
            ) : null}
            <MarkdownContent content={body} />
        </div>
    );
}
