'use client';

import React, { useState } from 'react';
import {
  Smartphone,
  Sparkles,
  Bell,
  CheckCircle2,
  Play,
  Search,
  BookOpen,
  Volume2,
  Video,
  Compass,
  Headphones,
  Radio,
  ArrowRight,
} from 'lucide-react';
import Logo from './Logo';

export default function MobileAppShowcase() {
  const [notificationType, setNotificationType] = useState<'email' | 'whatsapp'>('email');
  const [contactValue, setContactValue] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactValue.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 600);
  };

  return (
    <section
      id="mobile-app"
      className="py-20 sm:py-28 px-4 sm:px-6 md:px-8 border-t border-black/8 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* LEFT: Context & Notification Form */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            {/* Development Announcement Label */}
            <div className="inline-flex items-center gap-2 mb-6 self-start">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium tracking-wide bg-[#F1F1EC] border border-black/8 text-[#171717]">
                <span className="w-2 h-2 rounded-full bg-[#FF713F] animate-pulse" />
                Currently in development
              </span>
            </div>

            {/* Exact Section Heading */}
            <h2 className="font-serif-heading text-3xl sm:text-4xl md:text-5xl font-normal text-[#171717] tracking-tight mb-6 leading-[1.15]">
              Your favourite Islamic content. <br className="hidden sm:inline" />
              Wherever life takes you.
            </h2>

            {/* Exact Section Description */}
            <p className="text-[15px] sm:text-[16px] text-[#55554F] leading-[1.65] font-sans mb-8">
              We are building a dedicated mobile experience to bring Islamic knowledge closer to
              every Muslim in Malawi. Listen to your favourite preachings, watch khutbahs, and stay
              connected to meaningful teachings, all from your phone.
            </p>

            {/* Key Upcoming App Features list */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-xs text-[#55554F]">
                <span className="w-5 h-5 rounded-full bg-black/5 flex items-center justify-center text-[#171717] font-semibold">
                  ✓
                </span>
                <span>Background audio playback for commutes and daily work</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#55554F]">
                <span className="w-5 h-5 rounded-full bg-black/5 flex items-center justify-center text-[#171717] font-semibold">
                  ✓
                </span>
                <span>Offline caching to save mobile data in low-coverage areas</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-[#55554F]">
                <span className="w-5 h-5 rounded-full bg-black/5 flex items-center justify-center text-[#171717] font-semibold">
                  ✓
                </span>
                <span>Weekly Friday Khutbah notifications from your local district</span>
              </div>
            </div>

            {/* Notification Registration Form ("Be the first to know") */}
            <div className="p-6 rounded-2xl bg-[#F1F1EC] border border-black/8 max-w-md">
              <h3 className="font-serif-heading text-xl text-[#171717] font-medium mb-1">
                Be the first to know
              </h3>
              <p className="text-xs text-[#55554F] mb-4">
                Register to receive an early access invite when the mobile app enters preview in
                Malawi.
              </p>

              {isSubmitted ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-emerald-900">
                      You&apos;re on the early access list!
                    </p>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      We will notify you at <span className="font-medium">{contactValue}</span> as
                      soon as the application is ready.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  {/* Toggle between Email / WhatsApp */}
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setNotificationType('email')}
                      className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                        notificationType === 'email'
                          ? 'bg-[#171717] text-white'
                          : 'bg-black/5 text-[#55554F]'
                      }`}
                    >
                      Email update
                    </button>
                    <button
                      type="button"
                      onClick={() => setNotificationType('whatsapp')}
                      className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                        notificationType === 'whatsapp'
                          ? 'bg-[#171717] text-white'
                          : 'bg-black/5 text-[#55554F]'
                      }`}
                    >
                      WhatsApp SMS
                    </button>
                  </div>

                  {/* Input and Submit */}
                  <div className="flex gap-2">
                    <input
                      type={notificationType === 'email' ? 'email' : 'tel'}
                      value={contactValue}
                      onChange={(e) => setContactValue(e.target.value)}
                      placeholder={
                        notificationType === 'email'
                          ? 'your.email@domain.com'
                          : '+265 (Malawi phone number)'
                      }
                      required
                      className="flex-1 bg-white text-xs text-[#171717] placeholder-[#55554F]/70 px-3.5 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:border-[#171717]"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2.5 rounded-xl bg-[#171717] text-white text-xs font-medium hover:bg-black/90 active:scale-98 transition-all shrink-0 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? 'Joining...' : 'Notify me'}
                    </button>
                  </div>
                  <p className="text-[10px] text-[#55554F]/80">
                    No spam. You will only receive a notification upon release.
                  </p>
                </form>
              )}
            </div>
          </div>

          {/* RIGHT: High Quality Smartphone Mockup with Real In-App UI */}
          <div className="lg:col-span-6 flex items-center justify-center">
            {/* Phone Chassis Container */}
            <div className="relative w-[300px] sm:w-[330px] rounded-[44px] bg-[#1C1C1A] p-3 shadow-2xl border-[5px] border-[#2C2C28] ring-1 ring-black/20">
              {/* Dynamic Island / Speaker Pill */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2 w-24 h-5 bg-[#0D0D0C] rounded-full z-30 flex items-center justify-between px-3">
                <span className="w-2 h-2 rounded-full bg-black/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#1A1A18] border border-white/5" />
              </div>

              {/* Phone Screen Glass */}
              <div className="relative w-full h-[620px] bg-[#DADAD4] rounded-[36px] overflow-hidden flex flex-col justify-between text-[#171717] select-none border border-black/10">
                {/* Status Bar */}
                <div className="pt-3 px-6 pb-2 flex items-center justify-between text-[11px] font-medium text-[#171717] z-20">
                  <span>09:41</span>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span>5G</span>
                    <span className="w-4 h-2 rounded-xs border border-current flex items-center p-0.5">
                      <span className="w-full h-full bg-current rounded-2xs" />
                    </span>
                  </div>
                </div>

                {/* App Content Scrollable Mock */}
                <div className="flex-1 px-4 pt-4 pb-2 space-y-3.5 overflow-hidden">
                  {/* App Header */}
                  <div className="flex items-center justify-between">
                    <Logo size="sm" />
                    <div className="w-7 h-7 rounded-full bg-[#F1F1EC] border border-black/8 flex items-center justify-center">
                      <Bell className="w-3.5 h-3.5 text-[#55554F]" />
                    </div>
                  </div>

                  {/* App Search Bar */}
                  <div className="flex items-center gap-2 bg-[#F1F1EC] px-3 py-2 rounded-xl border border-black/6 text-xs text-[#55554F]">
                    <Search className="w-3.5 h-3.5 text-[#55554F]" />
                    <span className="text-[11px]">Search khutbahs & preachings...</span>
                  </div>

                  {/* Quick Category Chips */}
                  <div className="flex gap-1.5 overflow-hidden text-[10px] font-medium">
                    <span className="px-2.5 py-1 rounded-full bg-[#171717] text-white">
                      Preachings
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-[#F1F1EC] text-[#55554F] border border-black/6">
                      Khutbahs
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-[#F1F1EC] text-[#55554F] border border-black/6">
                      Quran
                    </span>
                  </div>

                  {/* App Featured Preaching Card */}
                  <div className="p-3.5 rounded-2xl bg-[#F1F1EC] border border-black/8 shadow-2xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] uppercase font-semibold text-[#FF713F] tracking-wide">
                        Featured Khutbah
                      </span>
                      <span className="text-[9px] font-mono text-[#55554F]">28:40</span>
                    </div>
                    <h4 className="font-serif-heading text-base font-semibold text-[#171717] leading-tight mb-1">
                      The Importance of Salah
                    </h4>
                    <p className="text-[10px] text-[#55554F] mb-3">
                      Sheikh Yusuf Banda • Blantyre Central Mosque
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-black/5">
                      <span className="inline-flex items-center gap-1 text-[10px] text-[#55554F]">
                        <Headphones className="w-3 h-3 text-[#D6A82E]" />
                        <span>Chichewa audio</span>
                      </span>
                      <div className="w-6 h-6 rounded-full bg-[#171717] text-white flex items-center justify-center shadow-xs">
                        <Play className="w-3 h-3 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Recent uploads mock item */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-semibold text-[#55554F] uppercase tracking-wider block">
                      Recently Added
                    </span>
                    <div className="p-2.5 rounded-xl bg-[#F1F1EC] border border-black/6 flex items-center justify-between">
                      <div className="truncate pr-2">
                        <p className="text-[11px] font-medium text-[#171717] truncate">
                          Preparing Our Hearts for Ramadan
                        </p>
                        <p className="text-[9px] text-[#55554F]">Ustadh Ibrahim Mataka • Lilongwe</p>
                      </div>
                      <span className="px-1.5 py-0.5 rounded bg-black/5 text-[9px] text-[#55554F] shrink-0">
                        Video
                      </span>
                    </div>
                  </div>
                </div>

                {/* Floating Mini Player on Mobile */}
                <div className="mx-3 mb-2 p-2.5 rounded-2xl bg-[#171717] text-white flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-2 truncate">
                    <div className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                      <Volume2 className="w-3.5 h-3.5 text-[#FF713F]" />
                    </div>
                    <div className="truncate">
                      <p className="text-[10px] font-medium text-white truncate">
                        Understanding Jumu’ah Khutbah
                      </p>
                      <p className="text-[8px] text-white/60 truncate">Sheikh Muhammad Phiri</p>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 ml-2">
                    <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                  </div>
                </div>

                {/* Mobile Bottom Tab Bar */}
                <div className="bg-[#F1F1EC] border-t border-black/8 py-2.5 px-6 flex items-center justify-between text-[#55554F]">
                  <div className="flex flex-col items-center gap-0.5 text-[#171717]">
                    <Radio className="w-3.5 h-3.5" />
                    <span className="text-[8px] font-medium">Home</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span className="text-[8px]">Teachings</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <Compass className="w-3.5 h-3.5" />
                    <span className="text-[8px]">Malawi</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span className="text-[8px]">Library</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
