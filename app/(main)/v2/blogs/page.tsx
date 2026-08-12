import type { Metadata } from "next";
import Link from "next/link";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { getBlogPosts } from "@/biz/utils/blog";

export const metadata: Metadata = {
    title: "博客 | Manga Sense",
};

const PLACEHOLDER_BLOG = "https://placehold.co/400x400/e5e5e5/a3a3a3?text=Blog";

function formatBlogDate(date: string) {
    const [year, month, day] = date.split("-").map(Number);
    if (!year || !month || !day) return date;
    return `${year}年${month}月${day}日`;
}

export default async function Page() {
    const posts = await getBlogPosts();

    return (
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
            <h1 className="mb-8 text-3xl font-bold tracking-tight">博客</h1>
            <div className="flex flex-col gap-4">
                {posts.map((post) => (
                    <Link
                        key={post.slug}
                        href={`/v2/blogs/${post.slug}`}
                        className="group"
                    >
                        <Card className="flex-row overflow-hidden py-0 transition-colors group-hover:bg-accent/50">
                            <img
                                src={post.cover || PLACEHOLDER_BLOG}
                                alt=""
                                aria-hidden
                                className="aspect-square w-28 shrink-0 object-cover sm:w-36"
                            />
                            <CardHeader className="min-w-0 flex-1 justify-center py-4 pl-1">
                                {post.date ? (
                                    <CardDescription>
                                        {formatBlogDate(post.date)}
                                    </CardDescription>
                                ) : null}
                                <CardTitle className="transition-colors group-hover:text-primary">
                                    {post.title}
                                </CardTitle>
                                {post.description ? (
                                    <CardDescription className="line-clamp-2">
                                        {post.description}
                                    </CardDescription>
                                ) : null}
                                <CardDescription className="transition-colors group-hover:text-primary group-hover:underline">
                                    阅读更多 →
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
