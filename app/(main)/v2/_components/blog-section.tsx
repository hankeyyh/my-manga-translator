import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { BlogService } from "@/biz/services/blog/blog-service";
import { createServiceRoleClient } from "@/biz/utils/supabase/admin";
import { createServerClient } from "@/biz/utils/supabase/server";

const PLACEHOLDER_BLOG = "https://placehold.co/400x240/e5e5e5/a3a3a3?text=Blog";

export async function BlogSection() {
    const supabase = await createServerClient();
    const result = await BlogService.fromSupabase(
        supabase,
        createServiceRoleClient(),
    ).listPublishedPosts();
    const posts = (result.data ?? []).slice(0, 3);

    return (
        <section className="py-16">
            <div className="mx-auto max-w-5xl px-4">
                <h2 className="mb-8 text-center text-2xl font-semibold">最新博客</h2>
                <div className="grid gap-4 md:grid-cols-3">
                    {posts.map((post) => (
                        <Link
                            key={post.slug}
                            href={`/v2/blogs/${post.slug}`}
                            className="group"
                        >
                            <Card className="overflow-hidden py-0 transition-colors group-hover:bg-accent/50">
                                <img
                                    src={post.coverUrl || PLACEHOLDER_BLOG}
                                    alt={post.title}
                                    className="aspect-[5/3] w-full object-cover"
                                />
                                <CardHeader>
                                    <CardTitle className="line-clamp-2 text-base transition-colors group-hover:text-primary">
                                        {post.title}
                                    </CardTitle>
                                    <CardDescription>
                                        {post.publishedAt?.slice(0, 10) ?? ""}
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </Link>
                    ))}
                </div>
                <p className="mt-6 text-center">
                    <Button variant="link" asChild>
                        <Link href="/v2/blogs">查看所有文章 →</Link>
                    </Button>
                </p>
            </div>
        </section>
    );
}
