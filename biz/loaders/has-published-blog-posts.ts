import { cache } from "react";
import { unstable_cache } from "next/cache";

import { BlogService } from "@/biz/services/blog/blog-service";
import { createAnonClient } from "@/biz/utils/supabase/anon";

/**
 * unstable_cache: 跨请求的数据缓存。它把结果存进 Next 的 Data Cache（内存 / OpenNext 的 incremental cache）。
 * 按 key（这里是 ["has-published-blog-posts"]）保存。
 */
const cachedHasPublishedBlogPosts = unstable_cache(
    async (): Promise<boolean> => {
        const supabase = createAnonClient();
        const result = await BlogService.fromSupabase(supabase).hasPublishedPosts();
        return Boolean(result.data);
    },
    ["has-published-blog-posts"],
    { revalidate: 300 },
);

export const hasPublishedBlogPosts = cache(cachedHasPublishedBlogPosts);
