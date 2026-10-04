'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Volume2, Video, AlertCircle } from 'lucide-react';
import { MediaItemData } from '../../../../lib/db/store';
import { updateMediaAction } from '../../actions';
import { CATEGORIES } from '../../../../data/contentData';

interface EditMediaClientProps {
  media: MediaItemData;
}

export default function EditMediaClient({ media }: EditMediaClientProps) {
  const router = useRouter();

  const [form, setForm] = useState({
    id: media.id,
    title: media.title,
    description: media.description,
    speaker: media.speaker,
    speakerTitle: media.speakerTitle,
    categoryId: media.categoryId,
    categoryLabel: media.categoryLabel,
    duration: media.duration,
    durationSeconds: media.durationSeconds,
    location: media.location,
    district: media.district,
    language: media.language,
    tags: media.tags.join(', '),
    keyTakeaways: media.keyTakeaways.join('\n'),
    status: media.status,
    isFeatured: media.isFeatured,
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const tagsArray = form.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    const takeawaysArray = form.keyTakeaways
      .split('\n')
      .map((t) => t.trim())
      .filter(Boolean);

    const res = await updateMediaAction({
      ...form,
      tags: tagsArray,
      keyTakeaways: takeawaysArray,
    });

    setLoading(false);

    if (res.success) {
      router.push('/admin/media');
    } else {
      setError(res.error || 'Failed to update media');
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

      <div className="p-6 sm:p-8 rounded-3xl bg-surface border border-black/8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#171717] text-white text-[10px] font-medium mb-2">
            {media.mediaType === 'audio' ? (
              <Volume2 className="w-3 h-3 text-accent-gold" />
            ) : (
              <Video className="w-3 h-3 text-accent-orange" />
            )}
            <span className="capitalize">{media.mediaType} Recording</span>
          </div>
          <h2 className="font-serif-heading text-3xl font-medium text-[#171717]">
            Edit Media: {media.title}
          </h2>
          <p className="text-xs text-secondary">Storage Reference: {media.storageKey}</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-white border border-black/8 shadow-2xs space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#171717] mb-1">Teaching Title *</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
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
            className="w-full bg-surface text-xs px-3.5 py-2.5 rounded-xl border border-black/8 focus:outline-none focus:border-[#171717]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#171717] mb-1">Speaker *</label>
            <input
              type="text"
              required
              value={form.speaker}
              onChange={(e) => setForm({ ...form, speaker: e.target.value })}
              className="w-full bg-surface text-xs px-3.5 py-2.5 rounded-xl border border-black/8 focus:outline-none focus:border-[#171717]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#171717] mb-1">Speaker Title *</label>
            <input
              type="text"
              required
              value={form.speakerTitle}
              onChange={(e) => setForm({ ...form, speakerTitle: e.target.value })}
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
              className="w-full bg-surface text-xs px-3.5 py-2.5 rounded-xl border border-black/8 focus:outline-none focus:border-[#171717]"
            />
          </div>

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
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#171717] mb-1">Location / Mosque *</label>
          <input
            type="text"
            required
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="w-full bg-surface text-xs px-3.5 py-2.5 rounded-xl border border-black/8 focus:outline-none focus:border-[#171717]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-[#171717] mb-1">Publication Status</label>
            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as 'published' | 'draft' | 'archived' })
              }
              className="w-full bg-surface text-xs px-3.5 py-2 rounded-xl border border-black/8"
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="flex items-center pt-5">
            <label className="flex items-center gap-2 text-xs font-medium text-[#171717] cursor-pointer">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                className="rounded border-black/20"
              />
              <span>Feature on Public Homepage</span>
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-black/8 flex items-center justify-end gap-3">
          <Link
            href="/admin/media"
            className="px-4 py-2 rounded-xl text-xs font-medium text-secondary"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-[#171717] text-white text-xs font-medium hover:bg-black disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
