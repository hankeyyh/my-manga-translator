import { Button } from "@/components/ui/button";
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

const PLACEHOLDER_BLOG = "https://placehold.co/400x240/e5e5e5/a3a3a3?text=Blog";

const BLOG_POSTS = [
    { title: "如何用 AI 翻译日漫并保留原作风格", date: "2026-06-12" },
    { title: "漫画气泡检测与重绘原理简介", date: "2026-05-28" },
    { title: "多语言漫画本地化的常见坑", date: "2026-05-10" },
];

export function BlogSection() {
    return (
        <section className="py-16">
            <div className="mx-auto max-w-5xl px-4">
                <h2 className="mb-8 text-center text-2xl font-semibold">最新博客</h2>
                <div className="grid gap-4 md:grid-cols-3">
                    {BLOG_POSTS.map((post) => (
                        <Card key={post.title} className="overflow-hidden py-0">
                            <img
                                src={PLACEHOLDER_BLOG}
                                alt={post.title}
                                className="aspect-[5/3] w-full object-cover"
                            />
                            <CardHeader>
                                <CardTitle className="text-base">{post.title}</CardTitle>
                                <CardDescription>{post.date}</CardDescription>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
                <p className="mt-6 text-center">
                    <Button variant="link">查看所有文章 →</Button>
                </p>
            </div>
        </section>
    );
}
