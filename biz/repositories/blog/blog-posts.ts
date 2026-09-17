import { Tables } from "@/types/database";
import { Result } from "@/types/do/response";
import { BlogPost } from "@/types/do/blog-post";
import { SupabaseClient } from "@supabase/supabase-js";

const BLOG_POST_COLUMNS = {
    id: "id",
    slug: "slug",
    title: "title",
    description: "description",
    cover: "cover",
    content: "content",
    author: "author",
    status: "status",
    publishedAt: "published_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
} as const satisfies Record<keyof BlogPost, keyof Tables<"blog_posts">>;

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

function mapSelectedBlogPostFields<K extends keyof BlogPost>(
    row: Record<string, unknown>,
    selectFields: readonly K[],
): Pick<BlogPost, K> {
    const post = {} as Pick<BlogPost, K>;
    for (const field of selectFields) {
        post[field] = row[BLOG_POST_COLUMNS[field]] as Pick<BlogPost, K>[K];
    }
    return post;
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

    async hasPublished(): Promise<Result<boolean>> {
        const { data, error } = await this.supabase
            .from("blog_posts")
            .select("id")
            .eq("status", "published")
            .limit(1);

        if (error) {
            return { data: null, error };
        }
        return { data: (data ?? []).length > 0, error: null };
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

    async selectPublished<const K extends keyof BlogPost>(
        selectFields: readonly K[],
    ): Promise<Result<Pick<BlogPost, K>[]>> {
        if (selectFields.length === 0) {
            return { data: null, error: new Error("selectFields is required") };
        }

        const { data, error } = await this.supabase
            .from("blog_posts")
            .select(selectFields.map((field) => BLOG_POST_COLUMNS[field]).join(","))
            .eq("status", "published")
            .order("published_at", { ascending: false, nullsFirst: false });

        if (error) {
            return { data: null, error };
        }
        return {
            data: (data ?? []).map((row) =>
                mapSelectedBlogPostFields(row as unknown as Record<string, unknown>, selectFields),
            ),
            error: null,
        };
    }

    async selectPublishedBySlug<const K extends keyof BlogPost>(
        slug: string,
        selectFields: readonly K[],
    ): Promise<Result<Pick<BlogPost, K>>> {
        if (selectFields.length === 0) {
            return { data: null, error: new Error("selectFields is required") };
        }

        const { data, error } = await this.supabase
            .from("blog_posts")
            .select(selectFields.map((field) => BLOG_POST_COLUMNS[field]).join(","))
            .eq("slug", slug)
            .eq("status", "published")
            .maybeSingle();

        if (error) {
            return { data: null, error };
        }
        if (!data) {
            return { data: null, error: new Error(`blog_posts not found: ${slug}`) };
        }
        return {
            data: mapSelectedBlogPostFields(data as unknown as Record<string, unknown>, selectFields),
            error: null,
        };
    }
}
