import { createBrowserClient as createRealBrowserClient } from "@supabase/ssr";

export function createBrowserClient() {
    return createRealBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    );
}
