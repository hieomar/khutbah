'use client';

import React from 'react';
import { ArrowRight, Smartphone, BookOpen } from 'lucide-react';

interface FinalCTAProps {
  onExploreClick?: () => void;
  onAppClick?: () => void;
}

export default function FinalCTA({ onExploreClick, onAppClick }: FinalCTAProps) {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -80;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 md:px-8 border-t border-black/8">
      <div className="max-w-4xl mx-auto text-center">
        {/* Subtle Tag */}
        <div className="inline-flex items-center gap-2 mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium tracking-wide uppercase bg-surface border border-black/8 text-secondary">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-orange" />
            Your Digital Sanctuary
          </span>
        </div>

        {/* Exact Final Heading */}
        <h2 className="font-serif-heading text-4xl sm:text-5xl md:text-6xl font-normal text-[#171717] tracking-tight mb-6">
          Stay connected to what matters.
        </h2>

        {/* Exact Final Description */}
        <p className="text-[16px] sm:text-[18px] text-secondary leading-relaxed max-w-xl mx-auto mb-10">
          Discover meaningful Islamic content today and be among the first to experience our
          upcoming mobile application.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => (onExploreClick ? onExploreClick() : scrollTo('explore-content'))}
            className="group inline-flex items-center gap-2.5 px-7 py-4 rounded-full bg-[#171717] text-white text-[15px] font-medium shadow-xs hover:bg-black/90 active:scale-98 transition-all cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-accent-gold" />
            <span>Explore content</span>
            <ArrowRight className="w-4 h-4 text-accent-orange group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => (onAppClick ? onAppClick() : scrollTo('mobile-app'))}
            className="inline-flex items-center gap-2.5 px-6 py-4 rounded-full bg-transparent hover:bg-black/5 text-[#171717] text-[15px] font-medium border border-black/15 active:scale-98 transition-all cursor-pointer"
          >
            <Smartphone className="w-4 h-4 text-secondary" />
            <span>Get app updates</span>
          </button>
        </div>
      </div>
    </section>
  );
}
