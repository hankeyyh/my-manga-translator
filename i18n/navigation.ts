import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// 这些 API 知道 as-needed 规则，跳转时会自动加/去掉语言前缀。
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
