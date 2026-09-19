import { hasPublishedBlogPosts } from "@/biz/loaders/has-published-blog-posts";
import { ClientSiteHeader } from "./client-site-header";
import { UserInfo } from "@/types/api/user-info";

type Props = {
    userInfo?: UserInfo | null;
    deferUser?: boolean;
};

export async function SiteHeader({ userInfo, deferUser = false }: Props = {}) {
    const showBlog = await hasPublishedBlogPosts();
    return (
        <ClientSiteHeader
            showBlog={showBlog}
            userInfo={userInfo}
            deferUser={deferUser}
        />
    );
}
