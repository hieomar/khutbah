'use client';

import React from 'react';
import { ArrowRight, Smartphone } from 'lucide-react';
import ParticleNetwork from './ParticleNetwork';

interface HeroProps {
  onExploreClick?: () => void;
  onAppClick?: () => void;
}

export default function Hero({ onExploreClick, onAppClick }: HeroProps) {
  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-[92vh] lg:min-h-screen flex items-center justify-center pt-24 sm:pt-28 pb-12 sm:pb-16 px-4 sm:px-6 md:px-8 overflow-hidden">
      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Editorial Presentation */}
        <div className="lg:col-span-6 flex flex-col justify-center z-10">
          {/* Subtle Platform Tag */}
          <div className="inline-flex items-center gap-2 mb-6 self-start">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium tracking-wide uppercase bg-surface border border-black/8 text-secondary">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-gold" />
              Islamic Media Platform • Malawi
            </span>
          </div>

          {/* Exact Hero Heading */}
          <h1 className="font-serif-heading text-4xl sm:text-5xl lg:text-[62px] leading-[1.06] font-normal tracking-tight text-[#171717] mb-6">
            Knowledge that connects. <br className="hidden sm:inline" />
            Faith that inspires.
          </h1>

          {/* Exact Hero Description */}
          <p className="text-[15px] sm:text-[16px] leading-[1.6] text-secondary font-sans max-w-110 mb-8 sm:mb-10">
            Discover Islamic preachings, khutbahs, and teachings from across Malawi. Listen to
            meaningful reminders or watch inspiring lectures, anytime, anywhere.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-wrap items-center gap-3.5 mb-8">
            <button
              onClick={() => (onExploreClick ? onExploreClick() : scrollTo('explore-content'))}
              className="group inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-[#171717] text-white text-[14px] font-medium shadow-xs hover:bg-black/90 active:scale-[0.98] transition-all cursor-pointer"
            >
              <span>Explore content</span>
              <ArrowRight className="w-4 h-4 text-accent-orange group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => (onAppClick ? onAppClick() : scrollTo('mobile-app'))}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full bg-transparent hover:bg-black/5 text-[#171717] text-[14px] font-medium border border-black/15 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-secondary" />
              <span>Get the mobile app</span>
            </button>
          </div>

          {/* Understated Mobile App Announcement */}
          <div className="inline-flex items-center gap-2.5 pt-2 text-[12px] text-secondary">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-orange opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-orange" />
            </span>
            <span>Mobile application currently in development</span>
          </div>

          {/* Quick Pillars pill bar */}
          <div className="mt-8 pt-6 border-t border-black/8 grid grid-cols-3 gap-2 text-[11px] text-secondary">
            <div className="flex flex-col">
              <span className="font-semibold text-[#171717]">Audio & Video</span>
              <span>Rich Media formats</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-[#171717]">Local Voices</span>
              <span>Scholars across Malawi</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-[#171717]">Free Access</span>
              <span>Open to all communities</span>
            </div>
          </div>
        </div>

        {/* Right Column: Signature Animated Particle Network Canvas */}
        <div className="lg:col-span-6 relative flex items-center justify-center">
          <div className="w-full relative rounded-3xl bg-[#E8E8E2]/40 border border-black/5 p-2 sm:p-4 backdrop-blur-xs">
            <ParticleNetwork />
          </div>
        </div>
      </div>
    </section>
  );
}
