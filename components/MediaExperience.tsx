'use client';

import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  RotateCw,
  Video,
  Radio,
  SlidersHorizontal,
  Headphones,
  Maximize2,
  Sparkles,
} from 'lucide-react';
import { Teaching } from '../types/content';

interface MediaExperienceProps {
  onPlayTeaching: (teaching: Teaching) => void;
}

export default function MediaExperience({ onPlayTeaching }: MediaExperienceProps) {
  // Interactive Audio player demonstration state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(38); // 38%
  const [audioSpeed, setAudioSpeed] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [activeChapterIndex, setActiveChapterIndex] = useState(1);

  // Interactive Video state
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [videoHovered, setVideoHovered] = useState(false);

  // Audio simulation timer when playing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlayingAudio) {
      interval = setInterval(() => {
        setAudioProgress((prev) => {
          if (prev >= 100) {
            setIsPlayingAudio(false);
            return 0;
          }
          return prev + 0.4 * audioSpeed;
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isPlayingAudio, audioSpeed]);

  const chapters = [
    { title: '01. Introduction & Etiquettes', time: '00:00' },
    { title: '02. Salah as the Daily Anchor', time: '08:15' },
    { title: '03. Cultivating Khushu in Distraction', time: '17:40' },
    { title: '04. Dua & Communal Closing', time: '24:10' },
  ];

  const cycleSpeed = () => {
    const speeds = [1.0, 1.25, 1.5, 2.0];
    const nextIdx = (speeds.indexOf(audioSpeed) + 1) % speeds.length;
    setAudioSpeed(speeds[nextIdx]);
  };

  const sampleAudioTeaching: Teaching = {
    id: 'exp-audio',
    title: 'The Importance of Salah (Khutbah Experience)',
    speaker: 'Sheikh Yusuf Banda',
    speakerTitle: 'Resident Scholar, Blantyre Central Mosque',
    categoryId: 'khutbahs',
    categoryLabel: 'Friday Khutbah',
    mediaType: 'audio',
    duration: '28:40',
    durationSeconds: 1720,
    date: '26 Sep 2026',
    location: 'Central Mosque, Blantyre',
    district: 'Blantyre',
    language: 'Chichewa / English',
    description: 'Listen to the live Jumu’ah sermon on anchoring the soul with consistent prayer.',
    keyTakeaways: ['Foundational prayer habits', 'Overcoming mental exhaustion with Salah'],
  };

  const sampleVideoTeaching: Teaching = {
    id: 'exp-video',
    title: 'Preparing Our Hearts for Ramadan',
    speaker: 'Ustadh Ibrahim Mataka',
    speakerTitle: 'Islamic Educator, Lilongwe',
    categoryId: 'lectures',
    categoryLabel: 'Islamic Lecture',
    mediaType: 'video',
    duration: '42:15',
    durationSeconds: 2535,
    date: '18 Sep 2026',
    location: 'Area 2 Islamic Centre, Lilongwe',
    district: 'Lilongwe',
    language: 'Chichewa',
    description: 'Watch the full educational symposium recorded in Lilongwe.',
    keyTakeaways: ['Purifying intentions', 'Daily Quran routine'],
  };

  return (
    <section
      id="media-experience"
      className="py-20 sm:py-24 px-4 sm:px-6 md:px-8 border-t border-black/8 bg-[#D3D3CD]/30"
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[11px] font-semibold tracking-widest uppercase text-[#55554F] mb-3 block">
            Seamless Media Engine
          </span>
          <h2 className="font-serif-heading text-3xl sm:text-4xl md:text-5xl font-normal text-[#171717] tracking-tight mb-4">
            Listen your way. Watch your way.
          </h2>
          <p className="text-[15px] sm:text-[16px] text-[#55554F] leading-relaxed">
            Whether you prefer listening on the go or watching full lectures, discover Islamic
            knowledge in the format that works for you.
          </p>
        </div>

        {/* Split Editorial Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          {/* LEFT: Audio Experience Card */}
          <div className="rounded-3xl bg-[#F1F1EC] border border-black/8 p-6 sm:p-8 flex flex-col justify-between shadow-xs">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 text-[11px] font-medium text-[#171717]">
                  <Headphones className="w-3.5 h-3.5 text-[#D6A82E]" />
                  <span>Audio Streaming Experience</span>
                </div>
                <span className="text-[11px] text-[#55554F] font-mono">256kbps Clean Audio</span>
              </div>

              {/* Title & Metadata */}
              <div className="mb-6">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-[#FF713F] block mb-1">
                  Friday Khutbah
                </span>
                <h3 className="font-serif-heading text-2xl sm:text-3xl text-[#171717] font-medium mb-1">
                  The Importance of Salah
                </h3>
                <p className="text-xs text-[#55554F]">
                  Sheikh Yusuf Banda • Central Mosque, Blantyre
                </p>
              </div>

              {/* Waveform Visualizer simulation */}
              <div className="bg-[#E7E7E1] rounded-2xl p-4 sm:p-5 mb-6 border border-black/5">
                <div className="flex items-end justify-between gap-1 h-12 mb-3 px-1">
                  {Array.from({ length: 36 }).map((_, i) => {
                    const isPassed = (i / 36) * 100 <= audioProgress;
                    const heightPercent = Math.max(
                      20,
                      Math.sin(i * 0.4) * 40 +
                        Math.cos(i * 0.8) * 30 +
                        (isPlayingAudio ? (i % 3) * 15 : 25)
                    );

                    return (
                      <div
                        key={i}
                        className="w-full rounded-full transition-all duration-200"
                        style={{
                          height: `${heightPercent}%`,
                          backgroundColor: isPassed
                            ? '#171717'
                            : 'rgba(23, 23, 23, 0.15)',
                        }}
                      />
                    );
                  })}
                </div>

                {/* Progress bar scrubber */}
                <div className="relative mb-2">
                  <div className="w-full h-1.5 bg-black/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#171717] rounded-full transition-all duration-200"
                      style={{ width: `${audioProgress}%` }}
                    />
                  </div>
                </div>

                {/* Time indicators */}
                <div className="flex justify-between text-[10px] font-mono text-[#55554F]">
                  <span>
                    {Math.floor((audioProgress / 100) * 28)}:
                    {String(Math.floor(((audioProgress / 100) * 28 * 60) % 60)).padStart(2, '0')}
                  </span>
                  <span>28:40</span>
                </div>
              </div>

              {/* Audio Controls */}
              <div className="flex items-center justify-between gap-3 mb-6">
                <button
                  onClick={cycleSpeed}
                  className="px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-black/5 hover:bg-black/10 text-[#171717] cursor-pointer"
                  title="Change playback speed"
                >
                  {audioSpeed.toFixed(2)}x
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setAudioProgress((p) => Math.max(0, p - 5))}
                    className="p-2 text-[#55554F] hover:text-[#171717] transition-colors cursor-pointer"
                    title="Rewind 15 seconds"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      setIsPlayingAudio(!isPlayingAudio);
                      if (!isPlayingAudio) {
                        onPlayTeaching(sampleAudioTeaching);
                      }
                    }}
                    className="w-12 h-12 rounded-full bg-[#171717] hover:bg-black text-white flex items-center justify-center shadow-md active:scale-95 transition-all cursor-pointer"
                    aria-label={isPlayingAudio ? 'Pause sermon' : 'Play sermon'}
                  >
                    {isPlayingAudio ? (
                      <Pause className="w-5 h-5 fill-current" />
                    ) : (
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    )}
                  </button>

                  <button
                    onClick={() => setAudioProgress((p) => Math.min(100, p + 5))}
                    className="p-2 text-[#55554F] hover:text-[#171717] transition-colors cursor-pointer"
                    title="Forward 15 seconds"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 text-[#55554F] hover:text-[#171717] transition-colors cursor-pointer"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>

              {/* Chapters list preview */}
              <div className="pt-4 border-t border-black/8">
                <span className="text-[11px] font-semibold text-[#55554F] uppercase tracking-wider block mb-2">
                  Lecture Chapters
                </span>
                <div className="space-y-1.5">
                  {chapters.map((ch, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setActiveChapterIndex(idx);
                        setAudioProgress(idx * 25);
                        setIsPlayingAudio(true);
                      }}
                      className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                        activeChapterIndex === idx
                          ? 'bg-black/8 text-[#171717] font-medium'
                          : 'hover:bg-black/4 text-[#55554F]'
                      }`}
                    >
                      <span className="truncate">{ch.title}</span>
                      <span className="font-mono text-[11px] text-[#55554F]/70 ml-2">{ch.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Video Experience Card */}
          <div className="rounded-3xl bg-[#F1F1EC] border border-black/8 p-6 sm:p-8 flex flex-col justify-between shadow-xs">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 text-[11px] font-medium text-[#171717]">
                  <Video className="w-3.5 h-3.5 text-[#FF713F]" />
                  <span>Video Lecture Experience</span>
                </div>
                <span className="text-[11px] text-[#55554F] font-mono">1080p HD Recording</span>
              </div>

              {/* Video Player Display Container */}
              <div
                onMouseEnter={() => setVideoHovered(true)}
                onMouseLeave={() => setVideoHovered(false)}
                className="relative aspect-video rounded-2xl bg-gradient-to-br from-[#1C1C1A] to-[#2B2B28] text-white overflow-hidden shadow-inner flex flex-col justify-between p-4 sm:p-5 mb-6 group"
              >
                {/* Background decorative subtle graphic overlay */}
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#DADAD4_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

                {/* Top badges inside video preview */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-medium text-white border border-white/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF713F]" />
                    Lilongwe Islamic Centre
                  </span>
                  <span className="text-[11px] font-mono bg-black/60 px-2 py-0.5 rounded text-white/80">
                    42:15
                  </span>
                </div>

                {/* Centered Play Action */}
                <div className="relative z-10 flex flex-col items-center justify-center my-auto">
                  <button
                    onClick={() => {
                      setIsPlayingVideo(!isPlayingVideo);
                      onPlayTeaching(sampleVideoTeaching);
                    }}
                    className="w-16 h-16 rounded-full bg-[#FF713F] hover:bg-[#FF713F]/90 text-white flex items-center justify-center shadow-lg transition-transform transform group-hover:scale-110 active:scale-95 cursor-pointer"
                    aria-label="Play video lecture"
                  >
                    {isPlayingVideo ? (
                      <Pause className="w-7 h-7 fill-current" />
                    ) : (
                      <Play className="w-7 h-7 fill-current ml-1" />
                    )}
                  </button>
                  <span className="text-[11px] text-white/80 mt-3 font-medium tracking-wide">
                    {isPlayingVideo ? 'Playing Video Lecture' : 'Watch Full Teaching'}
                  </span>
                </div>

                {/* Bottom Overlay Info */}
                <div className="relative z-10 flex items-center justify-between text-xs text-white/90">
                  <div className="truncate pr-4">
                    <p className="font-serif-heading text-base text-white truncate">
                      Preparing Our Hearts for Ramadan
                    </p>
                    <p className="text-[11px] text-white/70">Ustadh Ibrahim Mataka</p>
                  </div>
                  <Maximize2 className="w-4 h-4 text-white/60 hover:text-white cursor-pointer shrink-0" />
                </div>
              </div>

              {/* Video Features Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-black/4 border border-black/5">
                  <span className="text-[10px] uppercase font-semibold text-[#55554F] block mb-1">
                    Dual Subtitles
                  </span>
                  <p className="text-xs font-medium text-[#171717]">Chichewa & English Captions</p>
                </div>
                <div className="p-3.5 rounded-xl bg-black/4 border border-black/5">
                  <span className="text-[10px] uppercase font-semibold text-[#55554F] block mb-1">
                    Bandwidth Optimized
                  </span>
                  <p className="text-xs font-medium text-[#171717]">Adaptive low-data streaming</p>
                </div>
              </div>
            </div>

            {/* Bottom Note */}
            <div className="pt-6 border-t border-black/8 flex items-center justify-between text-xs text-[#55554F]">
              <span>Watch anytime without registration</span>
              <button
                onClick={() => onPlayTeaching(sampleVideoTeaching)}
                className="text-[#171717] font-medium hover:text-[#FF713F] transition-colors cursor-pointer"
              >
                Launch player →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
