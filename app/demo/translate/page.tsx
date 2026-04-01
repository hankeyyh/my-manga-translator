"use client";

import { Manrope, Inter } from "next/font/google";
import Link from "next/link";
import { useState } from "react";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["200", "400", "600", "800"],
  variable: "--font-manrope",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
});

export default function TranslateWorkbench() {
  const [zoom, setZoom] = useState(100);
  const [showSettings, setShowSettings] = useState(false);
  const [engine, setEngine] = useState("GPT-4o Vision");
  const [sourceLang, setSourceLang] = useState("JPN");
  const [targetLang, setTargetLang] = useState("ENG");
  const [style, setStyle] = useState("WildWords BB");
  const [activeTab, setActiveTab] = useState(0);
  /** 左侧竖条：0 设置 1 历史 2 图层 3 魔法棒 4 帮助 */
  const [leftTool, setLeftTool] = useState(0);

  const thumbnails = [
    { id: 1, label: "PAGE 01", status: "active", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDVgPiUCUOaLyzK97yM_eskfUDY5SdtoRxSM2x3xk2O3wMrJbAYt-PlT9a38tNB7B8kvBH4ilidXeI_Wl8zxJYLF3O1qAX_EL6XhAsP9MGXt10AuYLQKlLqoMYAci_GEO-tbc9P67ncL4n9OprdHIz7bYAS3GBK11TvMjol6SDlTt0db3XoAysE-90Pwrwt26BJfeuW51Xjyn2w8JWeBPFDzHtBvNIoo71QPMWD4lRtSZCQwSUio4lgfQnGirbet7ISZC9FN8U" },
    { id: 2, label: "PAGE 02", status: "completed", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDywl8KjHUH1F0ck3WN6-3N2phaKoEjSP3NhuxqeIBFrLQjfu9A0-oe4GYpY2R3Dt_ek8Wj3cU48aTxeLMJAJC0UWlcvMiu626E3PRYGRK-DUHziRHvfLa8fKkymVpshh-CM085fL6Gz6bQrXX_qvsdtqyxvM9TmirhQ2jc72xLvAX2nsQKDqQfYRcNOG5RuFXRoDwpxI4bTxoCg7eUpdizrIFr8_RXIHJVNDrEZhE4bzTLU3L0YCeQOetpBXp94Ui7u7sL548" },
    { id: 3, label: "PAGE 03", status: "processing", progress: 65, image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBR5Tj7_TwjuUmLbMM3Be1DvbRvahwb8SJjNGwcJtVinj9OgjP2MwolPmPVeuBjRPYl6uCDiCB982HdnD_pwyI8e2ubeNr-1VVhApEGYofqp6RAfjBikD6mefZlovyNXth1kUmTAtXg9eJUrqDW1UR_caYJndn-lHDH7OLHsOUjCWWkuqsz38OV_pbXav1nMvJKeiZehW10ZmXK2Vmopljxv9OmhwhB7Hae-SOMTttdg2dLlgmBLDDGSbglYH7c9n2Qb1q46W8" },
  ];

  const zoomIn = () => setZoom(Math.min(zoom + 25, 200));
  const zoomOut = () => setZoom(Math.max(zoom - 25, 50));

  return (
    <div className={`${manrope.variable} ${inter.variable}`}>
      <style jsx global>{`
        body {
          font-family: var(--font-inter), sans-serif;
        }
        h1, h2, h3, h4, .font-manrope {
          font-family: var(--font-manrope), sans-serif;
        }
        .glass-panel {
          backdrop-filter: blur(12px);
          background: rgba(248, 249, 251, 0.8);
        }
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #dee3e7;
          border-radius: 10px;
        }
        .settings-dropdown {
          opacity: 0;
          visibility: hidden;
          transform: translateY(-10px);
          transition: all 0.2s ease-out;
          pointer-events: none;
        }
        .settings-open .settings-dropdown {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
          pointer-events: auto;
        }
      `}</style>

      <main className="flex flex-col h-screen pt-16 bg-[#f8f9fb]">
        {/* TopNavBar */}
        <header className="fixed top-0 w-full z-50 bg-[#f8f9fb]/80 backdrop-blur-xl shadow-sm">
          <div className="flex justify-between items-center h-16 px-8 max-w-[1440px] mx-auto w-full">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0053dd] flex items-center justify-center text-white">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18 3H6c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H6V5h12v14z"/>
                    <path d="M8 8h8v2H8zm0 4h8v2H8zm0 4h5v2H8z"/>
                  </svg>
                </div>
                <span className="text-xl font-bold tracking-tighter text-[#2d3337]">ComicCurator</span>
              </div>
              <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                <Link className="text-[#0053dd] font-bold border-b-2 border-[#0053dd] pb-1" href="/demo">
                  Workbench (功能页)
                </Link>
                <Link className="text-[#2d3337] hover:text-[#0053dd] transition-colors" href="/demo">
                  Pricing (价格)
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
              <button className="px-5 py-2 bg-[#0053dd] text-white text-sm font-bold rounded-full hover:opacity-90 transition-all scale-95 active:opacity-80">
                Join Discord
              </button>
              <button className="w-10 h-10 rounded-full bg-[#dee3e7] flex items-center justify-center hover:bg-[#f1f4f7] transition-all">
                <svg className="w-6 h-6 text-[#2d3337]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex flex-col p-6 gap-4 overflow-hidden">
          {/* Editor Section */}
          <section className="flex-1 bg-[#f1f4f7] rounded-3xl relative overflow-hidden flex flex-col border border-white/40 shadow-sm min-h-0">
            {/* 左侧竖向工具条 + 设置面板 */}
            <div
              className={`absolute left-5 top-1/2 z-20 -translate-y-1/2 flex items-start gap-0 group ${showSettings ? "settings-open" : ""}`}
            >
              <nav
                className="flex flex-col gap-1 rounded-[28px] bg-white p-2 shadow-[0_4px_20px_rgba(15,23,42,0.08)] border border-[#eef0f3]"
                aria-label="Workbench tools"
              >
                <button
                  type="button"
                  title="设置"
                  onClick={() => {
                    setLeftTool(0);
                    setShowSettings(!showSettings);
                  }}
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                    leftTool === 0
                      ? "bg-[#0053dd] text-white shadow-sm"
                      : "text-[#5F6368] hover:bg-[#f1f3f5]"
                  }`}
                >
                  <svg className="h-[22px] w-[22px]" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.62l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.48.1.62l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.62l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.48-.1-.62l-2.03-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
                  </svg>
                </button>
                <button
                  type="button"
                  title="历史"
                  onClick={() => {
                    setLeftTool(1);
                    setShowSettings(false);
                  }}
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                    leftTool === 1
                      ? "bg-[#0053dd] text-white shadow-sm"
                      : "text-[#5F6368] hover:bg-[#f1f3f5]"
                  }`}
                >
                  <svg className="h-[22px] w-[22px]" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <button
                  type="button"
                  title="图层"
                  onClick={() => {
                    setLeftTool(2);
                    setShowSettings(false);
                  }}
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                    leftTool === 2
                      ? "bg-[#0053dd] text-white shadow-sm"
                      : "text-[#5F6368] hover:bg-[#f1f3f5]"
                  }`}
                >
                  <svg className="h-[22px] w-[22px]" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3L4 8l8 5 8-5-8-5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 13l8 5 8-5M4 18l8 5 8-5" />
                  </svg>
                </button>
                <button
                  type="button"
                  title="魔法 / 自动"
                  onClick={() => {
                    setLeftTool(3);
                    setShowSettings(false);
                  }}
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                    leftTool === 3
                      ? "bg-[#0053dd] text-white shadow-sm"
                      : "text-[#5F6368] hover:bg-[#f1f3f5]"
                  }`}
                >
                  <svg className="h-[22px] w-[22px]" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 4l1.5 3 3 1.5-3 1.5L15 13l-1.5-3-3-1.5 3-1.5L15 4z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 14l2 4 4 2-2-4-4-2z" />
                  </svg>
                </button>
                <button
                  type="button"
                  title="帮助"
                  onClick={() => {
                    setLeftTool(4);
                    setShowSettings(false);
                  }}
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                    leftTool === 4
                      ? "bg-[#0053dd] text-white shadow-sm"
                      : "text-[#5F6368] hover:bg-[#f1f3f5]"
                  }`}
                >
                  <svg className="h-[22px] w-[22px]" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.09 9a3 3 0 115.82 1c0 2-3 2-3 4M12 17h.01" />
                  </svg>
                </button>
              </nav>

              {/* Settings Dropdown */}
              <div className="settings-dropdown absolute left-full top-0 ml-3 min-w-[280px]">
                <div className="glass-panel rounded-2xl border border-white p-4 shadow-xl flex flex-col gap-3">
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[10px] font-bold text-[#5a6064] uppercase tracking-wider opacity-60">
                      Translation Engine
                    </label>
                    <div className="flex items-center justify-between cursor-pointer group/select">
                      <span className="text-sm font-bold text-[#0053dd]">{engine}</span>
                      <svg className="w-4 h-4 text-[#0053dd]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7 10l5 5 5-5z"/>
                      </svg>
                    </div>
                  </div>

                  <div className="flex gap-8 border-t border-[#dee3e7] pt-3">
                    <div className="flex flex-col gap-0.5">
                      <label className="text-[10px] font-bold text-[#5a6064] uppercase tracking-wider opacity-60">
                        Languages
                      </label>
                      <div className="flex items-center gap-2 text-sm font-bold">
                        <input
                          type="text"
                          value={sourceLang}
                          onChange={(e) => setSourceLang(e.target.value)}
                          className="w-12 px-1 py-0.5 bg-[#f8f9fb] border border-[#dee3e7] rounded text-center text-[#0053dd] font-bold"
                        />
                        <svg className="w-4 h-4 text-[#767b7f]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z"/>
                        </svg>
                        <input
                          type="text"
                          value={targetLang}
                          onChange={(e) => setTargetLang(e.target.value)}
                          className="w-12 px-1 py-0.5 bg-[#f8f9fb] border border-[#dee3e7] rounded text-center text-[#0053dd] font-bold"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <label className="text-[10px] font-bold text-[#5a6064] uppercase tracking-wider opacity-60">
                        Style
                      </label>
                      <select
                        value={style}
                        onChange={(e) => setStyle(e.target.value)}
                        className="text-sm font-bold text-[#2d3337] bg-[#f8f9fb] border border-[#dee3e7] rounded px-2 py-0.5"
                      >
                        <option>WildWords BB</option>
                        <option>Standard</option>
                        <option>Artistic</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Comparison Canvas */}
            <div className="flex-1 flex gap-6 p-10 bg-[#ebeef1] overflow-hidden">
              {/* Original View */}
              <div className="flex-1 flex flex-col gap-2">
                <span className="text-[10px] font-bold text-[#5a6064] uppercase tracking-widest text-center">
                  Original ({sourceLang})
                </span>
                <div className="flex-1 relative bg-white shadow-xl rounded-lg overflow-hidden flex items-center justify-center" style={{ transform: `scale(${zoom / 100})`, transformOrigin: "center" }}>
                  <img
                    alt="Original Comic Panel"
                    className="max-w-full max-h-full object-contain"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBrqwCvr4u6lLJro2yZnUVvS_GxBmnt4S-3952C8fh_1XNIBpXnK4igZgLtDC0NTtJaI4ArH9Y_ISpTFIDyynWlHr06LWuTn_OOEg5kXFMPIVIFhNozBhDsv23nzJjzeoLS7pe--GA0XfDv_YPqW4CwOCHw56RwozYwvYL-iTno2HB8Fmi1wR8-cRk-7qeNrRVN5sp_22VzPwbv9oPQP5XgiJ0X0KgDDv1AjR9NGfKz0pfTVeKV65SSnPNpUmlnjRYq1KVGoCQ"
                  />
                  <div className="absolute inset-0 bg-black/5"></div>
                </div>
              </div>

              {/* Translated View */}
              <div className="flex-1 flex flex-col gap-2">
                <span className="text-[10px] font-bold text-[#0053dd] uppercase tracking-widest text-center">
                  Translated ({targetLang})
                </span>
                <div className="flex-1 relative bg-white shadow-xl rounded-lg overflow-hidden flex items-center justify-center" style={{ transform: `scale(${zoom / 100})`, transformOrigin: "center" }}>
                  <img
                    alt="Translated Comic Panel"
                    className="max-w-full max-h-full object-contain opacity-40 mix-blend-multiply"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBrqwCvr4u6lLJro2yZnUVvS_GxBmnt4S-3952C8fh_1XNIBpXnK4igZgLtDC0NTtJaI4ArH9Y_ISpTFIDyynWlHr06LWuTn_OOEg5kXFMPIVIFhNozBhDsv23nzJjzeoLS7pe--GA0XfDv_YPqW4CwOCHw56RwozYwvYL-iTno2HB8Fmi1wR8-cRk-7qeNrRVN5sp_22VzPwbv9oPQP5XgiJ0X0KgDDv1AjR9NGfKz0pfTVeKV65SSnPNpUmlnjRYq1KVGoCQ"
                  />
                  {/* Floating Text Overlays */}
                  <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-3/4 p-3 bg-white/90 backdrop-blur-sm rounded-lg border-2 border-[#0053dd] shadow-xl cursor-move hover:shadow-2xl transition-shadow">
                    <p className="text-center font-bold text-lg leading-tight text-[#2d3337]">Wait! I can explain everything!</p>
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-[#0053dd] text-white rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/>
                      </svg>
                    </div>
                  </div>
                  <div className="absolute bottom-1/4 right-8 w-1/3 p-2 bg-white/90 backdrop-blur-sm rounded-lg border-2 border-[#0053dd] shadow-xl cursor-move hover:shadow-2xl transition-shadow">
                    <p className="text-center font-bold text-sm leading-tight text-[#2d3337] italic">He... he did what?!</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Batch Processing Bar */}
          <section className="h-32 shrink-0 flex gap-4">
            {/* Action Column */}
            <div className="w-48 flex flex-col gap-2">
              <button className="flex-1 flex items-center justify-start px-4 gap-3 bg-[#dee3e7] text-[#2d3337] font-bold rounded-xl hover:bg-[#d5dbdf] transition-all group text-xs">
                <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center shadow-sm group-hover:bg-[#0053dd] group-hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                  </svg>
                </div>
                <span>Upload Artwork</span>
              </button>
              <button className="flex-1 flex items-center justify-start px-4 gap-3 bg-[#0053dd] text-white font-bold rounded-xl hover:opacity-90 transition-all text-xs">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                </svg>
                <span>Start All</span>
              </button>
              <button className="flex-1 flex items-center justify-start px-4 gap-3 bg-white border border-[#dee3e7] text-[#5a6064] font-bold rounded-xl hover:border-[#0053dd] hover:text-[#0053dd] transition-all text-xs">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                <span>Download All</span>
              </button>
            </div>

            {/* Thumbnails List */}
            <div className="flex-1 bg-[#f1f4f7] rounded-2xl p-2 flex gap-3 overflow-x-auto custom-scrollbar">
              {thumbnails.map((thumb, index) => (
                <div
                  key={thumb.id}
                  onClick={() => setActiveTab(index)}
                  className={`flex-shrink-0 w-24 h-full rounded-xl p-1.5 flex flex-col relative group transition-all cursor-pointer ${
                    thumb.status === "active"
                      ? "bg-white border-2 border-[#0053dd]"
                      : "bg-white border border-transparent hover:border-[#dee3e7]"
                  }`}
                >
                  <div className={`flex-1 rounded-lg overflow-hidden mb-1 relative ${thumb.status === "completed" ? "grayscale group-hover:grayscale-0" : ""}`}>
                    {thumb.status === "processing" && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      </div>
                    )}
                    <img className="w-full h-full object-cover" src={thumb.image} alt={thumb.label} />
                  </div>
                  <div className="flex items-center justify-between px-0.5">
                    <span className={`text-[9px] font-bold uppercase ${thumb.status === "active" ? "text-[#0053dd]" : "text-[#5a6064]"}`}>
                      {thumb.label}
                    </span>
                    {thumb.status === "active" && (
                      <div className="w-1.5 h-1.5 rounded-full bg-[#0053dd] animate-pulse"></div>
                    )}
                    {thumb.status === "completed" && (
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    )}
                    {thumb.status === "processing" && (
                      <span className="text-[8px] font-bold text-[#5a6064] italic">{thumb.progress}%</span>
                    )}
                  </div>
                  {thumb.status !== "active" && (
                    <div className="absolute inset-0 bg-[#0053dd]/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
                  )}
                </div>
              ))}

              {/* Add Page Button */}
              <div className="flex-shrink-0 w-24 h-full border border-dashed border-[#dee3e7] rounded-xl flex flex-col items-center justify-center gap-1 group hover:border-[#0053dd] transition-colors cursor-pointer bg-white">
                <svg className="w-5 h-5 text-[#dee3e7] group-hover:text-[#0053dd] transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
                <span className="text-[9px] font-bold text-[#5a6064]">Add Page</span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
