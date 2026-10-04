'use client';

import React from 'react';
import { BookOpen, Radio, Heart, ShieldCheck, Users } from 'lucide-react';

export default function AboutPlatform() {
  const pillars = [
    {
      title: 'Free & Open Discovery',
      description:
        'Knowledge should have no paywalls or barriers. Every khutbah, reminder, and lecture is freely accessible to every seeker.',
      icon: <BookOpen className="w-5 h-5 text-accent-orange" />,
    },
    {
      title: 'Preserving Malawian Heritage',
      description:
        'Archiving recordings from respected Malawian scholars, imams, and community teachers for future generations.',
      icon: <Radio className="w-5 h-5 text-accent-gold" />,
    },
    {
      title: 'Chichewa & English Context',
      description:
        'Supporting both national vernacular and English to ensure youth, elders, and new Muslims engage with ease.',
      icon: <Users className="w-5 h-5 text-[#171717]" />,
    },
    {
      title: 'Pure Spiritual Focus',
      description:
        'Uncluttered, calm editorial design built specifically for reflection, study, and spiritual enrichment.',
      icon: <Heart className="w-5 h-5 text-accent-orange" />,
    },
  ];

  return (
    <section id="about" className="py-20 sm:py-28 px-4 sm:px-6 md:px-8 border-t border-black/8">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="max-w-3xl mb-16 sm:mb-20">
          <span className="text-[11px] font-semibold tracking-widest uppercase text-secondary mb-3 block">
            Our Purpose & Mission
          </span>
          <h2 className="font-serif-heading text-3xl sm:text-4xl md:text-5xl font-normal text-[#171717] tracking-tight mb-6 leading-[1.15]">
            Making Islamic knowledge <br className="hidden sm:inline" />
            more accessible.
          </h2>
          <p className="text-[16px] sm:text-[18px] text-secondary leading-[1.65] font-sans">
            We believe access to beneficial Islamic knowledge should be simple. Our platform brings
            preachings, khutbahs, Quran recitations, and educational teachings together in one place,
            helping Muslims across Malawi stay connected to faith, learning, and community.
          </p>
        </div>

        {/* 4 Editorial Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, idx) => (
            <div
              key={idx}
              className="p-6 sm:p-7 rounded-2xl bg-surface border border-black/8 flex flex-col justify-between hover:border-black/20 transition-all"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center mb-6">
                  {pillar.icon}
                </div>
                <h3 className="font-serif-heading text-xl text-[#171717] font-medium mb-2.5">
                  {pillar.title}
                </h3>
                <p className="text-xs sm:text-[13px] text-secondary leading-relaxed">
                  {pillar.description}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-black/6 flex items-center gap-1.5 text-[11px] text-secondary font-mono">
                <span>Pillar 0{idx + 1}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Sincere Community Statement Banner */}
        <div className="mt-12 p-8 sm:p-10 rounded-3xl bg-[#EAEAE4] border border-black/8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h4 className="font-serif-heading text-2xl text-[#171717]">
              Built for sincere learning, not commercial distraction.
            </h4>
            <p className="text-xs sm:text-sm text-secondary">
              Khutbah operates as a digital sanctuary designed to empower Islamic education across all
              districts of Malawi.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#171717] text-white text-xs font-medium shrink-0">
            <ShieldCheck className="w-4 h-4 text-accent-gold" />
            <span>100% Free & Independent Media</span>
          </div>
        </div>
      </div>
    </section>
  );
}
