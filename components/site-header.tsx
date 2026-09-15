import { getCurrentUserInfo } from "@/biz/loaders/get-current-user-info";
import { hasPublishedBlogPosts } from "@/biz/loaders/has-published-blog-posts";
import { ClientSiteHeader } from "./client-site-header";

export async function SiteHeader() {
    const [result, showBlog] = await Promise.all([
        getCurrentUserInfo(),
        hasPublishedBlogPosts(),
    ]);
    return <ClientSiteHeader showBlog={showBlog} userInfo={result.data} />;
}
