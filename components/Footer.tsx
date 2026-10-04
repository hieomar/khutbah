'use client';

import React, { useState, useEffect } from 'react';
import { ArrowUp, Heart, Globe, Radio } from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
  const [malawiTime, setMalawiTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const timeStr = new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Africa/Blantyre',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }).format(now);
        setMalawiTime(timeStr);
      } catch (e) {
        setMalawiTime('12:00:00');
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -80;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <footer className="border-t border-black/8 bg-[#D3D3CD]/30 pt-16 pb-12 px-4 sm:px-6 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-black/8">
          {/* Brand & Mission */}
          <div className="md:col-span-5 space-y-4">
            <Logo size="md" />
            <p className="text-xs sm:text-[13px] text-[#55554F] leading-relaxed max-w-sm">
              An accessible digital sanctuary for Islamic preachings, Friday khutbahs, Quranic
              recitations, and educational discussions across Malawi.
            </p>
            {/* Live Malawi Local Time indicator */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F1F1EC] border border-black/6 text-[11px] text-[#55554F]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D6A82E]" />
              <span>Blantyre & Lilongwe Time:</span>
              <span className="font-mono font-medium text-[#171717]">{malawiTime} CAT (UTC+2)</span>
            </div>
          </div>

          {/* Platform Navigation */}
          <div className="md:col-span-3 space-y-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#171717] block">
              Platform Navigation
            </span>
            <ul className="space-y-2 text-xs text-[#55554F]">
              <li>
                <button
                  onClick={() => scrollTo('explore-content')}
                  className="hover:text-[#171717] transition-colors cursor-pointer"
                >
                  Explore Content
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('categories')}
                  className="hover:text-[#171717] transition-colors cursor-pointer"
                >
                  Categories & Preachings
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('media-experience')}
                  className="hover:text-[#171717] transition-colors cursor-pointer"
                >
                  Listen & Watch Experience
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('community')}
                  className="hover:text-[#171717] transition-colors cursor-pointer"
                >
                  Malawi Community Hubs
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('about')}
                  className="hover:text-[#171717] transition-colors cursor-pointer"
                >
                  About Our Mission
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('mobile-app')}
                  className="hover:text-[#171717] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>Upcoming Mobile App</span>
                  <span className="text-[10px] text-[#FF713F] font-semibold">Soon</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Community & Categories */}
          <div className="md:col-span-4 space-y-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#171717] block">
              Malawi Regions Archiving
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs text-[#55554F]">
              <span className="hover:text-[#171717]">Blantyre Central</span>
              <span className="hover:text-[#171717]">Lilongwe Area 2</span>
              <span className="hover:text-[#171717]">Zomba Jumu’ah</span>
              <span className="hover:text-[#171717]">Mangochi Lakeshore</span>
              <span className="hover:text-[#171717]">Mzuzu Katoto</span>
              <span className="hover:text-[#171717]">Salima Central</span>
            </div>

            <div className="pt-4 border-t border-black/6">
              <span className="text-[11px] text-[#55554F] block mb-2 font-medium">
                Community channels
              </span>
              <div className="flex items-center gap-3 text-xs text-[#55554F]">
                <span className="hover:text-[#171717] cursor-pointer">Facebook</span>
                <span>•</span>
                <span className="hover:text-[#171717] cursor-pointer">YouTube</span>
                <span>•</span>
                <span className="hover:text-[#171717] cursor-pointer">Instagram</span>
                <span>•</span>
                <span className="hover:text-[#171717] cursor-pointer">WhatsApp Community</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#55554F]">
          {/* Statement */}
          <p className="font-serif-heading text-base text-[#171717]">
            &ldquo;Connecting hearts through Islamic knowledge.&rdquo;
          </p>

          {/* Copyright & Scroll to Top */}
          <div className="flex items-center gap-4">
            <span>&copy; {new Date().getFullYear()} Khutbah Platform. All rights reserved.</span>
            <button
              onClick={scrollToTop}
              className="p-2 rounded-full bg-[#F1F1EC] hover:bg-black/5 text-[#171717] border border-black/8 transition-colors cursor-pointer"
              title="Scroll to top"
              aria-label="Back to top"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
