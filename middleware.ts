import { createServerClient } from "@supabase/ssr";
import { hasLocale } from "next-intl";
import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing, type AppLocale } from "./i18n/routing";

// batch-image-lite 是高频接口，鉴权service接口也会做，只做一次就行
export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|api/translate/batch-image-lite|.*\\..*).*)"
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

// 落地页，没有用户态，可cdn缓存
function isLandingPath(path: string) {
    return path === "/" ||
        path === "/pricing" ||
        path === "/faq" ||
        path.startsWith("/legal") ||
        path.startsWith("/blogs");
}

function isPublicPath(path: string) {
    return isLandingPath(path) ||
        path.startsWith("/login") ||
        path.startsWith("/auth") ||
        path.startsWith("/api");
}

function hasSupabaseAuthCookie(request: NextRequest) {
    return request.cookies.getAll().some(
        (cookie) => cookie.name.startsWith("sb-") && cookie.name.includes("auth-token"),
    );
}

export async function updateSession(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    // 轮询接口频率高，这里跳过 JWT 校验；路由内部仍会鉴权。
    if (pathname.startsWith("/api/translate/batch-image-lite")) {
        return NextResponse.next({ request });
    }
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

    const isI18nRedirect = response.status >= 300 && response.status < 400;
    const path = pathnameWithoutLocale(request.nextUrl.pathname);
    if (isI18nRedirect) {
        response.headers.set("Cache-Control", "private, no-store");
        return response;
    }

    // 营销页 HTML 不含用户态，直接返回。会话刷新留给随后的 /api/me。
    // 没有 auth cookie 才允许 CDN 缓存；有 cookie 的响应可能带 Set-Cookie，不能进公共缓存。
    if (isLandingPath(path)) {
        if (!hasSupabaseAuthCookie(request)) {
            /**
             * public: cdn可以缓存html
             * s-maxage: cdn最大缓存时间
             * stale-while-revalidate: 过期后接下来的300s内，cdn仍可把过期页返回给用户，同时在后台请求新资源
             */
            response.headers.set(
                "Cache-Control",
                "public, s-maxage=60, stale-while-revalidate=300",
            );
        } else {
            response.headers.set("Cache-Control", "private, no-store");
        }
        return response;
    }

    // 营销页已在上面返回。之后都是需要登录态的路径，token 刷新会带 Set-Cookie。
    response.headers.set("Cache-Control", "private, no-store");

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
    const isAnonymous = user?.is_anonymous === true;

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

    // 匿名会话可以留在营销页并走登录，但不能进 /home。
    const anonymousBlocked = isAnonymous && path.startsWith("/home");

    if ((!user || anonymousBlocked) && !isPublicPath(path) && !isI18nRedirect) {
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
