'use client';

import React, { useState } from 'react';
import { MapPin, Radio, Compass, ArrowRight, Building2, Sparkles } from 'lucide-react';
import { MALAWI_HUBS } from '../data/contentData';
import { MalawiHub } from '../types/content';

export default function MalawiCommunity() {
  const [activeHub, setActiveHub] = useState<MalawiHub>(MALAWI_HUBS[0]);

  return (
    <section id="community" className="py-20 sm:py-28 px-4 sm:px-6 md:px-8 border-t border-black/8 bg-[#ECECE6]">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <span className="text-[11px] font-semibold tracking-widest uppercase text-[#55554F] mb-3 block">
              National Footprint
            </span>
            <h2 className="font-serif-heading text-3xl sm:text-4xl md:text-5xl font-normal text-[#171717] tracking-tight mb-4">
              Rooted in Malawi. <br />
              Connected through knowledge.
            </h2>
            <p className="text-[15px] sm:text-[16px] text-[#55554F] leading-relaxed">
              Bringing together Islamic voices, teachings, and communities from across Malawi through
              accessible digital media.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#F1F1EC] text-xs font-medium text-[#171717] border border-black/8 self-start">
            <span className="w-2 h-2 rounded-full bg-[#D6A82E] animate-pulse" />
            <span>6 Primary Hubs Archiving Content</span>
          </div>
        </div>

        {/* Interactive Map & Hub Details Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* LEFT: Abstract Malawi Map Visualization */}
          <div className="lg:col-span-6 bg-[#F1F1EC] rounded-3xl p-6 sm:p-8 border border-black/8 relative flex flex-col items-center justify-center min-h-[440px]">
            {/* Map Header */}
            <div className="w-full flex items-center justify-between text-xs text-[#55554F] mb-4">
              <span className="font-mono text-[11px]">GEOGRAPHIC NETWORK</span>
              <span className="text-[11px]">Click nodes to explore</span>
            </div>

            {/* Abstract SVG representation of Malawi with delicate connection lines */}
            <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-[1/1.6] flex items-center justify-center">
              <svg
                viewBox="0 0 100 160"
                className="w-full h-full text-black/10 overflow-visible"
              >
                {/* Stylized abstract outline of Malawi (slender elongated shape with Lake Malawi on east) */}
                <path
                  d="M 38 10 C 45 8, 55 18, 52 35 C 50 48, 65 60, 68 75 C 72 95, 70 120, 62 145 C 56 155, 48 152, 45 140 C 40 125, 48 105, 42 85 C 36 68, 30 45, 38 10 Z"
                  fill="rgba(23, 23, 23, 0.03)"
                  stroke="rgba(23, 23, 23, 0.18)"
                  strokeWidth="1.2"
                  strokeDasharray="2 2"
                />

                {/* Lake Malawi abstract delicate wave marker */}
                <path
                  d="M 52 25 Q 60 50 65 80"
                  fill="none"
                  stroke="#FF713F"
                  strokeWidth="0.8"
                  strokeOpacity="0.4"
                />

                {/* Connection lines between hubs */}
                {MALAWI_HUBS.map((hub, i) => {
                  if (i === 0) return null;
                  const prev = MALAWI_HUBS[i - 1];
                  return (
                    <line
                      key={`line-${i}`}
                      x1={prev.coordinates.x}
                      y1={prev.coordinates.y}
                      x2={hub.coordinates.x}
                      y2={hub.coordinates.y}
                      stroke="rgba(214, 168, 46, 0.4)"
                      strokeWidth="0.9"
                      strokeDasharray="1.5 1.5"
                    />
                  );
                })}

                {/* Interactive Node Markers */}
                {MALAWI_HUBS.map((hub) => {
                  const isSelected = activeHub.id === hub.id;

                  return (
                    <g
                      key={hub.id}
                      className="cursor-pointer group"
                      onClick={() => setActiveHub(hub)}
                    >
                      {/* Pulse circle for selected */}
                      {isSelected && (
                        <circle
                          cx={hub.coordinates.x}
                          cy={hub.coordinates.y}
                          r="6"
                          fill="none"
                          stroke="#FF713F"
                          strokeWidth="0.8"
                          className="animate-ping origin-center"
                        />
                      )}

                      {/* Outer Ring */}
                      <circle
                        cx={hub.coordinates.x}
                        cy={hub.coordinates.y}
                        r={isSelected ? '4' : '2.5'}
                        fill={isSelected ? '#171717' : '#F1F1EC'}
                        stroke={isSelected ? '#FF713F' : '#171717'}
                        strokeWidth="1.2"
                        className="transition-all duration-300"
                      />

                      {/* Small center dot */}
                      <circle
                        cx={hub.coordinates.x}
                        cy={hub.coordinates.y}
                        r="1.2"
                        fill={isSelected ? '#FF713F' : '#D6A82E'}
                      />

                      {/* Label on map */}
                      <text
                        x={hub.coordinates.x + (hub.coordinates.x > 50 ? 5 : -5)}
                        y={hub.coordinates.y + 1.5}
                        textAnchor={hub.coordinates.x > 50 ? 'start' : 'end'}
                        className={`text-[5px] font-sans transition-all ${
                          isSelected
                            ? 'font-bold fill-[#171717]'
                            : 'fill-[#55554F] group-hover:fill-[#171717]'
                        }`}
                      >
                        {hub.name.replace(' Hub', '')}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Bottom Caption */}
            <div className="w-full pt-4 mt-2 border-t border-black/6 flex items-center justify-between text-[11px] text-[#55554F]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#FF713F]" />
                Selected Hub: {activeHub.name}
              </span>
              <span className="font-mono">{activeHub.region} Region</span>
            </div>
          </div>

          {/* RIGHT: Selected Hub Details Card */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-7 sm:p-8 rounded-3xl bg-[#F1F1EC] border border-black/8 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-black/5 text-[#171717]">
                  {activeHub.region} Malawi Region
                </span>
                <span className="text-xs font-mono text-[#55554F]">
                  {activeHub.recordingsCount} Archived Recordings
                </span>
              </div>

              <h3 className="font-serif-heading text-3xl font-medium text-[#171717] mb-2">
                {activeHub.name}
              </h3>

              <div className="flex items-center gap-2 text-xs text-[#55554F] mb-6">
                <Building2 className="w-3.5 h-3.5 text-[#D6A82E]" />
                <span>{activeHub.majorMasjid}</span>
              </div>

              <p className="text-sm text-[#55554F] leading-relaxed mb-6">
                {activeHub.description}
              </p>

              {/* Featured Scholars from this hub */}
              <div className="mb-6 pt-4 border-t border-black/6">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-[#55554F] block mb-2">
                  Active Voices & Teachers
                </span>
                <div className="flex flex-wrap gap-2">
                  {activeHub.featuredScholars.map((scholar, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-lg text-xs bg-black/4 text-[#171717] border border-black/5"
                    >
                      {scholar}
                    </span>
                  ))}
                </div>
              </div>

              {/* District Switcher Buttons */}
              <div className="pt-4 border-t border-black/6">
                <span className="text-[11px] font-semibold text-[#55554F] uppercase tracking-wider block mb-2.5">
                  Select Hub Location:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {MALAWI_HUBS.map((hub) => (
                    <button
                      key={hub.id}
                      onClick={() => setActiveHub(hub)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all text-center truncate cursor-pointer ${
                        activeHub.id === hub.id
                          ? 'bg-[#171717] text-white'
                          : 'bg-black/5 text-[#55554F] hover:text-[#171717]'
                      }`}
                    >
                      {hub.name.replace(' Hub', '')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
