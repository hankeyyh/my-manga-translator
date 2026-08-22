import { Link } from "@/i18n/navigation";
import {
    CcButton,
    CcCard,
    CcCardDescription,
    CcCardTitle,
    CcSectionHeading,
} from "@/design/design-system/components";
import { BlogService } from "@/biz/services/blog/blog-service";
import { createServerClient } from "@/biz/utils/supabase/server";
import { getTranslations } from "next-intl/server";

const PLACEHOLDER_BLOG = "https://placehold.co/400x240/e8f0fe/0053dd?text=Blog";

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

export async function BlogSection() {
    const t = await getTranslations("blog");
    const supabase = await createServerClient();
    const result = await BlogService.fromSupabase(supabase).listPublishedPosts();
    const posts = (result.data ?? []).slice(0, 3);

    return (
        <section className="bg-cc-surface-white py-16">
            <div className="mx-auto max-w-7xl px-4">
                <CcSectionHeading className="mb-8" size="md" title={t("latest")} />
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
                                        {formatBlogDate(post.publishedAt, t)}
                                    </CcCardDescription>
                                </div>
                            </CcCard>
                        </Link>
                    ))}
                </div>
                <p className="mt-6 text-center">
                    <CcButton variant="link" asChild>
                        <Link href="/blogs">{t("viewAll")}</Link>
                    </CcButton>
                </p>
            </div>
        </section>
    );
}
