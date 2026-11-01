'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Upload,
  Volume2,
  Video,
  AlertCircle,
  Building2,
} from 'lucide-react';
import { createMediaAction } from '../../actions';
import { CATEGORIES } from '../../../../data/contentData';
import { AdminUserData } from '../../../../lib/db/store';

interface NewMediaClientProps {
  currentUser?: AdminUserData;
}

export default function NewMediaClient({ currentUser }: NewMediaClientProps) {
  const router = useRouter();

  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);

  const initialLocation = currentUser?.mosque?.name
    ? `${currentUser.mosque.name}${currentUser.mosque.location ? `, ${currentUser.mosque.location}` : ''}`
    : '';

  const [form, setForm] = useState({
    title: '',
    description: '',
    speaker: '',
    speakerTitle: '',
    categoryId: 'khutbahs',
    categoryLabel: 'Friday Khutbah',
    mediaType: 'audio' as 'audio' | 'video',
    duration: '25:00',
    durationSeconds: 1500,
    fileName: '',
    fileSize: 1024 * 1024 * 15, // 15 MB
    mimeType: 'audio/mpeg',
    thumbnailName: '',
    location: initialLocation,
    district: 'Blantyre',
    language: 'Chichewa / English',
    tags: 'Malawi, Khutbah, Jumu’ah',
    keyTakeaways: 'Core reflection\nPractical implementation\nClosing supplication',
    status: 'published' as 'published' | 'draft' | 'archived',
    isFeatured: false,
  });

  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const districts = ['Blantyre', 'Lilongwe', 'Zomba', 'Mzuzu', 'Mangochi', 'Salima', 'Dedza', 'Balaka', 'Kasungu'];

  const handleCategoryChange = (catId: string) => {
    const selected = CATEGORIES.find((c) => c.id === catId);
    setForm({
      ...form,
      categoryId: catId,
      categoryLabel: selected?.title || 'Islamic Teaching',
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
      const previewUrl = URL.createObjectURL(file);
      setLocalPreviewUrl(previewUrl);

      setForm({
        ...form,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || (form.mediaType === 'audio' ? 'audio/mpeg' : 'video/mp4'),
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.fileName) {
      setError('Please select or upload a media file.');
      return;
    }

    setLoading(true);
    setUploadProgress(10);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (!prev || prev >= 90) return prev;
        return prev + 25;
      });
    }, 150);

    const tagsArray = form.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const takeawaysArray = form.keyTakeaways
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean);

    const res = await createMediaAction({
      ...form,
      tags: tagsArray,
      keyTakeaways: takeawaysArray,
    });

    clearInterval(interval);
    setUploadProgress(100);
    setLoading(false);

    if (res.success) {
      router.push('/admin/media');
    } else {
      setError(res.error || 'Failed to upload and create media');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <Link
          href="/admin/media"
          className="inline-flex items-center gap-2 text-xs font-medium text-secondary hover:text-[#171717] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Media Library</span>
        </Link>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-black/8 shadow-xs">
        <h2 className="font-serif-heading text-3xl font-medium text-[#171717] mb-1">
          Upload New Islamic Media
        </h2>
        <p className="text-xs text-secondary">
          {currentUser?.role === 'mosque' && currentUser.mosque
            ? `Publish audio sermons, Friday khutbahs, or video recordings for ${currentUser.mosque.name}.`
            : 'Publish audio sermons, Friday khutbahs, or video lectures to the platform archive.'}
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: File & Format */}
        <div className="p-6 rounded-2xl bg-white border border-black/8 shadow-2xs space-y-4">
          <h3 className="font-serif-heading text-xl font-medium text-[#171717]">
            1. Media Format & File Upload
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() =>
                setForm({
                  ...form,
                  mediaType: 'audio',
                  mimeType: 'audio/mpeg',
                  fileName: form.fileName.replace(/\.mp4$/i, '.mp3'),
                })
              }
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                form.mediaType === 'audio'
                  ? 'bg-surface border-[#171717] shadow-xs'
                  : 'border-black/10 hover:border-black/20'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-black/5 text-accent-gold">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-xs text-[#171717]">Audio Sermon / Khutbah</div>
                <div className="text-[10px] text-secondary">MP3, M4A up to 100MB</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() =>
                setForm({
                  ...form,
                  mediaType: 'video',
                  mimeType: 'video/mp4',
                  fileName: form.fileName.replace(/\.mp3$/i, '.mp4'),
                })
              }
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                form.mediaType === 'video'
                  ? 'bg-surface border-[#171717] shadow-xs'
                  : 'border-black/10 hover:border-black/20'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-black/5 text-accent-orange">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <div className="font-semibold text-xs text-[#171717]">Video Lecture / Khutbah</div>
                <div className="text-[10px] text-secondary">MP4, WebM up to 500MB</div>
              </div>
            </button>
          </div>

          {/* Upload Dropzone Container */}
          <div className="border-2 border-dashed border-black/15 rounded-2xl p-6 text-center hover:border-black/30 transition-colors bg-surface/30">
            <Upload className="w-8 h-8 text-secondary mx-auto mb-2 opacity-70" />
            <p className="text-xs font-semibold text-[#171717] mb-1">
              {form.fileName ? `Selected: ${form.fileName}` : 'Choose media file or drag & drop'}
            </p>
            <p className="text-[11px] text-secondary mb-3">
              Server-validated storage reference with unique object key
            </p>

            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#171717] text-white text-xs font-medium hover:bg-black transition-colors cursor-pointer">
              <span>Browse Files</span>
              <input
                type="file"
                accept={form.mediaType === 'audio' ? 'audio/*' : 'video/*'}
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>

          {/* Local Media Audio/Video Preview */}
          {localPreviewUrl && (
            <div className="p-4 rounded-2xl bg-surface border border-black/8 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#171717] flex items-center gap-1.5">
                  {form.mediaType === 'audio' ? (
                    <Volume2 className="w-4 h-4 text-accent-gold" />
                  ) : (
                    <Video className="w-4 h-4 text-accent-orange" />
                  )}
                  <span>Live Preview Selected Media</span>
                </span>
                <span className="font-mono text-[11px] text-secondary">
                  {(form.fileSize / (1024 * 1024)).toFixed(1)} MB
                </span>
              </div>
              {form.mediaType === 'audio' ? (
                <audio controls src={localPreviewUrl} className="w-full" />
              ) : (
                <video
                  controls
                  src={localPreviewUrl}
                  className="w-full max-h-60 rounded-xl bg-black"
                />
              )}
            </div>
          )}

          {/* Upload Progress Indicator */}
          {uploadProgress !== null && (
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-secondary font-mono">
                <span>Direct Storage Transfer</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-black/5 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-accent-orange h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Metadata Details */}
        <div className="p-6 rounded-2xl bg-white border border-black/8 shadow-2xs space-y-4">
          <h3 className="font-serif-heading text-xl font-medium text-[#171717]">
            2. Sermon Metadata & Details
          </h3>

          <div>
            <label className="block text-xs font-semibold text-[#171717] mb-1">
              Teaching / Khutbah Title *
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. The Importance of Salah in Daily Life"
              className="w-full bg-surface text-xs px-3.5 py-2.5 rounded-xl border border-black/8 focus:outline-none focus:border-[#171717]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#171717] mb-1">Description *</label>
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Detailed overview and spiritual context of the sermon..."
              className="w-full bg-surface text-xs px-3.5 py-2.5 rounded-xl border border-black/8 focus:outline-none focus:border-[#171717]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1">
                Speaker / Scholar *
              </label>
              <input
                type="text"
                required
                value={form.speaker}
                onChange={(e) => setForm({ ...form, speaker: e.target.value })}
                placeholder="e.g. Sheikh Yusuf Banda"
                className="w-full bg-surface text-xs px-3.5 py-2.5 rounded-xl border border-black/8 focus:outline-none focus:border-[#171717]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1">
                Speaker Title *
              </label>
              <input
                type="text"
                required
                value={form.speakerTitle}
                onChange={(e) => setForm({ ...form, speakerTitle: e.target.value })}
                placeholder="e.g. Resident Scholar, Blantyre Central Mosque"
                className="w-full bg-surface text-xs px-3.5 py-2.5 rounded-xl border border-black/8 focus:outline-none focus:border-[#171717]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1">Category *</label>
              <select
                value={form.categoryId}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full bg-surface text-xs px-3.5 py-2.5 rounded-xl border border-black/8 focus:outline-none focus:border-[#171717]"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1">Duration *</label>
              <input
                type="text"
                required
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                placeholder="MM:SS (e.g. 28:40)"
                className="w-full bg-surface text-xs px-3.5 py-2.5 rounded-xl border border-black/8 focus:outline-none focus:border-[#171717]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1">Language *</label>
              <input
                type="text"
                required
                value={form.language}
                onChange={(e) => setForm({ ...form, language: e.target.value })}
                placeholder="e.g. Chichewa / English"
                className="w-full bg-surface text-xs px-3.5 py-2.5 rounded-xl border border-black/8 focus:outline-none focus:border-[#171717]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1">District *</label>
              <select
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                className="w-full bg-surface text-xs px-3.5 py-2.5 rounded-xl border border-black/8 focus:outline-none focus:border-[#171717]"
              >
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {d} District
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#171717]">
                  Mosque / Recording Hall *
                </label>
                {currentUser?.role === 'mosque' && currentUser.mosque && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-medium">
                    <Building2 className="w-3 h-3" />
                    <span>Mosque registered</span>
                  </span>
                )}
              </div>
              <input
                type="text"
                required
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="e.g. Central Mosque, Blantyre"
                className="w-full bg-surface text-xs px-3.5 py-2.5 rounded-xl border border-black/8 focus:outline-none focus:border-[#171717]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#171717] mb-1">
              Core Takeaways (one per line)
            </label>
            <textarea
              rows={3}
              value={form.keyTakeaways}
              onChange={(e) => setForm({ ...form, keyTakeaways: e.target.value })}
              placeholder="First key takeaway point&#10;Second key takeaway point"
              className="w-full bg-surface text-xs px-3.5 py-2.5 rounded-xl border border-black/8 focus:outline-none focus:border-[#171717]"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <label className="block text-xs font-semibold text-[#171717] mb-1">
                Publication Status
              </label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as 'published' | 'draft' | 'archived' })
                }
                className="bg-surface text-xs px-3.5 py-2 rounded-xl border border-black/8"
              >
                <option value="published">Published (Visible on platform)</option>
                <option value="draft">Draft (Private preview)</option>
                <option value="archived">Archived (Hidden)</option>
              </select>
            </div>

            <label className="flex items-center gap-2 text-xs font-medium text-[#171717] cursor-pointer pt-4">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                className="w-4 h-4 rounded border-black/20 text-[#171717] focus:ring-0"
              />
              <span>Feature on Public Homepage Banner</span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/admin/media"
            className="px-5 py-2.5 rounded-xl border border-black/10 text-xs font-medium text-secondary hover:text-[#171717] hover:bg-black/5 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-[#171717] text-white text-xs font-medium hover:bg-black transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            {loading ? 'Publishing Media...' : 'Publish Media to Archive'}
          </button>
        </div>
      </form>
    </div>
  );
}
