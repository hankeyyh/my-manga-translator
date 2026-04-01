"use client";

import { Manrope, Inter } from "next/font/google";
import Link from "next/link";
import { useState } from "react";

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
      status: "completed",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC9ATpDHXc2Dc4fGjTJ_9pielutss3f1UGjzRwj2TkBlhCCiyecX6DoVU4k4J5emNklNo2zQm3D7K0D4G4gecdF-EKAMtEp9ygaCLhsBc1fJy_9AjLCk1DZp1ElweqYuZAOQeIMbbEEZrSoKZAH_ulQrE6P-V1Bw99_Xbta5fghiaTH3_J_2bXPLpBQJIQCsaLkKRDnTh8gL7y1xdSJKf5yg_s6riBW4MVaYiTe3C3JV29dqHtGS8_T4-HldozRI-JqQv2sz2k",
    },
    {
      id: 2,
      filename: "Blade_of_Fate_04.pdf",
      size: "12.1 MB",
      language: "KR → EN",
      date: "2024-05-10",
      status: "queued",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDSkq32BqXMVS0OPEoP-6n4DsIWJSeTJqL2M6JjsL0WRGojSIt53k1I_ZKdShrhAr2KUfJO38Kj2nzB4vyGxxd2moazeOrC45TFn1Pt8tGfBjIk6MZyI8TbEmxWVeRVOF4P5Pnlz0bFWuJyJXrRfL9mv4dIkBFzIKddTlx3MiPHuumgsV-88OTWVWbyrvgbR59vExR72wDJGlY6ETuxp7hsuvFR9mUjs7yhxJ-1p9xyYXr3EhZFmwn0fpRyOXEWjiK4I6bkW6E",
    },
    {
      id: 3,
      filename: "Summer_Sketch_S1.zip",
      size: "8.9 MB",
      language: "CN → EN",
      date: "2024-05-08",
      status: "completed",
      image: null,
    },
  ];

  return (
    <div className={`${manrope.variable} ${inter.variable}`}>
      <style jsx global>{`
        body {
          font-family: var(--font-inter), sans-serif;
        }
        h1, h2, h3, h4, .font-manrope {
          font-family: var(--font-manrope), sans-serif;
        }
        .glass-effect {
          backdrop-filter: blur(16px);
          background-color: rgba(248, 249, 251, 0.8);
        }
        .primary-gradient {
          background: linear-gradient(135deg, #0053dd 0%, #2e6dfc 100%);
        }
      `}</style>

      {/* TopNavBar */}
      <header className="fixed top-0 w-full z-50 bg-[#f8f9fb]/80 backdrop-blur-xl shadow-sm">
        <div className="flex justify-between items-center h-16 px-8 max-w-[1440px] mx-auto w-full text-sm font-medium tracking-tight">
          <div className="flex items-center gap-12">
            <Link className="text-xl font-bold tracking-tighter text-[#2d3337]" href="/">
              ComicCurator
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link className="text-[#0053dd] font-bold border-b-2 border-[#0053dd] pb-1" href="/demo">
                Workbench
              </Link>
              <Link className="text-[#2d3337] hover:text-[#0053dd] transition-colors" href="/demo">
                Pricing
              </Link>
              <Link className="text-[#2d3337] hover:text-[#0053dd] transition-colors" href="/demo">
                Blog
              </Link>
              <Link className="text-[#2d3337] hover:text-[#0053dd] transition-colors" href="/demo">
                FAQ
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button className="px-5 py-2 rounded-lg text-[#2d3337] hover:bg-[#f1f4f7] transition-all duration-300 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              <span>Profile</span>
            </button>
            <button className="px-6 py-2 bg-[#0053dd] text-white font-bold rounded-lg hover:opacity-90 active:scale-95 transition-all">
              Join Discord
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12 pt-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Column: User Profile & Nav */}
          <div className="md:col-span-4 lg:col-span-3 space-y-8">
            {/* User Overview Card */}
            <div className="bg-white rounded-xl p-8 border border-[#adb3b7]/15 flex flex-col items-center text-center">
              <div className="relative group mb-4">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#0053dd]/20">
                  <img
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAcDREvFTqL-a6KKMlfk1MYH8SBNlWiH_D0vtDtEopJPHkwSd_XTPjMiRwaAFHGkzQInGNUF0VxV6kY09_z6SdvvFeSL0uh5nmjMI2nWRtsVztuO6OagUAQ-JbKGEi14oxD8_YksRWjV4gHzJUFC4zAkwi3D6RoU6GH_BuPkEHhUMrOI_DJxw3JN2RwYzSyWkla28vOJPNFAmUDM-1KVzYjPwR-26OQWGy8fce3VNrM1JGrAGevBPNlMu2cBxq4wSX5uFUyWKw"
                    alt="Profile"
                  />
                </div>
                <div className="absolute bottom-4 right-0 bg-[#0053dd] text-white p-1.5 rounded-full text-xs shadow-lg hover:scale-110 transition-transform cursor-pointer">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/>
                  </svg>
                </div>
              </div>
              <h2 className="text-xl font-bold mb-1">Alex Chen</h2>
              <p className="text-[#5a6064] text-sm mb-6">alex.chen@design.com</p>
              <div className="w-full grid grid-cols-2 gap-4 pt-6 border-t border-[#ebeef1]">
                <div>
                  <p className="text-xs text-[#5a6064] uppercase tracking-wider mb-1">积分余额</p>
                  <p className="text-lg font-extrabold text-[#0053dd]">2,450</p>
                </div>
                <div>
                  <p className="text-xs text-[#5a6064] uppercase tracking-wider mb-1">已翻译</p>
                  <p className="text-lg font-extrabold text-[#2d3337]">128</p>
                </div>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="bg-[#f1f4f7] rounded-xl p-2 space-y-1">
              <Link
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white text-[#0053dd] font-bold transition-all"
                href="/demo/home"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                <span className="text-sm">个人资料</span>
              </Link>
              <Link
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#5a6064] hover:bg-[#ebeef1] transition-all"
                href="#"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-8h-2v8H5V5h8V3zm4 6V7h-3V4h3v2zm1-3h2v2h2v2h-2v2h-2v-2h-2v-2h2V3z"/>
                </svg>
                <span className="text-sm">翻译历史</span>
              </Link>
              <Link
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#5a6064] hover:bg-[#ebeef1] transition-all"
                href="#"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.8 10.9c-2.27-.59-3.5-1.68-3.5-2.62 0-.83.67-1.69 2.5-1.69 2.24 0 3.97 1.57 4.51 4h2.04c-.5-3.15-2.92-5.29-6.55-5.29C5.48 4.41 3 6.05 3 8.3c0 2.83 1.96 4.63 5.5 5.32v2.26c-.55-.02-1.07-.15-1.5-.36v2.17c.63.19 1.23.3 1.96.3 1.58 0 3.04-.36 4.12-1.04 1.63-1.08 2.92-3.17 3.23-5.59h-2.04c-.35 1.63-1.58 2.67-3.23 2.96zm11.38.68c.04-.32.08-.68.08-1.04 0-1.42-.56-2.78-1.44-3.76l-1.44 1.44c.6.89.99 2.02.99 3.22 0 .37-.04.73-.1 1.07l2.91.07zm-6.18 6.09c-1.07-.68-2.53-1.04-4.12-1.04-.73 0-1.33.11-1.96.3v2.17c.42-.21.95-.34 1.5-.36v2.26c-3.54.69-5.5 2.49-5.5 5.32 0 2.25 2.48 3.89 5.5 3.89 3.63 0 6.06-2.14 6.55-5.29h-2.04c-.54 2.43-2.27 4-4.51 4-1.83 0-2.5-.86-2.5-1.69 0-.94 1.23-2.03 3.5-2.62v2.26c1.65.29 2.88 1.33 3.23 2.96h2.04c-.31-2.42-1.6-4.51-3.23-5.59zm-7.7-5.86l-1.44-1.44C5.56 8.22 5 9.58 5 11c0 .36.04.72.1 1.07l2.91-.07c-.05-.34-.09-.7-.09-1.07 0-1.2.39-2.33.99-3.22z"/>
                </svg>
                <span className="text-sm">账单与订阅</span>
              </Link>
              <Link
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#5a6064] hover:bg-[#ebeef1] transition-all"
                href="#"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.62l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.48.1.62l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.62l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.48-.1-.62l-2.03-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
                </svg>
                <span className="text-sm">通用设置</span>
              </Link>
              <div className="pt-4 mt-4 border-t border-[#dee3e7]">
                <Link
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#a83836] hover:bg-[#fa746f]/10 transition-all"
                  href="#"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                  </svg>
                  <span className="text-sm">退出登录</span>
                </Link>
              </div>
            </nav>
          </div>

          {/* Right Column: Dashboard Content */}
          <div className="md:col-span-8 lg:col-span-9 space-y-8">
            {/* Membership / Upsell Section */}
            <div className="relative overflow-hidden rounded-xl bg-[#dee3e7] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="relative z-10 space-y-2">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#0053dd]/10 text-[#0053dd] text-xs font-bold uppercase tracking-widest">
                  PRO MEMBER
                </div>
                <h3 className="text-2xl font-extrabold">升级至专业版</h3>
                <p className="text-[#5a6064] max-w-md">解锁批量翻译、高保真字体渲染及无限云端存储空间。</p>
                <div className="pt-2">
                  <button className="px-8 py-3 rounded-full primary-gradient text-white font-bold text-sm shadow-xl shadow-[#0053dd]/20 hover:scale-105 transition-transform">
                    立即充值 / 升级
                  </button>
                </div>
              </div>
              <div className="relative hidden lg:block">
                <div className="w-48 h-48 bg-[#0053dd]/5 rounded-full absolute -top-24 -right-12 blur-3xl"></div>
                <div className="w-48 h-48 bg-[#595e72]/5 rounded-full absolute -bottom-24 -right-24 blur-3xl"></div>
                <svg className="w-32 h-32 text-[#0053dd]/10 select-none" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
            </div>

            {/* History Records */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">历史记录</h3>
                <button className="text-[#0053dd] text-sm font-semibold flex items-center gap-1 hover:underline">
                  查看全部
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z"/>
                  </svg>
                </button>
              </div>
              <div className="bg-white rounded-xl overflow-hidden border border-[#adb3b7]/15">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f1f4f7]/50">
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#5a6064]">文件名</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#5a6064]">日期</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#5a6064]">状态</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#5a6064] text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ebeef1]">
                    {historyRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-[#f1f4f7] transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            {record.image ? (
                              <div className="w-10 h-12 bg-[#ebeef1] rounded overflow-hidden flex-shrink-0">
                                <img className="w-full h-full object-cover" src={record.image} alt={record.filename} />
                              </div>
                            ) : (
                              <div className="w-10 h-12 bg-[#dee3e7] rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
                                <svg className="w-5 h-5 text-[#5a6064]/40" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                                </svg>
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-sm">{record.filename}</p>
                              <p className="text-xs text-[#5a6064]">
                                {record.size} • {record.language}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm text-[#5a6064]">{record.date}</td>
                        <td className="px-6 py-5">
                          {record.status === "completed" ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                              完成
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                              队列中
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-5 text-right flex justify-end gap-2">
                          <button
                            className={`p-2 rounded-lg transition-colors ${
                              record.status === "completed"
                                ? "text-[#0053dd] hover:bg-[#0053dd]/10"
                                : "text-[#5a6064] cursor-not-allowed opacity-30"
                            }`}
                            disabled={record.status !== "completed"}
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                            </svg>
                          </button>
                          <button className="p-2 rounded-lg text-[#5a6064] hover:bg-[#ebeef1] transition-colors">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Personal Settings Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Account Security */}
              <div className="bg-[#f1f4f7] rounded-xl p-8 space-y-6">
                <h4 className="text-lg font-bold">账户安全</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-semibold">两步验证</p>
                      <p className="text-xs text-[#5a6064]">增加一层安全防护</p>
                    </div>
                    <div
                      onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                      className="w-12 h-6 bg-[#dee3e7] rounded-full p-1 cursor-pointer flex transition-colors"
                      style={{ backgroundColor: twoFactorEnabled ? "#0053dd" : "#dee3e7" }}
                    >
                      <div
                        className="w-4 h-4 bg-white rounded-full shadow-sm transition-transform"
                        style={{ transform: twoFactorEnabled ? "translateX(24px)" : "translateX(0)" }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-semibold">修改密码</p>
                      <p className="text-xs text-[#5a6064]">定期更换以保证安全</p>
                    </div>
                    <svg className="w-5 h-5 text-[#5a6064]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Notification Preferences */}
              <div className="bg-[#f1f4f7] rounded-xl p-8 space-y-6">
                <h4 className="text-lg font-bold">通知偏好</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-semibold">翻译完成提醒</p>
                      <p className="text-xs text-[#5a6064]">通过邮件通知任务结果</p>
                    </div>
                    <div
                      onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                      className="w-12 h-6 bg-[#dee3e7] rounded-full p-1 cursor-pointer flex transition-colors"
                      style={{ backgroundColor: notificationsEnabled ? "#0053dd" : "#dee3e7" }}
                    >
                      <div
                        className="w-4 h-4 bg-white rounded-full shadow-sm transition-transform"
                        style={{ transform: notificationsEnabled ? "translateX(24px)" : "translateX(0)" }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-semibold">活动与优惠</p>
                      <p className="text-xs text-[#5a6064]">不要错过充值特惠</p>
                    </div>
                    <div
                      onClick={() => setPromotionsEnabled(!promotionsEnabled)}
                      className="w-12 h-6 bg-[#dee3e7] rounded-full p-1 cursor-pointer flex transition-colors"
                      style={{ backgroundColor: promotionsEnabled ? "#0053dd" : "#dee3e7" }}
                    >
                      <div
                        className="w-4 h-4 bg-white rounded-full shadow-sm transition-transform"
                        style={{ transform: promotionsEnabled ? "translateX(24px)" : "translateX(0)" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 px-8 bg-[#f1f4f7] border-t border-slate-200 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 max-w-7xl mx-auto">
          <div className="font-bold text-slate-900">ComicCurator</div>
          <div className="flex flex-wrap justify-center gap-6">
            <Link className="text-slate-500 hover:text-[#0053dd] transition-colors text-sm" href="#">
              Terms of Service
            </Link>
            <Link className="text-slate-500 hover:text-[#0053dd] transition-colors text-sm" href="#">
              Privacy Policy
            </Link>
            <Link className="text-slate-500 hover:text-[#0053dd] transition-colors text-sm" href="#">
              API Docs
            </Link>
            <Link className="text-slate-500 hover:text-[#0053dd] transition-colors text-sm" href="#">
              Support
            </Link>
          </div>
          <div className="text-sm text-slate-500">© 2024 ComicCurator. Precision in every panel.</div>
        </div>
      </footer>
    </div>
  );
}
