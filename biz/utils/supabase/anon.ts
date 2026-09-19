import { createClient } from "@supabase/supabase-js";

/** 不读 next/headers，供可缓存的公开查询使用 */
export function createAnonClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            auth: {
                persistSession: false,
                autoRefreshToken: false,
            },
        },
    );
}
