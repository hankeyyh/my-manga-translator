import Link from "next/link";
import {
    CcButton,
    CcCard,
    CcCardDescription,
    CcCardTitle,
    CcSectionHeading,
} from "@/design/design-system/components";
import { BlogService } from "@/biz/services/blog/blog-service";
import { createServerClient } from "@/biz/utils/supabase/server";

const PLACEHOLDER_BLOG = "https://placehold.co/400x240/e8f0fe/0053dd?text=Blog";

export async function BlogSection() {
    const supabase = await createServerClient();
    const result = await BlogService.fromSupabase(supabase).listPublishedPosts();
    const posts = (result.data ?? []).slice(0, 3);

    return (
        <section className="bg-cc-surface-white py-16">
            <div className="mx-auto max-w-7xl px-4">
                <CcSectionHeading className="mb-8" size="md" title="最新博客" />
                <div className="grid gap-4 md:grid-cols-3">
                    {posts.map((post) => (
                        <Link
                            key={post.slug}
                            href={`/blogs/${post.slug}`}
                            className="group"
                        >
                            <CcCard
                                className="overflow-hidden p-0 transition-colors group-hover:bg-[var(--cc-brand-tint)]"
                                variant="outlined"
                            >
                                <img
                                    src={post.coverUrl || PLACEHOLDER_BLOG}
                                    alt={post.title}
                                    className="aspect-[5/3] w-full object-cover"
                                />
                                <div className="space-y-2 p-6">
                                    <CcCardTitle className="line-clamp-2 text-base transition-colors group-hover:text-cc-brand-primary">
                                        {post.title}
                                    </CcCardTitle>
                                    <CcCardDescription>
                                        {post.publishedAt?.slice(0, 10) ?? ""}
                                    </CcCardDescription>
                                </div>
                            </CcCard>
                        </Link>
                    ))}
                </div>
                <p className="mt-6 text-center">
                    <CcButton variant="link" asChild>
                        <Link href="/blogs">查看所有文章 →</Link>
                    </CcButton>
                </p>
            </div>
        </section>
    );
}
