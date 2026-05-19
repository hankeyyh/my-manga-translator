import { createServerClient as clientRealServerClient } from "@supabase/ssr";

/** 用管理员身份登录的客户端（不依赖 next/headers，可用于 worker 与测试） */
export function createServiceRoleClient() {
    return clientRealServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            cookies: {
                getAll() {
                    return [];
                },
                setAll() {},
            },
        },
    );
}
