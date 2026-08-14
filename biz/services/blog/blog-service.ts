import { BlogPostsRepository } from "@/biz/repositories/blog/blog-posts";
import { BlogMediaStorageRepository } from "@/biz/repositories/blog/blog-media-storage";
import {
    CHECK_PARAM_ERROR_CODE,
    DB_ERROR_CODE,
    SUCCESS_CODE,
    type BizResult,
} from "@/types/dto/response";
import type { BlogPost } from "@/types/do/blog-post";
import type { BlogPostMetaView, BlogPostView } from "@/types/dto/blog-post";
import { SupabaseClient } from "@supabase/supabase-js";

/** cover signed URL 有效期（秒）；页面配合 revalidate 刷新 */
const COVER_SIGNED_URL_EXPIRES_IN = 60 * 60 * 24;

/**
 * 博客
 */
export class BlogService {
    constructor(
        private blogPostsRepo: BlogPostsRepository,
        private blogMediaStorage: BlogMediaStorageRepository,
    ) {}

    /**
     * @param supabase DB 客户端（可读 published blog_posts）
     * @param storageClient 可选；blog_media 为 private 时应用 service role 签 URL
     */
    static fromSupabase(supabase: SupabaseClient, storageClient?: SupabaseClient) {
        return new BlogService(
            new BlogPostsRepository(supabase),
            new BlogMediaStorageRepository(storageClient ?? supabase),
        );
    }

    async listPublishedPosts(): Promise<BizResult<BlogPostMetaView[]>> {
        const { data, error } = await this.blogPostsRepo.listPublished();
        if (error) {
            console.error(
                `listPublishedPosts, blogPostsRepo.listPublished fail, error: ${error.message}`,
            );
            return { code: DB_ERROR_CODE, data: null, error };
        }

        const posts = data ?? [];
        const coverUrls = await this.resolveCoverUrls(posts.map((p) => p.cover));
        if (coverUrls.error) {
            console.error(
                `listPublishedPosts, resolveCoverUrls fail, error: ${coverUrls.error.message}`,
            );
            return { code: DB_ERROR_CODE, data: null, error: coverUrls.error };
        }

        return {
            code: SUCCESS_CODE,
            data: posts.map((post, i) => this.toMetaView(post, coverUrls.data![i] ?? "")),
            error: null,
        };
    }

    async getPublishedPost(slug: string): Promise<BizResult<BlogPostView>> {
        if (!slug) {
            return {
                code: CHECK_PARAM_ERROR_CODE,
                data: null,
                error: new Error("slug is required"),
            };
        }

        const { data, error } = await this.blogPostsRepo.getPublishedBySlug(slug);
        if (error) {
            console.error(
                `getPublishedPost, blogPostsRepo.getPublishedBySlug fail, slug: ${slug}, error: ${error.message}`,
            );
            return { code: DB_ERROR_CODE, data: null, error };
        }

        const coverUrls = await this.resolveCoverUrls([data!.cover]);
        if (coverUrls.error) {
            console.error(
                `getPublishedPost, resolveCoverUrls fail, slug: ${slug}, error: ${coverUrls.error.message}`,
            );
            return { code: DB_ERROR_CODE, data: null, error: coverUrls.error };
        }

        return {
            code: SUCCESS_CODE,
            data: {
                ...this.toMetaView(data!, coverUrls.data![0] ?? ""),
                content: data!.content,
                author: data!.author,
            },
            error: null,
        };
    }

    private toMetaView(post: BlogPost, coverUrl: string): BlogPostMetaView {
        return {
            slug: post.slug,
            title: post.title,
            description: post.description,
            coverUrl,
            publishedAt: post.publishedAt,
        };
    }

    private async resolveCoverUrls(covers: string[]) {
        const paths = covers.map((c) => c.trim()).filter(Boolean);
        if (paths.length === 0) {
            return { data: covers.map(() => ""), error: null as Error | null };
        }

        const signed = await this.blogMediaStorage.createSignedUrls(
            paths,
            COVER_SIGNED_URL_EXPIRES_IN,
        );
        if (signed.error || !signed.data) {
            return { data: null, error: signed.error };
        }

        const urlByPath = new Map<string, string>();
        paths.forEach((path, i) => {
            urlByPath.set(path, signed.data![i] ?? "");
        });

        return {
            data: covers.map((cover) => {
                const path = cover.trim();
                return path ? (urlByPath.get(path) ?? "") : "";
            }),
            error: null as Error | null,
        };
    }
}
