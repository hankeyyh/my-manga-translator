import { Tables } from "@/types/database";
import { Result } from "@/types/do/response";
import { BlogPost } from "@/types/do/blog-post";
import { SupabaseClient } from "@supabase/supabase-js";

function mapBlogPostRow(row: Tables<"blog_posts">): BlogPost {
    return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        description: row.description,
        cover: row.cover,
        content: row.content,
        author: row.author,
        status: row.status,
        publishedAt: row.published_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

export class BlogPostsRepository {
    constructor(private supabase: SupabaseClient) {}

    async listPublished(): Promise<Result<BlogPost[]>> {
        const { data, error } = await this.supabase
            .from("blog_posts")
            .select("*")
            .eq("status", "published")
            .order("published_at", { ascending: false, nullsFirst: false });

        if (error) {
            return { data: null, error };
        }
        return {
            data: (data ?? []).map((row) => mapBlogPostRow(row as Tables<"blog_posts">)),
            error: null,
        };
    }

    async getPublishedBySlug(slug: string): Promise<Result<BlogPost>> {
        const { data, error } = await this.supabase
            .from("blog_posts")
            .select("*")
            .eq("slug", slug)
            .eq("status", "published")
            .maybeSingle();

        if (error) {
            return { data: null, error };
        }
        if (!data) {
            return { data: null, error: new Error(`blog_posts not found: ${slug}`) };
        }
        return { data: mapBlogPostRow(data as Tables<"blog_posts">), error: null };
    }
}
