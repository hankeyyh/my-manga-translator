import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardTitle,
} from "@/components/ui/card";

export type HomeProfileCardProps = {
    profileImage: string;
    name: string;
    email: string;
    creditsBalance: number;
    translatedCount: number;
};

export function HomeProfileCard({
    profileImage,
    name,
    email,
    creditsBalance,
    translatedCount,
}: HomeProfileCardProps) {
    return (
        <Card className="flex flex-col items-center border border-[#adb3b7]/15 text-center">
            <CardContent className="flex w-full flex-col items-center p-8 pt-8">
                <div className="group relative mb-4">
                    <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-[#0053dd]/20">
                        <Image
                            alt="Profile"
                            className="object-cover"
                            fill
                            sizes="96px"
                            src={profileImage}
                            unoptimized
                        />
                    </div>
                    <Button
                        className="absolute bottom-1 right-0 h-7 w-7 rounded-full bg-[#0053dd] p-0 text-white shadow-lg hover:bg-[#0053dd]/90"
                        size="icon"
                        type="button"
                        variant="default"
                    >
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z" />
                        </svg>
                    </Button>
                </div>
                <CardTitle className="font-headline text-xl">{name}</CardTitle>
                <CardDescription className="mb-6 text-sm text-[#5a6064]">
                    {email}
                </CardDescription>
                <div className="grid w-full grid-cols-2 gap-4 border-t border-[#ebeef1] pt-6">
                    <div>
                        <p className="mb-1 text-xs uppercase tracking-wider text-[#5a6064]">
                            积分余额
                        </p>
                        <p className="font-headline text-lg font-extrabold text-[#0053dd]">
                            {creditsBalance.toLocaleString("en-US")}
                        </p>
                    </div>
                    <div>
                        <p className="mb-1 text-xs uppercase tracking-wider text-[#5a6064]">
                            已翻译
                        </p>
                        <p className="font-headline text-lg font-extrabold text-[#2d3337]">
                            {translatedCount.toLocaleString("en-US")}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
