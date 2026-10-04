'use client';

import React, { useState } from 'react';
import {
  X,
  Play,
  Volume2,
  Video,
  Clock,
  MapPin,
  Sparkles,
  Share2,
  Check,
} from 'lucide-react';
import { Teaching } from '../types/content';

interface ContentModalProps {
  teaching: Teaching | null;
  onClose: () => void;
  onPlay: (teaching: Teaching) => void;
  isPlaying?: boolean;
}

export default function ContentModal({
  teaching,
  onClose,
  onPlay,
  isPlaying,
}: ContentModalProps) {
  const [copied, setCopied] = useState(false);

  if (!teaching) return null;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div
        className="relative w-full max-w-2xl bg-surface rounded-3xl border border-black/10 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-black/5 hover:bg-black/10 text-[#171717] transition-colors cursor-pointer"
          aria-label="Close details"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4 pr-10">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
              teaching.mediaType === 'audio'
                ? 'bg-[#171717] text-white'
                : 'bg-accent-orange/15 text-[#171717] border border-accent-orange/30'
            }`}
          >
            {teaching.mediaType === 'audio' ? (
              <Volume2 className="w-3.5 h-3.5 text-accent-gold" />
            ) : (
              <Video className="w-3.5 h-3.5 text-accent-orange" />
            )}
            <span className="capitalize">{teaching.mediaType} Recording</span>
          </span>

          <span className="text-xs font-medium text-secondary bg-black/5 px-2.5 py-1 rounded-full">
            {teaching.categoryLabel}
          </span>

          <span className="text-xs text-secondary flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {teaching.duration}
          </span>
        </div>

        {/* Title */}
        <h2 className="font-serif-heading text-2xl sm:text-3xl text-[#171717] font-medium mb-2 leading-tight">
          {teaching.title}
        </h2>

        {/* Speaker & Masjid info */}
        <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-secondary mb-6 pb-4 border-b border-black/8">
          <span className="font-semibold text-[#171717]">{teaching.speaker}</span>
          <span>•</span>
          <span>{teaching.speakerTitle}</span>
          <span>•</span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-secondary" />
            {teaching.location} ({teaching.district})
          </span>
          <span>•</span>
          <span className="font-medium text-[#171717]">{teaching.language}</span>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-secondary mb-2">
            Overview
          </h4>
          <p className="text-xs sm:text-sm text-[#171717]/90 leading-relaxed">
            {teaching.description}
          </p>
        </div>

        {/* Key Takeaways */}
        {teaching.keyTakeaways && teaching.keyTakeaways.length > 0 && (
          <div className="mb-8 p-4 rounded-2xl bg-[#E8E8E1] border border-black/5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#171717] mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-accent-orange" />
              <span>Core Teachings & Points</span>
            </h4>
            <ul className="space-y-2">
              {teaching.keyTakeaways.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-secondary">
                  <span className="w-4 h-4 rounded-full bg-[#171717] text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    ✓
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-black/8">
          <button
            onClick={() => {
              onPlay(teaching);
              onClose();
            }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#171717] text-white text-xs font-medium shadow-xs hover:bg-black active:scale-98 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{isPlaying ? 'Now Playing' : `Play ${teaching.mediaType} (${teaching.duration})`}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-black/5 hover:bg-black/10 text-xs text-[#171717] font-medium transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Link copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share teaching</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
