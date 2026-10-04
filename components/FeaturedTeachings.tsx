'use client';

import React, { useState, useMemo } from 'react';
import {
  Play,
  Volume2,
  Video,
  Search,
  Clock,
  MapPin,
  Sparkles,
  Info,
  Check,
  Share2,
} from 'lucide-react';
import { TEACHINGS, CATEGORIES } from '../data/contentData';
import { Teaching, CategoryId, MediaType } from '../types/content';

interface FeaturedTeachingsProps {
  selectedCategory: CategoryId | 'all';
  onSelectCategory: (id: CategoryId | 'all') => void;
  onPlayTeaching: (teaching: Teaching) => void;
  onOpenDetails: (teaching: Teaching) => void;
  currentPlayingId?: string;
  isPlaying?: boolean;
}

export default function FeaturedTeachings({
  selectedCategory,
  onSelectCategory,
  onPlayTeaching,
  onOpenDetails,
  currentPlayingId,
  isPlaying,
}: FeaturedTeachingsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaFilter, setMediaFilter] = useState<'all' | MediaType>('all');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Available districts from content
  const districts = ['all', 'Blantyre', 'Lilongwe', 'Zomba', 'Mzuzu', 'Mangochi', 'Salima'];

  // Filtered list
  const filteredTeachings = useMemo(() => {
    return TEACHINGS.filter((t) => {
      // Category filter
      if (selectedCategory !== 'all' && t.categoryId !== selectedCategory) {
        return false;
      }
      // Media type filter
      if (mediaFilter !== 'all' && t.mediaType !== mediaFilter) {
        return false;
      }
      // District filter
      if (districtFilter !== 'all' && t.district !== districtFilter) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(query);
        const matchSpeaker = t.speaker.toLowerCase().includes(query);
        const matchLocation = t.location.toLowerCase().includes(query);
        const matchDesc = t.description.toLowerCase().includes(query);
        const matchCategory = t.categoryLabel.toLowerCase().includes(query);
        return matchTitle || matchSpeaker || matchLocation || matchDesc || matchCategory;
      }
      return true;
    });
  }, [selectedCategory, mediaFilter, districtFilter, searchQuery]);

  const handleShare = (teaching: Teaching, e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}#teaching-${teaching.id}`);
      setCopiedId(teaching.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <section id="explore-content" className="py-20 sm:py-24 px-4 sm:px-6 md:px-8">
      <div id="featured-teachings" className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-6">
          <div className="max-w-xl">
            <span className="text-[11px] font-semibold tracking-widest uppercase text-secondary mb-3 block">
              Curated Recordings
            </span>
            <h2 className="font-serif-heading text-3xl sm:text-4xl md:text-5xl font-normal text-[#171717] tracking-tight mb-4">
              Featured teachings
            </h2>
            <p className="text-[15px] sm:text-[16px] text-secondary leading-relaxed">
              Explore authentic Friday sermons, educational lectures, and Quranic recitations
              archived from across Malawi.
            </p>
          </div>

          {/* Quick counts */}
          <div className="flex items-center gap-2 text-xs text-secondary bg-surface px-4 py-2 rounded-full border border-black/8 self-start md:self-auto">
            <span className="w-2 h-2 rounded-full bg-accent-orange" />
            <span>
              Showing <strong>{filteredTeachings.length}</strong> of {TEACHINGS.length} teachings
            </span>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-surface p-3 sm:p-4 rounded-2xl border border-black/8 mb-8 space-y-3">
          {/* Top Bar: Search Input & Format Filter */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search teachings, scholars, topics..."
                className="w-full bg-white/80 focus:bg-white text-xs text-[#171717] placeholder-secondary/70 pl-9 pr-4 py-2.5 rounded-full border border-black/8 focus:outline-none focus:border-[#171717] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-secondary hover:text-[#171717]"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Media Type Filter Tabs */}
            <div className="flex items-center gap-1.5 self-stretch sm:self-auto p-1 bg-black/5 rounded-full border border-black/5">
              <button
                onClick={() => setMediaFilter('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  mediaFilter === 'all'
                    ? 'bg-[#171717] text-white shadow-xs'
                    : 'text-secondary hover:text-[#171717]'
                }`}
              >
                All Formats
              </button>
              <button
                onClick={() => setMediaFilter('audio')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  mediaFilter === 'audio'
                    ? 'bg-[#171717] text-white shadow-xs'
                    : 'text-secondary hover:text-[#171717]'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Audio Only</span>
              </button>
              <button
                onClick={() => setMediaFilter('video')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  mediaFilter === 'video'
                    ? 'bg-[#171717] text-white shadow-xs'
                    : 'text-secondary hover:text-[#171717]'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Video Lectures</span>
              </button>
            </div>
          </div>

          {/* Bottom Bar: Category & District Pills */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-black/5">
            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto py-1">
              <span className="text-[11px] font-medium text-secondary mr-1 hidden sm:inline">
                Category:
              </span>
              <button
                onClick={() => onSelectCategory('all')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-[#171717] text-white'
                    : 'bg-black/5 text-secondary hover:text-[#171717]'
                }`}
              >
                All Categories
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-[#171717] text-white'
                      : 'bg-black/5 text-secondary hover:text-[#171717]'
                  }`}
                >
                  {cat.title}
                </button>
              ))}
            </div>

            {/* District Selector */}
            <div className="flex items-center gap-1.5 text-[11px] text-secondary">
              <MapPin className="w-3.5 h-3.5 text-secondary" />
              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="bg-transparent border-none text-[11px] font-medium text-[#171717] focus:outline-none cursor-pointer"
              >
                <option value="all">All Malawi Districts</option>
                {districts.filter((d) => d !== 'all').map((d) => (
                  <option key={d} value={d}>
                    {d} District
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content Items Grid */}
        {filteredTeachings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5 sm:gap-6">
            {filteredTeachings.map((item) => {
              const isCurrentPlaying = currentPlayingId === item.id && isPlaying;

              return (
                <div
                  key={item.id}
                  className={`group relative rounded-2xl bg-surface border transition-all duration-300 p-5 sm:p-6 flex flex-col justify-between ${
                    isCurrentPlaying
                      ? 'border-accent-orange shadow-sm bg-[#ECECE5]'
                      : 'border-black/8 hover:border-black/20 hover:-translate-y-0.5'
                  }`}
                >
                  <div>
                    {/* Top Row: Format badge, Category & Duration */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium ${
                            item.mediaType === 'audio'
                              ? 'bg-[#171717] text-white'
                              : 'bg-accent-orange/15 text-[#171717] border border-accent-orange/30'
                          }`}
                        >
                          {item.mediaType === 'audio' ? (
                            <Volume2 className="w-3 h-3 text-accent-gold" />
                          ) : (
                            <Video className="w-3 h-3 text-accent-orange" />
                          )}
                          <span className="capitalize">{item.mediaType}</span>
                        </span>

                        <span className="text-[11px] font-medium text-secondary bg-black/5 px-2 py-0.5 rounded-md">
                          {item.categoryLabel}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-secondary">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{item.duration}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl sm:text-2xl font-serif-heading font-medium text-[#171717] mb-2 leading-snug group-hover:text-black">
                      {item.title}
                    </h3>

                    {/* Speaker info */}
                    <div className="flex items-center gap-2 text-xs text-secondary mb-3">
                      <span className="font-semibold text-[#171717]">{item.speaker}</span>
                      <span>•</span>
                      <span>{item.speakerTitle}</span>
                    </div>

                    {/* Location & Language */}
                    <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-[11px] text-secondary mb-4">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-secondary" />
                        {item.location}
                      </span>
                      <span>•</span>
                      <span className="bg-black/4 px-2 py-0.5 rounded text-[10px]">
                        {item.language}
                      </span>
                    </div>

                    {/* Description preview */}
                    <p className="text-xs sm:text-[13px] text-secondary leading-relaxed line-clamp-2 mb-6">
                      {item.description}
                    </p>
                  </div>

                  {/* Card Action Controls */}
                  <div className="pt-4 border-t border-black/8 flex items-center justify-between gap-3">
                    {/* Main Play Button */}
                    <button
                      onClick={() => onPlayTeaching(item)}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer ${
                        isCurrentPlaying
                          ? 'bg-accent-orange text-white shadow-xs'
                          : 'bg-[#171717] text-white hover:bg-black/90 shadow-2xs'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isCurrentPlaying ? 'Playing now' : `Play ${item.mediaType}`}</span>
                    </button>

                    {/* Extra details & Share */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onOpenDetails(item)}
                        className="inline-flex items-center gap-1 text-xs text-secondary hover:text-[#171717] px-2.5 py-1.5 rounded-full hover:bg-black/5 transition-colors cursor-pointer"
                        title="View lecture details and key takeaways"
                      >
                        <Info className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Details</span>
                      </button>

                      <button
                        onClick={(e) => handleShare(item, e)}
                        className="p-1.5 text-secondary hover:text-[#171717] rounded-full hover:bg-black/5 transition-colors cursor-pointer"
                        title="Copy link to teaching"
                        aria-label="Share"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Share2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Graceful Empty State */
          <div className="p-12 text-center rounded-2xl bg-surface border border-black/8">
            <Sparkles className="w-8 h-8 text-secondary mx-auto mb-3 opacity-60" />
            <h3 className="font-serif-heading text-xl text-[#171717] mb-2">
              No matching teachings found
            </h3>
            <p className="text-xs text-secondary max-w-md mx-auto mb-6">
              We couldn&apos;t find any recordings matching your current filters. Try resetting your search
              or exploring another category.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                onSelectCategory('all');
                setMediaFilter('all');
                setDistrictFilter('all');
              }}
              className="px-4 py-2 rounded-full text-xs font-medium bg-[#171717] text-white hover:bg-black/90 cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
