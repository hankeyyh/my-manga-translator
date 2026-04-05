import Link from "next/link";
import { CreditCard, History, LogOut, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";

export function HomeAccountNav() {
    return (
        <nav
            aria-label="Account"
            className="space-y-1 rounded-xl bg-[#f1f4f7] p-2"
        >
            <Button
                asChild
                className="h-auto w-full justify-start gap-3 rounded-lg px-4 py-3 text-[#5a6064] hover:bg-[#ebeef1]"
                variant="ghost"
            >
                <Link href="#">
                    <History className="h-5 w-5" />
                    <span className="text-sm">翻译历史</span>
                </Link>
            </Button>
            <Button
                asChild
                className="h-auto w-full justify-start gap-3 rounded-lg px-4 py-3 text-[#5a6064] hover:bg-[#ebeef1]"
                variant="ghost"
            >
                <Link href="#">
                    <CreditCard className="h-5 w-5" />
                    <span className="text-sm">账单与订阅</span>
                </Link>
            </Button>
            <Button
                asChild
                className="h-auto w-full justify-start gap-3 rounded-lg px-4 py-3 text-[#5a6064] hover:bg-[#ebeef1]"
                variant="ghost"
            >
                <Link href="#">
                    <Settings className="h-5 w-5" />
                    <span className="text-sm">通用设置</span>
                </Link>
            </Button>
            <div className="mt-4 border-t border-[#dee3e7] pt-4">
                <Button
                    asChild
                    className="h-auto w-full justify-start gap-3 rounded-lg px-4 py-3 text-[#a83836] hover:bg-[#fa746f]/10"
                    variant="ghost"
                >
                    <Link href="#">
                        <LogOut className="h-5 w-5" />
                        <span className="text-sm">退出登录</span>
                    </Link>
                </Button>
            </div>
        </nav>
    );
}
