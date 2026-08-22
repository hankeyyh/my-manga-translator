import { createServerClient } from "@supabase/ssr";
import { hasLocale } from "next-intl";
import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing, type AppLocale } from "./i18n/routing";

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"
    ],
};
const handlei18nRouting = createMiddleware(routing);

export async function middleware(request: NextRequest) {
    return await updateSession(request);
}

function shouldHandleI18n(pathname: string) {
    if (pathname.startsWith("/api")) {
        return false;
    }
    if (pathname.startsWith("/design")) {
        return false;
    }
    return true;
}

function getPathLocale(pathname: string): AppLocale {
    const first = pathname.split("/")[1];
    return hasLocale(routing.locales, first) ? first : routing.defaultLocale;
}

function pathnameWithoutLocale(pathname: string): string {
    const first = pathname.split("/")[1];
    if (!hasLocale(routing.locales, first)) {
        return pathname;
    }
    const rest = pathname.slice(`/${first}`.length);
    return rest === "" ? "/" : rest;
}

function loginPathname(locale: AppLocale): string {
    return locale === routing.defaultLocale ? "/auth/login" : `/${locale}/auth/login`;
}

export async function updateSession(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    /** 
     * 先交由next-intl middleware：
     * 1. 判定locale
     *      - URL前缀 /zh-cn/about
     *      - locale cookie 上次选择的语言
     *      - Accept-language 浏览器语言
     *      - 都没有，使用defaultLocale
     * 2. redirect 外部url
     *      - 默认语言不带前缀 /en/about -> /about 
     *      - 中文浏览器访问 /about -> /zh-cn/about
     * 3. rewrite 内部url
     *      - APP Router 使用[locale] dynamic route，内部url需要带上locale. /about -> /en/about
     *      rewrite不是跳转，浏览器看不到
     * 4. 语言偏好写入Set-Cookie
     *      - 写入 locale cookie
    */
    let response = shouldHandleI18n(pathname) ?
        handlei18nRouting(request) :
        NextResponse.next({ request });

    // With Fluid compute, don't put this client in a global environment
    // variable. Always create a new one on each request.
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value);           // 1. 改内存里的 Cookie 头
                        response.cookies.set(name, value, options); // 2. Set-Cookie 给浏览器
                    });
                },
            },
        }
    );

    // Do not run code between createServerClient and
    // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.
    // IMPORTANT: If you remove getClaims() and you use server-side rendering
    // with the Supabase client, your users may be randomly logged out.
    const { data } = await supabase.auth.getClaims();
    const user = data?.claims;

    /**  
     * 经过auth.getClaims，request auth cookie可能更新。
     * 引入next-intl前，可以通过在上面setAll中 NextResponse.next({request})，将request的变化传递给之后的RSC。
     * 引入next-intl后，这么做会创建一个全新的response，从而丢掉next-intl设置的header。
     * 需要在保留response header基础上，将「当前 request 的 Cookie」快照到原先的 response 上。
     * 
     * NextResponse.next({request}) 原理：
     * 1. 会将所有request header设置到response header，key: x-middleware-request-*。request cookie -> x-middleware-request-cookie。
     * 2. x-middleware-override-headers 记录所有key。
     */ 
    const cookie = request.headers.get("cookie") ?? "";
    const override = response.headers.get("x-middleware-override-headers");
    const keys = new Set(
        (override ?? "").split(",").map((k) => k.trim()).filter(Boolean),
    );
    keys.add("cookie");
    response.headers.set("x-middleware-override-headers", [...keys].join(","));
    response.headers.set("x-middleware-request-cookie", cookie);

    // Prevent CDN/proxy from caching responses that may include Set-Cookie
    // after token refresh (see @supabase/ssr createServerClient docs).
    response.headers.set("Cache-Control", "private, no-store");

    const isI18nRedirect = response.status >= 300 && response.status < 400;
    const path = pathnameWithoutLocale(request.nextUrl.pathname);
    const isPublicPath = path === "/" ||
        path.startsWith("/login") ||
        path.startsWith("/auth") ||
        path.startsWith("/api") ||
        path.startsWith("/design");

    if (!user && !isPublicPath && !isI18nRedirect) {
        const url = request.nextUrl.clone();
        url.pathname = loginPathname(getPathLocale(request.nextUrl.pathname));
        const redirectResponse = NextResponse.redirect(url);
        response.cookies.getAll().forEach((cookie) => {
            redirectResponse.cookies.set(cookie);
        });
        redirectResponse.headers.set("Cache-Control", "private, no-store");
        return redirectResponse;
    }

    // IMPORTANT: You *must* return the supabaseResponse object as it is.
    // If you're creating a new response object with NextResponse.next() make sure to:
    // 1. Pass the request in it, like so:
    //    const myNewResponse = NextResponse.next({ request })
    // 2. Copy over the cookies, like so:
    //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
    // 3. Change the myNewResponse object to fit your needs, but avoid changing
    //    the cookies!
    // 4. Finally:
    //    return myNewResponse
    // If this is not done, you may be causing the browser and server to go out
    // of sync and terminate the user's session prematurely!
    return response;
}
