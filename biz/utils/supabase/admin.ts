/**
 * 用管理员身份访问 Supabase（不依赖 next/headers，可用于 worker 与测试）。
 *
 * 快速对照（见 biz/utils/supabase/）：
 *
 * | Client                    | 运行位置 | Key           | 用户身份       | 典型场景                   |
 * |---------------------------|---------|---------------|--------------|---------------------------|
 * | createServerClient        | 服务端   | publishable   | 当前登录用户   | API、RSC、读用户数据        |
 * | createBrowserClient       | 浏览器   | publishable   | 当前登录用户   | 客户端 Auth 交互            |
 * | createAnonClient          | 服务端   | publishable   | 无（匿名）     | 公开查询、可缓存            |
 * | createServiceRoleClient   | 服务端   | service role  | 系统管理员     | Worker、Webhook、绕过 RLS  |
 * 
 * @supabase/ssr：Next.js 里 Cookie ↔ Session 同步（登录态）
 * @supabase/supabase-js：通用客户端，不绑定 Next Cookie 机制
 */
import { createServerClient as clientRealServerClient } from "@supabase/ssr";

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
