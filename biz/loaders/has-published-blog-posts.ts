import { cache } from "react";

import { BlogService } from "@/biz/services/blog/blog-service";
import { createServerClient } from "@/biz/utils/supabase/server";

export const hasPublishedBlogPosts = cache(async (): Promise<boolean> => {
    const supabase = await createServerClient();
    const result = await BlogService.fromSupabase(supabase).hasPublishedPosts();
    return Boolean(result.data);
});
