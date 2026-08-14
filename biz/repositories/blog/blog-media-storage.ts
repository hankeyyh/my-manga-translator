import { Result } from "@/types/do/response";
import { SupabaseClient } from "@supabase/supabase-js";

export class BlogMediaStorageRepository {
    private bucketName = "blog_media";

    constructor(private supabase: SupabaseClient) {}

    /**
     * blog_media 为 public bucket，返回稳定可缓存的公开 URL
     */
    getPublicUrls(filePaths: string[]): Result<string[]> {
        if (filePaths.length === 0) {
            return { data: [], error: null };
        }

        try {
            const urls = filePaths.map((path) => {
                const { data } = this.supabase.storage
                    .from(this.bucketName)
                    .getPublicUrl(path);
                return data.publicUrl;
            });
            return { data: urls, error: null };
        } catch (err) {
            return {
                data: null,
                error: err instanceof Error ? err : new Error(String(err)),
            };
        }
    }
}
