/** 博客文章（对应 blog_posts） */
export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    description: string;
    /** supabase storage path in public blog_media bucket */
    cover: string;
    content: string;
    author: string | null;
    status: string;
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
}
