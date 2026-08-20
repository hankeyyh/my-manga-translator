import type { Metadata } from "next";
import Link from "next/link";
import { CcCard, CcSectionHeading } from "@/design/design-system/components";
import { BlogService } from "@/biz/services/blog/blog-service";
import { createServerClient } from "@/biz/utils/supabase/server";

export const metadata: Metadata = {
    title: "博客 | Manga Sense",
};

const PLACEHOLDER_BLOG = "https://placehold.co/400x400/f8fafc/0053dd?text=Blog";

function formatBlogDate(publishedAt: string | null) {
    if (!publishedAt) return "";
    const date = publishedAt.slice(0, 10);
    const [year, month, day] = date.split("-").map(Number);
    if (!year || !month || !day) return date;
    return `${year}年${month}月${day}日`;
}

export default async function Page() {
    const supabase = await createServerClient();
    const result = await BlogService.fromSupabase(supabase).listPublishedPosts();
    const posts = result.data ?? [];

    return (
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
            <CcSectionHeading align="left" className="mb-8" size="md" title="博客" />
            <div className="flex flex-col gap-4">
                {posts.map((post) => (
                    <Link
                        key={post.slug}
                        href={`/blogs/${post.slug}`}
                        className="group"
                    >
                        <CcCard
                            className="flex-row items-center overflow-hidden rounded-[var(--cc-radius-lg)] p-3 transition-colors hover:bg-[var(--cc-brand-tint)] sm:p-4"
                            variant="outlined"
                        >
                            <img
                                src={post.coverUrl || PLACEHOLDER_BLOG}
                                alt=""
                                aria-hidden
                                className="aspect-square w-28 shrink-0 rounded-lg object-cover sm:w-36"
                            />
                            <div className="min-w-0 flex-1 space-y-1 py-1 pl-4 sm:pl-5">
                                {post.publishedAt ? (
                                    <p className="text-sm text-cc-text-muted">
                                        {formatBlogDate(post.publishedAt)}
                                    </p>
                                ) : null}
                                <h2 className="font-headline text-lg font-bold text-cc-text-primary transition-colors group-hover:text-cc-brand-primary">
                                    {post.title}
                                </h2>
                                {post.description ? (
                                    <p className="line-clamp-2 text-sm text-cc-text-secondary">
                                        {post.description}
                                    </p>
                                ) : null}
                                <p className="text-sm font-semibold text-cc-brand-primary group-hover:underline">
                                    阅读更多 →
                                </p>
                            </div>
                        </CcCard>
                    </Link>
                ))}
            </div>
        </div>
    );
}
