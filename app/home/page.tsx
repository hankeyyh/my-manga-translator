"use client";

import { Manrope, Inter } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ChevronRight,
  CreditCard,
  History,
  ImageIcon,
  LogOut,
  MoreHorizontal,
  Plus,
  Settings,
  User,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  SiteHeader,
} from "@/components/site-header";
import { cn } from "@/lib/utils";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "700", "800"],
  variable: "--font-manrope",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});

const PROFILE_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAcDREvFTqL-a6KKMlfk1MYH8SBNlWiH_D0vtDtEopJPHkwSd_XTPjMiRwaAFHGkzQInGNUF0VxV6kY09_z6SdvvFeSL0uh5nmjMI2nWRtsVztuO6OagUAQ-JbKGEi14oxD8_YksRWjV4gHzJUFC4zAkwi3D6RoU6GH_BuPkEHhUMrOI_DJxw3JN2RwYzSyWkla28vOJPNFAmUDM-1KVzYjPwR-26OQWGy8fce3VNrM1JGrAGevBPNlMu2cBxq4wSX5uFUyWKw";

export default function HomePage() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [promotionsEnabled, setPromotionsEnabled] = useState(false);

  const historyRecords = [
    {
      id: 1,
      filename: "Neon_Ghost_Vol1_Ch1.zip",
      size: "24.5 MB",
      language: "JP → EN",
      date: "2024-05-12",
      status: "completed" as const,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuC9ATpDHXc2Dc4fGjTJ_9pielutss3f1UGjzRwj2TkBlhCCiyecX6DoVU4k4J5emNklNo2zQm3D7K0D4G4gecdF-EKAMtEp9ygaCLhsBc1fJy_9AjLCk1DZp1ElweqYuZAOQeIMbbEEZrSoKZAH_ulQrE6P-V1Bw99_Xbta5fghiaTH3_J_2bXPLpBQJIQCsaLkKRDnTh8gL7y1xdSJKf5yg_s6riBW4MVaYiTe3C3JV29dqHtGS8_T4-HldozRI-JqQv2sz2k",
    },
    {
      id: 2,
      filename: "Blade_of_Fate_04.pdf",
      size: "12.1 MB",
      language: "KR → EN",
      date: "2024-05-10",
      status: "queued" as const,
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDSkq32BqXMVS0OPEoP-6n4DsIWJSeTJqL2M6JjsL0WRGojSIt53k1I_ZKdShrhAr2KUfJO38Kj2nzB4vyGxxd2moazeOrC45TFn1Pt8tGfBjIk6MZyI8TbEmxWVeRVOF4P5Pnlz0bFWuJyJXrRfL9mv4dIkBFzIKddTlx3MiPHuumgsV-88OTWVWbyrvgbR59vExR72wDJGlY6ETuxp7hsuvFR9mUjs7yhxJ-1p9xyYXr3EhZFmwn0fpRyOXEWjiK4I6bkW6E",
    },
    {
      id: 3,
      filename: "Summer_Sketch_S1.zip",
      size: "8.9 MB",
      language: "CN → EN",
      date: "2024-05-08",
      status: "completed" as const,
      image: null,
    },
  ];

  return (
    <div
      className={cn(
        manrope.variable,
        inter.variable,
        "min-h-screen bg-[#f8f9fb] font-body text-[#2d3337]",
      )}
    >
      <SiteHeader />

      <main
        className={cn(
          "mx-auto max-w-7xl px-8 py-12",
          "pt-16",
        )}
      >
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          <div className="space-y-8 md:col-span-4 lg:col-span-3">
            <Card className="flex flex-col items-center border border-[#adb3b7]/15 text-center">
              <CardContent className="flex w-full flex-col items-center p-8 pt-8">
                <div className="group relative mb-4">
                  <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-[#0053dd]/20">
                    <Image
                      alt="Profile"
                      className="object-cover"
                      fill
                      sizes="96px"
                      src={PROFILE_IMAGE}
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
                <CardTitle className="font-headline text-xl">Alex Chen</CardTitle>
                <CardDescription className="mb-6 text-sm text-[#5a6064]">
                  alex.chen@design.com
                </CardDescription>
                <div className="grid w-full grid-cols-2 gap-4 border-t border-[#ebeef1] pt-6">
                  <div>
                    <p className="mb-1 text-xs uppercase tracking-wider text-[#5a6064]">
                      积分余额
                    </p>
                    <p className="font-headline text-lg font-extrabold text-[#0053dd]">
                      2,450
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 text-xs uppercase tracking-wider text-[#5a6064]">
                      已翻译
                    </p>
                    <p className="font-headline text-lg font-extrabold text-[#2d3337]">
                      128
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <nav
              aria-label="Account"
              className="space-y-1 rounded-xl bg-[#f1f4f7] p-2"
            >
              <Button
                asChild
                className="h-auto w-full justify-start gap-3 rounded-lg bg-white px-4 py-3 font-bold text-[#0053dd] hover:bg-white"
                variant="ghost"
              >
                <Link href="/demo/home">
                  <User className="h-5 w-5" />
                  <span className="text-sm">个人资料</span>
                </Link>
              </Button>
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
          </div>

          <div className="space-y-8 md:col-span-8 lg:col-span-9">
            <Card className="relative flex flex-col items-center justify-between gap-6 overflow-hidden border-0 bg-[#dee3e7] md:flex-row">
              <CardContent className="relative z-10 space-y-2 p-8">
                <Badge className="border-0 bg-[#0053dd]/10 font-headline text-xs font-bold uppercase tracking-widest text-[#0053dd] hover:bg-[#0053dd]/15">
                  PRO MEMBER
                </Badge>
                <CardTitle className="font-headline text-2xl font-extrabold">
                  升级至专业版
                </CardTitle>
                <CardDescription className="max-w-md text-base text-[#5a6064]">
                  解锁批量翻译、高保真字体渲染及无限云端存储空间。
                </CardDescription>
                <div className="pt-2">
                  <Button className="rounded-full bg-gradient-to-br from-[#0053dd] to-[#2e6dfc] px-8 py-3 font-headline text-sm font-bold text-white shadow-xl shadow-[#0053dd]/20 hover:scale-105">
                    立即充值 / 升级
                  </Button>
                </div>
              </CardContent>
              <div className="relative hidden lg:block">
                <div className="absolute -right-12 -top-24 h-48 w-48 rounded-full bg-[#0053dd]/5 blur-3xl" />
                <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-[#595e72]/5 blur-3xl" />
                <svg
                  aria-hidden
                  className="h-32 w-32 select-none text-[#0053dd]/10"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
            </Card>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-headline text-xl font-bold">历史记录</h3>
                <Button
                  className="gap-1 font-headline text-sm font-semibold text-[#0053dd] hover:underline"
                  variant="link"
                >
                  查看全部
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Card className="overflow-hidden border border-[#adb3b7]/15 p-0">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-[#f1f4f7]/50">
                        <th className="px-6 py-4 font-headline text-xs font-bold uppercase tracking-wider text-[#5a6064]">
                          文件名
                        </th>
                        <th className="px-6 py-4 font-headline text-xs font-bold uppercase tracking-wider text-[#5a6064]">
                          日期
                        </th>
                        <th className="px-6 py-4 font-headline text-xs font-bold uppercase tracking-wider text-[#5a6064]">
                          状态
                        </th>
                        <th className="px-6 py-4 text-right font-headline text-xs font-bold uppercase tracking-wider text-[#5a6064]">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ebeef1]">
                      {historyRecords.map((record) => (
                        <tr
                          key={record.id}
                          className="group transition-colors hover:bg-[#f1f4f7]"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              {record.image ? (
                                <div className="relative h-12 w-10 flex-shrink-0 overflow-hidden rounded bg-[#ebeef1]">
                                  <Image
                                    alt=""
                                    className="object-cover"
                                    fill
                                    sizes="40px"
                                    src={record.image}
                                    unoptimized
                                  />
                                </div>
                              ) : (
                                <div className="flex h-12 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded bg-[#dee3e7]">
                                  <ImageIcon className="h-5 w-5 text-[#5a6064]/40" />
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-bold">{record.filename}</p>
                                <p className="text-xs text-[#5a6064]">
                                  {record.size} • {record.language}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-sm text-[#5a6064]">
                            {record.date}
                          </td>
                          <td className="px-6 py-5">
                            {record.status === "completed" ? (
                              <Badge className="gap-1.5 border-0 bg-green-100 font-headline text-xs font-bold text-green-700 hover:bg-green-100">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                完成
                              </Badge>
                            ) : (
                              <Badge className="gap-1.5 border-0 bg-amber-100 font-headline text-xs font-bold text-amber-700 hover:bg-amber-100">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                队列中
                              </Badge>
                            )}
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex justify-end gap-2">
                              <Button
                                className={cn(
                                  "h-9 w-9 p-0",
                                  record.status === "completed"
                                    ? "text-[#0053dd] hover:bg-[#0053dd]/10"
                                    : "cursor-not-allowed opacity-30",
                                )}
                                disabled={record.status !== "completed"}
                                size="icon"
                                variant="ghost"
                              >
                                <Plus className="h-5 w-5" />
                              </Button>
                              <Button
                                className="h-9 w-9 p-0 text-[#5a6064] hover:bg-[#ebeef1]"
                                size="icon"
                                variant="ghost"
                              >
                                <MoreHorizontal className="h-5 w-5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <Card className="border-0 bg-[#f1f4f7] shadow-none">
                <CardHeader>
                  <CardTitle className="font-headline text-lg">账户安全</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <Label className="text-sm font-semibold">两步验证</Label>
                      <p className="text-xs text-[#5a6064]">增加一层安全防护</p>
                    </div>
                    <Switch
                      checked={twoFactorEnabled}
                      className="data-[state=checked]:bg-[#0053dd] data-[state=unchecked]:bg-[#dee3e7]"
                      onCheckedChange={setTwoFactorEnabled}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-semibold">修改密码</Label>
                      <p className="text-xs text-[#5a6064]">定期更换以保证安全</p>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-[#5a6064]" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-[#f1f4f7] shadow-none">
                <CardHeader>
                  <CardTitle className="font-headline text-lg">通知偏好</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <Label className="text-sm font-semibold">翻译完成提醒</Label>
                      <p className="text-xs text-[#5a6064]">通过邮件通知任务结果</p>
                    </div>
                    <Switch
                      checked={notificationsEnabled}
                      className="data-[state=checked]:bg-[#0053dd] data-[state=unchecked]:bg-[#dee3e7]"
                      onCheckedChange={setNotificationsEnabled}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <Label className="text-sm font-semibold">活动与优惠</Label>
                      <p className="text-xs text-[#5a6064]">不要错过充值特惠</p>
                    </div>
                    <Switch
                      checked={promotionsEnabled}
                      className="data-[state=checked]:bg-[#0053dd] data-[state=unchecked]:bg-[#dee3e7]"
                      onCheckedChange={setPromotionsEnabled}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-12 w-full border-t border-slate-200 bg-[#f1f4f7] px-8 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
          <div className="font-headline font-bold text-slate-900">ComicCurator</div>
          <div className="flex flex-wrap justify-center gap-6">
            <Link
              className="text-sm text-slate-500 transition-colors hover:text-[#0053dd]"
              href="#"
            >
              Terms of Service
            </Link>
            <Link
              className="text-sm text-slate-500 transition-colors hover:text-[#0053dd]"
              href="#"
            >
              Privacy Policy
            </Link>
            <Link
              className="text-sm text-slate-500 transition-colors hover:text-[#0053dd]"
              href="#"
            >
              API Docs
            </Link>
            <Link
              className="text-sm text-slate-500 transition-colors hover:text-[#0053dd]"
              href="#"
            >
              Support
            </Link>
          </div>
          <div className="text-sm text-slate-500">
            © 2024 ComicCurator. Precision in every panel.
          </div>
        </div>
      </footer>
    </div>
  );
}
