"use client";

import { Manrope, Inter } from "next/font/google";
import Link from "next/link";
import { useState } from "react";

// Font configuration
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-manrope",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});

export default function ComicCuratorDemo() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    { question: "Can I try ComicCurator for free first?", answer: "Yes! We offer a free trial with limited translation credits to help you experience our service." },
    { question: "How do translation credits work?", answer: "Each translation consumes credits based on the complexity and length of the content. Credits refresh monthly with your subscription." },
    { question: "Can I use these credits across multiple devices?", answer: "Absolutely! Your account and credits are accessible from any device where you're logged in." },
    { question: "Why do I need to login with email or Google?", answer: "Login ensures your translations are saved and synced across devices, and helps us provide personalized service." },
    { question: "Does ComicCurator have an API?", answer: "Yes! Ultra plan includes enterprise API access for integration with your own applications." },
    { question: "Do you have a Discord community?", answer: "Yes! Join our Discord to connect with 50k+ comic enthusiasts and get support from our community." },
  ];

  return (
    <div className={`${manrope.variable} ${inter.variable} bg-[#f8f9fb] text-[#2d3337]`}>
      <style jsx global>{`
        .font-headline {
          font-family: var(--font-manrope);
        }
        .font-body {
          font-family: var(--font-inter);
        }
        .hero-gradient {
          background: linear-gradient(180deg, rgba(12, 15, 16, 0) 0%, rgba(12, 15, 16, 0.7) 100%);
        }
        .cta-gradient {
          background: linear-gradient(135deg, #3370FF 0%, #2e6dfc 100%);
        }
      `}</style>

      {/* Navigation */}
      <nav className="w-full top-0 sticky z-50 bg-[#f8f9fb] font-headline font-medium text-sm tracking-tight">
        <div className="flex justify-between items-center px-8 py-4 max-w-7xl mx-auto w-full">
          <div className="text-xl font-bold tracking-tighter text-[#2d3337]">
            ComicCurator
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link className="text-[#0053dd] font-bold border-b-2 border-[#0053dd] pb-1" href="#">功能页</Link>
            <Link className="text-[#2d3337] hover:text-[#0053dd] transition-colors" href="#">价格</Link>
            <Link className="text-[#2d3337] hover:text-[#0053dd] transition-colors" href="#">Blog</Link>
            <Link className="text-[#2d3337] hover:text-[#0053dd] transition-colors" href="#">FAQ</Link>
          </div>
          <div className="flex items-center gap-6">
            <Link className="text-[#2d3337] hover:text-[#0053dd] transition-colors" href="#">Join Discord</Link>
            <button className="bg-[#3370FF] text-white px-6 py-2.5 rounded-xl font-semibold scale-95 active:opacity-80 transition-transform shadow-sm">
              登录/个人中心
            </button>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative w-full h-[614px] min-h-[500px] flex items-end overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?q=80&w=2940&auto=format&fit=crop')`,
              filter: 'brightness(0.4) saturate(1.2)'
            }}
          />
          <div className="absolute inset-0 hero-gradient"></div>
          <div className="relative w-full max-w-[1920px] mx-auto px-8 pb-16 lg:pb-24">
            <div className="max-w-3xl">
              <h1 className="font-headline font-extrabold text-5xl lg:text-7xl text-white mb-6 tracking-tight leading-[1.1]">
                AI-Powered Comic Translation
              </h1>
              <p className="text-white/90 text-xl font-medium max-w-xl leading-relaxed font-body">
                Preserving the soul of visual storytelling through context-aware artificial intelligence and smart redraw technology.
              </p>
            </div>
          </div>
        </section>

        {/* Quick Translation Section */}
        <section className="relative z-10 px-8 -mt-20 mb-20">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white p-8 lg:p-12 rounded-[2rem] shadow-[0px_8px_24px_rgba(12,15,16,0.06)]">
              <div className="flex flex-col lg:flex-row gap-12">
                {/* Form Side */}
                <div className="flex-1 flex flex-col gap-8">
                  <div>
                    <h2 className="font-headline text-3xl font-bold text-[#2d3337] mb-2">Quick Translation Preview</h2>
                    <p className="text-[#5a6064] font-body">Start your journey from raw panels to translated masterpieces.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-[#5a6064] ml-2 font-body">Source Language</label>
                      <div className="bg-[#f1f4f7] px-4 py-3 rounded-xl flex items-center justify-between cursor-pointer hover:bg-[#ebeef1] transition-colors">
                        <span className="font-medium font-body">Japanese</span>
                        <svg className="w-5 h-5 text-[#767b7f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-[#5a6064] ml-2 font-body">Target Language</label>
                      <div className="bg-[#f1f4f7] px-4 py-3 rounded-xl flex items-center justify-between cursor-pointer hover:bg-[#ebeef1] transition-colors">
                        <span className="font-medium font-body">English</span>
                        <svg className="w-5 h-5 text-[#767b7f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <button className="cta-gradient text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-[#3370FF]/20 active:scale-[0.98] transition-transform flex items-center justify-center gap-3 font-headline">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    Start Automatic Translation
                  </button>
                </div>
                {/* Upload Area */}
                <div className="flex-1">
                  <div className="h-full min-h-[300px] border-2 border-dashed border-[#adb3b7]/30 bg-[#f1f4f7] rounded-[1.5rem] flex flex-col items-center justify-center p-8 group hover:bg-white transition-all cursor-pointer">
                    <div className="w-20 h-20 bg-[#ebeef1] rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <svg className="w-10 h-10 text-[#3370FF]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
                      </svg>
                    </div>
                    <p className="text-[#2d3337] font-bold text-xl mb-2 font-headline">Drop comic panels here</p>
                    <p className="text-[#5a6064] text-center max-w-[240px] font-body">Support for JPG, PNG, and WebP. Max 20MB per file.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="px-8 pb-24">
          <div className="max-w-[1400px] mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-[#f1f4f7] p-10 rounded-[2rem] flex flex-col gap-6">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#3370FF]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-headline text-2xl font-bold mb-4">Context-Aware AI</h3>
                  <p className="text-[#5a6064] leading-relaxed font-body">Our models don't just translate words; they understand narrative flow, character relationships, and cultural nuances within every panel.</p>
                </div>
              </div>
              <div className="bg-[#f1f4f7] p-10 rounded-[2rem] flex flex-col gap-6">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#3370FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-headline text-2xl font-bold mb-4">Smart Redrawing</h3>
                  <p className="text-[#5a6064] leading-relaxed font-body">Advanced in-painting technology automatically fills in artwork behind removed text, maintaining the original artist's brushstrokes.</p>
                </div>
              </div>
              <div className="bg-[#f1f4f7] p-10 rounded-[2rem] flex flex-col gap-6">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#3370FF]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-headline text-2xl font-bold mb-4">Style Preservation</h3>
                  <p className="text-[#5a6064] leading-relaxed font-body">We analyze original typography and SFX styles to render translated text that looks like it was part of the first printing.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Section */}
        <section className="px-8 pb-32">
          <div className="max-w-[1400px] mx-auto">
            <div className="grid grid-cols-12 grid-rows-2 gap-6 h-auto md:h-[600px]">
              <div className="col-span-12 md:col-span-8 bg-[#dee3e7] rounded-[2rem] overflow-hidden relative group">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?q=80&w=2942&auto=format&fit=crop')`,
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-10 flex flex-col justify-end">
                  <span className="bg-[#3370FF]/20 backdrop-blur-md text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest w-fit mb-4 font-body">Pro Feature</span>
                  <h4 className="text-white font-headline text-3xl font-bold mb-2">Lossless Upscaling</h4>
                  <p className="text-white/70 max-w-md font-body">Restore low-resolution scans to modern webtoon standards with a single click.</p>
                </div>
              </div>
              <div className="col-span-12 md:col-span-4 bg-[#3370FF] text-white rounded-[2rem] p-10 flex flex-col justify-between">
                <div>
                  <h4 className="font-headline text-3xl font-bold mb-6 leading-tight">Join 50k+ Curators</h4>
                  <p className="text-white/80 font-body">The largest community of comic enthusiasts, translators, and creators sharing their passion.</p>
                </div>
                <div className="flex -space-x-4">
                  <div className="w-12 h-12 rounded-full border-4 border-[#3370FF] bg-slate-300"></div>
                  <div className="w-12 h-12 rounded-full border-4 border-[#3370FF] bg-slate-400"></div>
                  <div className="w-12 h-12 rounded-full border-4 border-[#3370FF] bg-slate-500"></div>
                  <div className="w-12 h-12 rounded-full border-4 border-[#3370FF] bg-slate-200 flex items-center justify-center text-[#3370FF] text-xs font-bold">+12k</div>
                </div>
              </div>
              <div className="col-span-12 md:col-span-4 bg-[#f1f4f7] rounded-[2rem] p-10 flex flex-col justify-center items-center text-center">
                <svg className="w-12 h-12 text-[#3370FF] mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
                </svg>
                <h4 className="font-headline text-2xl font-bold mb-2">40+ Languages</h4>
                <p className="text-[#5a6064] font-body">Supporting major global languages including specialized dialects.</p>
              </div>
              <div className="col-span-12 md:col-span-8 bg-white rounded-[2rem] p-10 border border-[#ebeef1] flex items-center gap-10">
                <div className="hidden sm:block w-32 h-32 bg-[#ebeef1] rounded-2xl shrink-0 overflow-hidden">
                  <img
                    alt="Comic panel excerpt"
                    className="w-full h-full object-cover"
                    src="https://images.unsplash.com/photo-1611457194403-d3aca4cf9d11?q=80&w=2942&auto=format&fit=crop"
                  />
                </div>
                <div>
                  <h4 className="font-headline text-2xl font-bold mb-2">Visual Glossary</h4>
                  <p className="text-[#5a6064] font-body">Maintain consistency across series with character name tracking and recurring phrase detection.</p>
                  <button className="mt-4 text-[#3370FF] font-bold flex items-center gap-2 hover:gap-4 transition-all font-body">
                    Learn more
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="bg-[#f8f9fb] py-24 px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-headline text-4xl md:text-5xl font-bold text-[#2d3337] mb-4">Choose Your Plan</h2>
              <p className="text-[#5a6064] text-lg max-w-2xl mx-auto font-body">Unlock professional-grade translation tools tailored for your needs.</p>
              <div className="mt-8 inline-flex bg-[#ebeef1] rounded-full p-1 border border-[#adb3b7]/20">
                <button
                  onClick={() => setBillingCycle("monthly")}
                  className={`px-6 py-2 rounded-full text-sm font-bold transition-all font-body ${
                    billingCycle === "monthly"
                      ? "bg-white shadow-sm text-[#3370FF]"
                      : "text-[#5a6064] hover:text-[#2d3337]"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle("yearly")}
                  className={`px-6 py-2 rounded-full text-sm font-bold transition-all font-body ${
                    billingCycle === "yearly"
                      ? "bg-white shadow-sm text-[#3370FF]"
                      : "text-[#5a6064] hover:text-[#2d3337]"
                  }`}
                >
                  Yearly (Save 20%)
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Basic Plan */}
              <div className="bg-white rounded-[2rem] p-10 flex flex-col border border-[#adb3b7]/10 shadow-sm hover:shadow-xl transition-shadow">
                <h3 className="font-headline text-xl font-bold mb-2">Basic</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold font-headline">$8</span>
                  <span className="text-[#5a6064] font-body">/monthly</span>
                </div>
                <p className="text-sm text-[#5a6064] mb-8 font-medium font-body">1800 translations/mo</p>
                <button className="w-full py-4 rounded-xl border-2 border-[#3370FF] text-[#3370FF] font-bold hover:bg-[#3370FF] hover:text-white transition-all mb-10 font-headline">
                  Get Started
                </button>
                <ul className="flex flex-col gap-4">
                  <li className="flex items-start gap-3 text-sm text-[#5a6064] font-body">
                    <svg className="w-5 h-5 text-[#3370FF] mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    Priority professional recognition
                  </li>
                  <li className="flex items-start gap-3 text-sm text-[#5a6064] font-body">
                    <svg className="w-5 h-5 text-[#3370FF] mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    Standard translation models
                  </li>
                  <li className="flex items-start gap-3 text-sm text-[#5a6064] font-body">
                    <svg className="w-5 h-5 text-[#3370FF] mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    10% bonus translations
                  </li>
                  <li className="flex items-start gap-3 text-sm text-[#5a6064] font-body">
                    <svg className="w-5 h-5 text-[#3370FF] mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    No watermark
                  </li>
                </ul>
              </div>
              {/* Pro Plan */}
              <div className="bg-white rounded-[2rem] p-10 flex flex-col border-4 border-[#3370FF] shadow-xl relative scale-105 z-10">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#3370FF] text-white px-6 py-1 rounded-full text-xs font-bold uppercase tracking-widest font-body">
                  Recommended
                </div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-headline text-xl font-bold">Pro</h3>
                  <span className="bg-[#fa746f]/10 text-[#a83836] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter font-body">Save 4%</span>
                </div>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold font-headline">$30</span>
                  <span className="text-[#5a6064] font-body">/monthly</span>
                </div>
                <p className="text-sm text-[#5a6064] mb-8 font-medium font-body">7000 translations/mo</p>
                <button className="w-full py-4 rounded-xl bg-[#3370FF] text-white font-bold shadow-lg shadow-[#3370FF]/30 hover:scale-[1.02] active:scale-95 transition-all mb-10 font-headline">
                  Get Started
                </button>
                <ul className="flex flex-col gap-4">
                  <li className="flex items-start gap-3 text-sm text-[#2d3337] font-body">
                    <svg className="w-5 h-5 text-[#3370FF] mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    Fast priority processing
                  </li>
                  <li className="flex items-start gap-3 text-sm text-[#2d3337] font-body">
                    <svg className="w-5 h-5 text-[#3370FF] mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    GPT-4o & specialized models
                  </li>
                  <li className="flex items-start gap-3 text-sm text-[#2d3337] font-body">
                    <svg className="w-5 h-5 text-[#3370FF] mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    Advanced redrawing tools
                  </li>
                  <li className="flex items-start gap-3 text-sm text-[#2d3337] font-body">
                    <svg className="w-5 h-5 text-[#3370FF] mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    Bulk upload (100 images)
                  </li>
                </ul>
              </div>
              {/* Ultra Plan */}
              <div className="bg-white rounded-[2rem] p-10 flex flex-col border border-[#adb3b7]/10 shadow-sm hover:shadow-xl transition-shadow">
                <h3 className="font-headline text-xl font-bold mb-2">Ultra</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold font-headline">$80</span>
                  <span className="text-[#5a6064] font-body">/monthly</span>
                </div>
                <p className="text-sm text-[#5a6064] mb-8 font-medium font-body">Unlimited translations</p>
                <button className="w-full py-4 rounded-xl border-2 border-[#3370FF] text-[#3370FF] font-bold hover:bg-[#3370FF] hover:text-white transition-all mb-10 font-headline">
                  Get Started
                </button>
                <ul className="flex flex-col gap-4">
                  <li className="flex items-start gap-3 text-sm text-[#5a6064] font-body">
                    <svg className="w-5 h-5 text-[#3370FF] mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    Instant processing queue
                  </li>
                  <li className="flex items-start gap-3 text-sm text-[#5a6064] font-body">
                    <svg className="w-5 h-5 text-[#3370FF] mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    Enterprise API access
                  </li>
                  <li className="flex items-start gap-3 text-sm text-[#5a6064] font-body">
                    <svg className="w-5 h-5 text-[#3370FF] mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    Commercial usage license
                  </li>
                  <li className="flex items-start gap-3 text-sm text-[#5a6064] font-body">
                    <svg className="w-5 h-5 text-[#3370FF] mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    24/7 dedicated support
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-32 px-8 bg-[#f1f4f7]">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-headline text-4xl md:text-5xl font-bold text-center mb-16 text-[#2d3337]">Frequently asked questions</h2>
            <div className="flex flex-col border-t border-[#adb3b7]/20">
              {faqs.map((faq, index) => (
                <div key={index} className="group border-b border-[#adb3b7]/20">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full py-8 flex items-center justify-between text-left transition-all hover:text-[#3370FF]"
                  >
                    <span className="text-lg md:text-xl font-medium text-[#2d3337] font-headline">{faq.question}</span>
                    <svg
                      className={`w-6 h-6 text-[#767b7f] group-hover:text-[#3370FF] transition-transform ${
                        expandedFaq === index ? "rotate-45" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                  {expandedFaq === index && (
                    <div className="pb-8 px-2">
                      <p className="text-[#5a6064] font-body">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-16 text-center">
              <p className="mb-6 text-[#5a6064] font-body">Still have questions?</p>
              <button className="text-[#3370FF] font-bold hover:underline font-body">Contact our support team</button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#f1f4f7] w-full py-12 px-8 border-t border-slate-200/20">
        <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8 w-full">
          <div className="flex flex-col gap-4">
            <div className="font-headline font-bold text-slate-900 text-xl">
              ComicCurator
            </div>
            <p className="font-body text-sm tracking-wide text-slate-500">
              © 2024 ComicCurator. The Digital Curator for Visual Storytelling.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-8 font-body text-sm tracking-wide">
            <Link className="text-slate-500 hover:text-[#3370FF] transition-all" href="#">Privacy Policy</Link>
            <Link className="text-slate-500 hover:text-[#3370FF] transition-all" href="#">Terms of Service</Link>
            <Link className="text-slate-500 hover:text-[#3370FF] transition-all" href="#">API Documentation</Link>
            <Link className="text-slate-500 hover:text-[#3370FF] transition-all" href="#">Contact Support</Link>
          </div>
          <div className="flex gap-4">
            <Link className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:text-[#3370FF] transition-colors" href="#">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
            </Link>
            <Link className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:text-[#3370FF] transition-colors" href="#">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
              </svg>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}