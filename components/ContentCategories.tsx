'use client';

import React from 'react';
import { ArrowUpRight, Sparkles, BookOpen, GraduationCap, Volume2, Compass } from 'lucide-react';
import { CATEGORIES } from '../data/contentData';
import { CategoryId } from '../types/content';

interface ContentCategoriesProps {
  selectedCategory: CategoryId | 'all';
  onSelectCategory: (id: CategoryId | 'all') => void;
}

const iconMap: Record<string, React.ReactNode> = {
  Sparkles: <Sparkles className="w-5 h-5 text-[#FF713F]" />,
  BookOpen: <BookOpen className="w-5 h-5 text-[#171717]" />,
  GraduationCap: <GraduationCap className="w-5 h-5 text-[#171717]" />,
  Volume2: <Volume2 className="w-5 h-5 text-[#D6A82E]" />,
  Compass: <Compass className="w-5 h-5 text-[#FF713F]" />,
};

export default function ContentCategories({
  selectedCategory,
  onSelectCategory,
}: ContentCategoriesProps) {
  const scrollToTeachings = () => {
    const el = document.getElementById('featured-teachings');
    if (el) {
      const yOffset = -80;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleCategoryClick = (id: CategoryId) => {
    onSelectCategory(id);
    scrollToTeachings();
  };

  return (
    <section id="categories" className="py-20 sm:py-24 px-4 sm:px-6 md:px-8 border-t border-black/8">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div className="max-w-xl">
            <span className="text-[11px] font-semibold tracking-widest uppercase text-[#55554F] mb-3 block">
              Content Directory
            </span>
            <h2 className="font-serif-heading text-3xl sm:text-4xl md:text-5xl font-normal text-[#171717] tracking-tight mb-4">
              Explore the words that inspire.
            </h2>
            <p className="text-[15px] sm:text-[16px] text-[#55554F] leading-relaxed">
              Listen, watch, and learn from Islamic teachings shared by voices across Malawi.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onSelectCategory('all');
                scrollToTeachings();
              }}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#171717] text-white shadow-xs'
                  : 'bg-[#F1F1EC] text-[#55554F] hover:text-[#171717] border border-black/8'
              }`}
            >
              View all 5 categories
            </button>
          </div>
        </div>

        {/* 5 Minimalist Editorial Category Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {CATEGORIES.map((cat, idx) => {
            const isSelected = selectedCategory === cat.id;

            return (
              <div
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`group relative p-6 sm:p-7 rounded-2xl bg-[#F1F1EC] border transition-all duration-300 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#171717] shadow-sm bg-[#EAEAE4]'
                    : 'border-black/8 hover:border-black/20 hover:-translate-y-1'
                } ${idx === 0 ? 'lg:col-span-1' : ''}`}
              >
                <div>
                  {/* Top card row: Icon & Item Count */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center group-hover:scale-105 transition-transform">
                      {iconMap[cat.iconName] || <Sparkles className="w-5 h-5" />}
                    </div>
                    <span className="text-[11px] font-medium text-[#55554F] bg-black/4 px-2.5 py-1 rounded-full border border-black/5">
                      {cat.itemCount} recordings
                    </span>
                  </div>

                  {/* Title & Vernacular name */}
                  <div className="mb-3">
                    <h3 className="text-xl font-serif-heading font-medium text-[#171717] group-hover:text-black transition-colors flex items-center gap-2">
                      <span>{cat.title}</span>
                    </h3>
                    {cat.vernacularTitle && (
                      <span className="text-[12px] font-sans text-[#55554F]/80 italic">
                        {cat.vernacularTitle}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-[13px] text-[#55554F] leading-relaxed mb-6">
                    {cat.description}
                  </p>
                </div>

                {/* Bottom link indicator */}
                <div className="pt-4 border-t border-black/6 flex items-center justify-between text-xs font-medium text-[#171717]">
                  <span className="group-hover:text-[#FF713F] transition-colors">
                    Explore recordings
                  </span>
                  <div className="w-6 h-6 rounded-full bg-black/5 group-hover:bg-[#171717] group-hover:text-white flex items-center justify-center transition-all">
                    <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>
              </div>
            );
          })}

          {/* 6th Card: Cross-Format Knowledge Platform Banner */}
          <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-br from-[#171717] to-[#252525] text-white flex flex-col justify-between border border-black/10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-[10px] uppercase font-semibold tracking-wider text-[#D6A82E] mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF713F]" />
                Dual Media Archive
              </div>
              <h3 className="font-serif-heading text-2xl font-normal text-white mb-2">
                Audio & Video Library
              </h3>
              <p className="text-[13px] text-white/70 leading-relaxed">
                Stream audio preachings during commutes, or watch high-resolution recorded lectures
                and Jumu’ah sermons directly on the web.
              </p>
            </div>
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-medium text-white/80">
              <span>Fast streaming across Malawi</span>
              <span className="text-[#FF713F]">Optimized</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
