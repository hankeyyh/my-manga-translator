import { getLocale, getTranslations } from "next-intl/server";
import { JsonLd } from "@/components/json-ld";
import {
    buildBlogPosting,
    buildBreadcrumbList,
    compactJsonLd,
} from "@/biz/seo/json-ld";
import { absoluteUrl, asAppLocale } from "@/biz/seo/site";
import type { BlogPostView } from "@/types/dto/blog-post";

type Props = {
    post: BlogPostView;
    heading: string | null;
};

export async function BlogPostJsonLd({ post, heading }: Props) {
    const appLocale = asAppLocale(await getLocale());
    const t = await getTranslations("blog");
    const tCommon = await getTranslations("common");
    const headline = heading ?? post.title;
    const homeUrl = absoluteUrl(appLocale, "/");
    const blogsUrl = absoluteUrl(appLocale, "/blogs");
    const postUrl = absoluteUrl(appLocale, `/blogs/${post.slug}`);

    return (
        <JsonLd
            data={compactJsonLd([
                buildBlogPosting({
                    headline,
                    url: postUrl,
                    locale: appLocale,
                    description: post.description || undefined,
                    image: post.coverUrl || undefined,
                    datePublished: post.publishedAt || undefined,
                    author: post.author,
                }),
                buildBreadcrumbList([
                    { name: tCommon("brand"), url: homeUrl },
                    { name: t("title"), url: blogsUrl },
                    { name: headline, url: postUrl },
                ]),
            ])}
        />
    );
}
