import { Result } from "@/types/do/response";
import { SupabaseClient } from "@supabase/supabase-js";

export class BlogMediaStorageRepository {
    private bucketName = "blog_media";

    constructor(private supabase: SupabaseClient) {}

    /**
     * 为 blog_media 对象创建签名 URL（bucket 为 private）
     */
    async createSignedUrls(filePaths: string[], expiresIn: number): Promise<Result<string[]>> {
        if (filePaths.length === 0) {
            return { data: [], error: null };
        }

        const { data, error } = await this.supabase.storage
            .from(this.bucketName)
            .createSignedUrls(filePaths, expiresIn);

        if (error) {
            return {
                data: null,
                error: new Error(`Failed to create signed URLs: ${error.message}`),
            };
        }

        return {
            data: (data ?? []).map((item) => item.signedUrl ?? ""),
            error: null,
        };
    }
}
