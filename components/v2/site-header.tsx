import { getCurrentUserInfo } from "@/biz/loaders/get-current-user-info";
import { ClientSiteHeader } from "./client-site-header";

export async function SiteHeader() {
    const result = await getCurrentUserInfo();
    return <ClientSiteHeader userInfo={result.data} />;
}
