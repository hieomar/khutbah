'use client';

import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  RotateCw,
  X,
  Headphones,
  Video,
} from 'lucide-react';
import { Teaching } from '../types/content';

interface GlobalPlayerProps {
  currentTrack: Teaching | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onClose: () => void;
}

export default function GlobalPlayer({
  currentTrack,
  isPlaying,
  onTogglePlay,
  onClose,
}: GlobalPlayerProps) {
  const [progress, setProgress] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);

  // Auto increment progress when playing
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && currentTrack) {
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            return 0;
          }
          return prev + (100 / (currentTrack.durationSeconds || 1200)) * playbackSpeed;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, currentTrack, playbackSpeed]);

  if (!currentTrack) return null;

  const currentSeconds = Math.floor(
    (progress / 100) * (currentTrack.durationSeconds || 1200)
  );
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${String(remainder).padStart(2, '0')}`;
  };

  const cycleSpeed = () => {
    const speeds = [1.0, 1.25, 1.5, 2.0];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIdx]);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 max-w-4xl mx-auto transition-all duration-300">
      <div className="bg-[#171717] text-canvas rounded-2xl sm:rounded-full p-3 sm:px-6 sm:py-3 shadow-2xl border border-white/10 backdrop-blur-md">
        {/* Progress Bar (at top of player) */}
        <div className="relative w-full h-1 bg-white/10 rounded-full mb-2.5 overflow-hidden group cursor-pointer">
          <div
            className="h-full bg-accent-orange transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Left: Track Info */}
          <div className="flex items-center gap-3 w-full sm:w-auto truncate">
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              {currentTrack.mediaType === 'audio' ? (
                <Headphones className="w-4 h-4 text-accent-gold" />
              ) : (
                <Video className="w-4 h-4 text-accent-orange" />
              )}
            </div>

            <div className="truncate pr-2 text-left">
              <p className="text-xs font-medium text-white truncate">{currentTrack.title}</p>
              <p className="text-[10px] text-canvas/70 truncate">
                {currentTrack.speaker} • {currentTrack.location}
              </p>
            </div>
          </div>

          {/* Center: Controls */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <span className="font-mono text-[10px] text-canvas/60 hidden md:inline">
              {formatTime(currentSeconds)} / {currentTrack.duration}
            </span>

            <button
              onClick={() => setProgress((p) => Math.max(0, p - 3))}
              className="p-1 text-canvas/70 hover:text-white transition-colors cursor-pointer"
              title="Rewind 15s"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onTogglePlay}
              className="w-9 h-9 rounded-full bg-white text-[#171717] flex items-center justify-center hover:bg-white/90 shadow-xs active:scale-95 transition-transform cursor-pointer"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={() => setProgress((p) => Math.min(100, p + 3))}
              className="p-1 text-canvas/70 hover:text-white transition-colors cursor-pointer"
              title="Forward 15s"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={cycleSpeed}
              className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              title="Playback speed"
            >
              {playbackSpeed.toFixed(2)}x
            </button>
          </div>

          {/* Right: Extra controls & Close */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 text-canvas/70 hover:text-white transition-colors cursor-pointer"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-canvas/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Close player"
              aria-label="Close player"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
