'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  RotateCw,
  MapPin,
  Clock,
  Sparkles,
  Tag,
  FileAudio,
  FileVideo,
  Database,
  Globe,
  Edit,
  Archive,
  RotateCcw as RestoreIcon,
  Copy,
  Check,
  AlertCircle,
  Info,
} from 'lucide-react';
import { MediaItemData } from '../../../lib/db/store';

interface MediaReviewModalProps {
  media: MediaItemData | null;
  onClose: () => void;
  canUpdate?: boolean;
  canArchive?: boolean;
  onArchive?: (item: MediaItemData) => void;
  onRestore?: (item: MediaItemData) => void;
}

export default function MediaReviewModal(props: MediaReviewModalProps) {
  if (!props.media) return null;
  return <MediaReviewModalContent key={props.media.id} {...props} media={props.media} />;
}

function MediaReviewModalContent({
  media,
  onClose,
  canUpdate = false,
  canArchive = false,
  onArchive,
  onRestore,
}: MediaReviewModalProps & { media: MediaItemData }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Dynamic signed URL playback state
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [isLoadingMedia, setIsLoadingMedia] = useState(true);

  // Audio Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(media.durationSeconds || 0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [mediaLoadError, setMediaLoadError] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [activeTab, setActiveTab] = useState<'player' | 'metadata'>('player');

  useEffect(() => {
    let cancelled = false;

    async function loadPlaybackUrl() {
      try {
        setIsLoadingMedia(true);
        setMediaLoadError(false);

        const response = await fetch(`/api/admin/media/${media.id}/playback`);

        if (!response.ok) {
          throw new Error('Failed to load media playback URL');
        }

        const data = await response.json();

        if (!cancelled) {
          setMediaUrl(data.mediaUrl);
          setThumbnailUrl(data.thumbnailUrl ?? null);
        }
      } catch (error) {
        console.error('Failed to load media playback:', error);

        if (!cancelled) {
          setMediaLoadError(true);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingMedia(false);
        }
      }
    }

    loadPlaybackUrl();

    return () => {
      cancelled = true;
    };
  }, [media.id]);

  // Format seconds into MM:SS or HH:MM:SS
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const totalSeconds = Math.floor(secs);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    if (bytes >= 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Audio Player Controls
  const togglePlayAudio = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setMediaLoadError(false);
        })
        .catch((err) => {
          console.warn('Audio playback error (stream may be unreachable):', err);
          setMediaLoadError(true);
          setIsPlaying(false);
        });
    }
  };

  const handleSeek = (newTime: number) => {
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const skipTime = (offset: number) => {
    if (!audioRef.current) return;
    const newTime = Math.min(Math.max(0, audioRef.current.currentTime + offset), duration || 9999);
    handleSeek(newTime);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audioRef.current.muted = nextMute;
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      audioRef.current.muted = newVolume === 0;
    }
  };

  const cycleSpeed = () => {
    const speeds = [0.75, 1.0, 1.25, 1.5, 2.0];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setPlaybackSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const handleCopyKey = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(media.storageKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-surface rounded-3xl border border-black/10 shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-black/8 flex items-center justify-between bg-white/60">
          <div className="flex items-center gap-3 pr-4">
            <div className="w-10 h-10 rounded-2xl bg-[#171717] text-white flex items-center justify-center shrink-0 shadow-xs">
              {media.mediaType === 'audio' ? (
                <FileAudio className="w-5 h-5 text-accent-gold" />
              ) : (
                <FileVideo className="w-5 h-5 text-accent-orange" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-secondary">
                  Reviewing Media
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    media.status === 'published'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : media.status === 'archived'
                      ? 'bg-stone-100 text-stone-600 border border-stone-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      media.status === 'published'
                        ? 'bg-emerald-600'
                        : media.status === 'archived'
                        ? 'bg-stone-500'
                        : 'bg-amber-600'
                    }`}
                  />
                  <span>{media.status}</span>
                </span>
              </div>
              <h3 className="font-serif-heading text-xl sm:text-2xl font-semibold text-[#171717] line-clamp-1">
                {media.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 text-secondary hover:text-[#171717] transition-colors cursor-pointer"
            aria-label="Close preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-black/8 flex gap-6 bg-surface text-xs font-medium">
          <button
            onClick={() => setActiveTab('player')}
            className={`py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'player'
                ? 'border-[#171717] text-[#171717] font-semibold'
                : 'border-transparent text-secondary hover:text-[#171717]'
            }`}
          >
            Media Player & Overview
          </button>
          <button
            onClick={() => setActiveTab('metadata')}
            className={`py-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'metadata'
                ? 'border-[#171717] text-[#171717] font-semibold'
                : 'border-transparent text-secondary hover:text-[#171717]'
            }`}
          >
            Technical Specs & Storage Details
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'player' && (
            <>
              {/* Media Player Section */}
              {isLoadingMedia ? (
                <div className="flex items-center justify-center h-48 text-xs text-secondary bg-white rounded-3xl border border-black/8 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent-orange animate-pulse" />
                    <span>Loading secure playback stream from object storage...</span>
                  </div>
                </div>
              ) : mediaUrl ? (
                media.mediaType === 'audio' ? (
                  /* Audio Player Card */
                  <div className="bg-[#171717] text-white rounded-3xl p-5 sm:p-6 shadow-lg border border-white/10 space-y-4">
                    {/* Hidden native audio element */}
                    <audio
                      ref={audioRef}
                      src={mediaUrl ?? undefined}
                      preload="metadata"
                      onTimeUpdate={() => {
                        if (audioRef.current) {
                          setCurrentTime(audioRef.current.currentTime);
                        }
                      }}
                      onLoadedMetadata={() => {
                        if (audioRef.current && audioRef.current.duration) {
                          setDuration(audioRef.current.duration);
                        }
                      }}
                      onEnded={() => {
                        setIsPlaying(false);
                        setCurrentTime(0);
                      }}
                      onError={() => {
                        setMediaLoadError(true);
                        setIsPlaying(false);
                      }}
                    />

                    {/* Top Bar: Title & Format Badge */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-accent-gold text-[10px] font-mono uppercase tracking-wider">
                          <Volume2 className="w-3 h-3" />
                          <span>Audio Preaching • {media.categoryLabel}</span>
                        </div>
                        <h4 className="text-base sm:text-lg font-serif-heading font-medium text-white line-clamp-1">
                          {media.title}
                        </h4>
                        <p className="text-xs text-white/70">
                          {media.speaker} • {media.location}
                        </p>
                      </div>

                      {/* Animated Equalizer Waveform */}
                      <div className="flex items-end gap-1 h-8 px-3 py-1 rounded-xl bg-white/5 shrink-0">
                        {[40, 75, 55, 90, 60, 80, 45, 70, 95, 50].map((h, i) => (
                          <div
                            key={i}
                            className="w-1 rounded-full bg-accent-gold transition-all duration-300"
                            style={{
                              height: isPlaying ? `${Math.max(15, (h * (i % 2 === 0 ? 1 : 0.7)))}%` : '20%',
                              opacity: isPlaying ? 0.9 : 0.3,
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Scrubber / Progress bar */}
                    <div className="space-y-1.5 pt-2">
                      <div className="relative flex items-center group">
                        <input
                          type="range"
                          min={0}
                          max={duration || media.durationSeconds || 100}
                          step="0.5"
                          value={currentTime}
                          onChange={(e) => handleSeek(parseFloat(e.target.value))}
                          className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-accent-orange focus:outline-none"
                        />
                      </div>
                      <div className="flex justify-between items-center text-[11px] font-mono text-white/60">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration || media.durationSeconds || 0)}</span>
                      </div>
                    </div>

                    {/* Main Player Controls */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/10">
                      {/* Playback Controls */}
                      <div className="flex items-center gap-2 sm:gap-3">
                        {/* Rewind 10s */}
                        <button
                          onClick={() => skipTime(-10)}
                          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                          title="Rewind 10 seconds"
                          type="button"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>

                        {/* Play / Pause Primary Button */}
                        <button
                          onClick={togglePlayAudio}
                          className="w-12 h-12 rounded-2xl bg-accent-orange text-white flex items-center justify-center hover:bg-accent-orange/90 transition-transform active:scale-95 shadow-md cursor-pointer"
                          title={isPlaying ? 'Pause' : 'Play Audio'}
                          type="button"
                        >
                          {isPlaying ? (
                            <Pause className="w-5 h-5 fill-current" />
                          ) : (
                            <Play className="w-5 h-5 fill-current ml-0.5" />
                          )}
                        </button>

                        {/* Fast Forward 10s */}
                        <button
                          onClick={() => skipTime(10)}
                          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                          title="Forward 10 seconds"
                          type="button"
                        >
                          <RotateCw className="w-4 h-4" />
                        </button>

                        {/* Speed Button */}
                        <button
                          onClick={cycleSpeed}
                          className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[11px] font-mono font-medium text-white transition-colors cursor-pointer"
                          title="Change playback speed"
                          type="button"
                        >
                          {playbackSpeed}x
                        </button>
                      </div>

                      {/* Volume Controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={toggleMute}
                          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                          title={isMuted ? 'Unmute' : 'Mute'}
                          type="button"
                        >
                          {isMuted || volume === 0 ? (
                            <VolumeX className="w-4 h-4 text-rose-400" />
                          ) : (
                            <Volume2 className="w-4 h-4" />
                          )}
                        </button>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step="0.05"
                          value={isMuted ? 0 : volume}
                          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                          className="w-20 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Load / Network Notice */}
                    {mediaLoadError && (
                      <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-amber-100">Unable to load media</p>
                          <p className="text-[11px] text-amber-200/80">
                            The media could not be loaded from object storage. Please try again.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Video Player Card */
                  <div className="space-y-3">
                    <div className="relative rounded-3xl overflow-hidden bg-black aspect-video border border-black/10 shadow-lg flex items-center justify-center">
                      <video
                        ref={videoRef}
                        src={mediaUrl ?? undefined}
                        poster={thumbnailUrl ?? undefined}
                        controls
                        playsInline
                        className="w-full h-full object-contain"
                        onError={() => setMediaLoadError(true)}
                      >
                        Your browser does not support HTML5 video streaming.
                      </video>
                    </div>

                    {mediaLoadError && (
                      <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
                        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-amber-100">Unable to load media</p>
                          <p className="text-[11px] text-amber-200/80">
                            The media could not be loaded from object storage. Please try again.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-xs text-rose-600 bg-rose-50/50 rounded-3xl border border-rose-200 p-6 text-center space-y-1.5">
                  <AlertCircle className="w-5 h-5 text-rose-600" />
                  <span className="font-semibold">Unable to load media playback URL</span>
                  <span className="text-[11px] text-secondary">Storage Key: {media.storageKey}</span>
                </div>
              )}

              {/* Teaching Content & Editorial Details */}
              <div className="p-5 rounded-3xl bg-white border border-black/8 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-black/5 text-[#171717]">
                    {media.categoryLabel}
                  </span>
                  <span className="text-xs text-secondary flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{media.duration}</span>
                  </span>
                  <span className="text-xs text-secondary flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{media.location} ({media.district})</span>
                  </span>
                  <span className="text-xs text-secondary flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5" />
                    <span>{media.language}</span>
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-secondary mb-1.5">
                    Overview & Description
                  </h4>
                  <p className="text-xs sm:text-sm text-[#171717] leading-relaxed">
                    {media.description || 'No description provided.'}
                  </p>
                </div>

                {/* Key Takeaways */}
                {media.keyTakeaways && media.keyTakeaways.length > 0 && (
                  <div className="p-4 rounded-2xl bg-surface border border-black/5 space-y-2">
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-[#171717] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-accent-orange" />
                      <span>Key Takeaways & Core Teachings</span>
                    </h5>
                    <ul className="space-y-1.5 text-xs text-secondary">
                      {media.keyTakeaways.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent-orange mt-1.5 shrink-0" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tags */}
                {media.tags && media.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-2">
                    <Tag className="w-3.5 h-3.5 text-secondary mr-1" />
                    {media.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-lg bg-surface border border-black/6 text-[11px] font-medium text-secondary"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'metadata' && (
            /* Technical Specs Tab */
            <div className="space-y-4">
              <div className="p-5 rounded-3xl bg-white border border-black/8 space-y-4">
                <h4 className="font-serif-heading text-lg font-semibold text-[#171717] flex items-center gap-2">
                  <Database className="w-4 h-4 text-accent-orange" />
                  <span>Storage & Object Architecture</span>
                </h4>

                {/* Storage Key with Copy */}
                <div className="p-3.5 rounded-2xl bg-surface border border-black/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-secondary uppercase">
                      Permanent Storage Key (Object Identifier)
                    </span>
                    <button
                      onClick={handleCopyKey}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-[#171717] hover:text-accent-orange cursor-pointer transition-colors"
                    >
                      {copiedKey ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied Key</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Storage Key</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="font-mono text-xs text-[#171717] bg-white p-2.5 rounded-xl border border-black/5 break-all select-all flex items-center justify-between gap-2">
                    <span className="font-medium">{media.storageKey}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-2xl bg-surface border border-black/5 space-y-1">
                    <span className="text-[11px] font-mono text-secondary uppercase block">
                      MIME Content Type
                    </span>
                    <span className="font-mono font-medium text-[#171717]">
                      {media.mimeType}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-surface border border-black/5 space-y-1">
                    <span className="text-[11px] font-mono text-secondary uppercase block">
                      Approximate File Size
                    </span>
                    <span className="font-mono font-medium text-[#171717]">
                      {formatFileSize(media.fileSize)}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-surface border border-black/5 space-y-1">
                    <span className="text-[11px] font-mono text-secondary uppercase block">
                      Duration Recorded
                    </span>
                    <span className="font-mono font-medium text-[#171717]">
                      {media.duration} ({media.durationSeconds}s)
                    </span>
                  </div>

                  {/* Thumbnail key if present */}
                  {media.thumbnailKey ? (
                    <div className="p-3.5 rounded-2xl bg-surface border border-black/5 space-y-1">
                      <span className="text-[11px] font-mono text-secondary uppercase block">
                        Thumbnail Key Reference
                      </span>
                      <span className="font-mono text-xs text-[#171717] break-all">
                        {media.thumbnailKey}
                      </span>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-surface border border-black/5 space-y-1">
                      <span className="text-[11px] font-mono text-secondary uppercase block">
                        Storage Backend
                      </span>
                      <span className="font-mono text-xs text-[#171717]">
                        Neon S3 / Object Storage
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Attribution & Publishing History */}
              <div className="p-5 rounded-3xl bg-white border border-black/8 space-y-3">
                <h4 className="font-serif-heading text-lg font-semibold text-[#171717] flex items-center gap-2">
                  <Info className="w-4 h-4 text-accent-gold" />
                  <span>Publishing & Audit Records</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="text-secondary">
                    <strong className="text-[#171717] block mb-0.5">Created By User:</strong>
                    <span>{media.createdBy || 'System / Admin'}</span>
                  </div>
                  <div className="text-secondary">
                    <strong className="text-[#171717] block mb-0.5">Featured Status:</strong>
                    <span>{media.isFeatured ? 'Yes (Featured Teaching)' : 'Standard Library Item'}</span>
                  </div>
                  <div className="text-secondary">
                    <strong className="text-[#171717] block mb-0.5">Created Timestamp:</strong>
                    <span>{media.createdAt ? new Date(media.createdAt).toLocaleString() : 'N/A'}</span>
                  </div>
                  <div className="text-secondary">
                    <strong className="text-[#171717] block mb-0.5">Last Updated:</strong>
                    <span>{media.updatedAt ? new Date(media.updatedAt).toLocaleString() : 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer / Actions */}
        <div className="px-6 py-4 border-t border-black/8 bg-white/70 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {canArchive && (
              <>
                {media.status === 'published' && onArchive ? (
                  <button
                    onClick={() => {
                      onArchive(media);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-100 text-xs font-medium transition-colors cursor-pointer border border-amber-200"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    <span>Archive Media</span>
                  </button>
                ) : media.status === 'archived' && onRestore ? (
                  <button
                    onClick={() => {
                      onRestore(media);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-medium transition-colors cursor-pointer border border-emerald-200"
                  >
                    <RestoreIcon className="w-3.5 h-3.5" />
                    <span>Restore to Catalog</span>
                  </button>
                ) : null}
              </>
            )}

            {canUpdate && (
              <Link
                href={`/admin/media/${media.id}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-black/5 hover:bg-black/10 text-[#171717] text-xs font-medium transition-colors"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Details</span>
              </Link>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#171717] text-white text-xs font-medium hover:bg-black transition-colors cursor-pointer"
          >
            Close Review
          </button>
        </div>
      </div>
    </div>
  );
}
