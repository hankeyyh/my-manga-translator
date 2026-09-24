import { createServerClient as clientRealServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";

/**
 * Especially important if using Fluid compute: Don't put this client in a
 * global variable. Always create a new client within each function when using
 * it.
 */
export async function createServerClient() {
    const cookieStore = await cookies();

    return clientRealServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options),
                        );
                    } catch {
                        // console.error("setAll error", cookiesToSet);
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have proxy refreshing
                        // user sessions.
                    }
                },
            },
        },
    );
}

/**
 * 用于匿名用户登录，为了防止滥用，对匿名用户ip rate limit。
 * doc 规定ip forwarding 需要用sb_scret创建客户端，并传入 sb-forwarded-for header
 * 
 * 前提：supabase 开启 Enable IP address forwarding
 * 
 * doc: https://supabase.com/docs/guides/auth/rate-limits#ip-address-forwarding
 */
export async function createServerClientForAnonymous() {
    const cookieStore = await cookies();
    // Cloudflare 在到达 Worker 前写入，客户端改不了。本地 next dev 没有这个头。
    const clientIp = (await headers()).get("cf-connecting-ip");
    console.debug(`createServerClientForAnonymous, cf-connecting-ip: ${clientIp}`)

    return clientRealServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options),
                        );
                    } catch {
                        // console.error("setAll error", cookiesToSet);
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have proxy refreshing
                        // user sessions.
                    }
                },
            },
            ...(clientIp
                ? { global: { headers: { "sb-forwarded-for": clientIp } } }
                : {}),
        },
    );
}