'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Volume2,
  Video,
  Search,
  PlusCircle,
  Archive,
  RotateCcw,
  Trash2,
  Edit,
  MapPin,
  X,
  Play,
  AlertTriangle,
} from 'lucide-react';
import { MediaItemData, AdminUserData } from '../../../lib/db/store';
import { archiveMediaAction, restoreMediaAction, deleteMediaAction } from '../actions';
import { hasPermission } from '../../../lib/auth/permissions';
import { CATEGORIES } from '../../../data/contentData';

interface MediaClientProps {
  initialMedia: MediaItemData[];
  currentUser: AdminUserData;
}

export default function MediaClient({ initialMedia, currentUser }: MediaClientProps) {
  const [mediaList, setMediaList] = useState<MediaItemData[]>(initialMedia);
  const [searchQuery, setSearchQuery] = useState('');
  const [mediaTypeFilter, setMediaTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [previewMedia, setPreviewMedia] = useState<MediaItemData | null>(null);
  const [deletingMedia, setDeletingMedia] = useState<MediaItemData | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Permission checks
  const canCreate = hasPermission(currentUser.permissions, 'media.create');
  const canUpdate = hasPermission(currentUser.permissions, 'media.update');
  const canArchive = hasPermission(currentUser.permissions, 'media.archive');
  const canDelete = hasPermission(currentUser.permissions, 'media.delete');

  const filteredMedia = mediaList.filter((m) => {
    if (mediaTypeFilter !== 'all' && m.mediaType !== mediaTypeFilter) return false;
    if (categoryFilter !== 'all' && m.categoryId !== categoryFilter) return false;
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.title.toLowerCase().includes(q) ||
        m.speaker.toLowerCase().includes(q) ||
        m.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleArchive = async (item: MediaItemData) => {
    setLoading(true);
    setMessage(null);

    const res = await archiveMediaAction(item.id);
    setLoading(false);

    if (res.success && res.media) {
      setMediaList(mediaList.map((m) => (m.id === item.id ? res.media : m)));
      setMessage({
        type: 'success',
        text: `Archived "${item.title}". It has been hidden from public discovery.`,
      });
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to archive media' });
    }
  };

  const handleRestore = async (item: MediaItemData) => {
    setLoading(true);
    setMessage(null);

    const res = await restoreMediaAction(item.id);
    setLoading(false);

    if (res.success && res.media) {
      setMediaList(mediaList.map((m) => (m.id === item.id ? res.media : m)));
      setMessage({
        type: 'success',
        text: `Restored "${item.title}" to the active public catalog.`,
      });
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to restore media' });
    }
  };

  const handleDelete = async () => {
    if (!deletingMedia) return;
    setLoading(true);
    setMessage(null);

    const res = await deleteMediaAction(deletingMedia.id);
    setLoading(false);
    const title = deletingMedia.title;
    setDeletingMedia(null);

    if (res.success) {
      setMediaList(mediaList.filter((m) => m.id !== deletingMedia.id));
      setMessage({ type: 'success', text: `Permanently deleted "${title}".` });
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to delete media' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-heading text-3xl font-medium text-[#171717]">
            Media Management
          </h2>
          <p className="text-xs text-secondary">
            Archive, publish, and manage audio preachings, Friday khutbahs, and video lectures.
          </p>
        </div>

        {canCreate && (
          <Link
            href="/admin/media/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#171717] text-white text-xs font-medium hover:bg-black transition-all shadow-xs self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4 text-accent-orange" />
            <span>Add New Recording</span>
          </Link>
        )}
      </div>

      {/* Message Banner */}
      {message && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="p-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-black/8 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, scholar, masjid..."
              className="w-full bg-surface text-xs text-[#171717] placeholder-secondary/70 pl-9 pr-4 py-2 rounded-xl border border-black/8 focus:outline-none focus:border-[#171717]"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
            {/* Format Filter */}
            <div className="flex items-center gap-1 bg-surface px-3 py-1.5 rounded-xl border border-black/8 text-xs">
              <span className="text-secondary text-[11px]">Format:</span>
              <select
                value={mediaTypeFilter}
                onChange={(e) => setMediaTypeFilter(e.target.value)}
                className="bg-transparent border-none text-xs font-semibold text-[#171717] focus:outline-none cursor-pointer"
              >
                <option value="all">All Media</option>
                <option value="audio">Audio Only</option>
                <option value="video">Video Only</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1 bg-surface px-3 py-1.5 rounded-xl border border-black/8 text-xs">
              <span className="text-secondary text-[11px]">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-transparent border-none text-xs font-semibold text-[#171717] focus:outline-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-surface px-3 py-1.5 rounded-xl border border-black/8 text-xs">
              <span className="text-secondary text-[11px]">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent border-none text-xs font-semibold text-[#171717] focus:outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Media Table */}
      <div className="rounded-2xl bg-white border border-black/8 shadow-2xs overflow-hidden">
        {filteredMedia.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface border-b border-black/8 text-secondary font-mono text-[10px] uppercase">
                  <tr>
                    <th className="py-3.5 px-5">Recording Details</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Format</th>
                    <th className="py-3.5 px-4">Location</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {filteredMedia.map((m) => (
                    <tr key={m.id} className="hover:bg-black/2 transition-colors">
                      {/* Title & Speaker */}
                      <td className="py-4 px-5 max-w-xs">
                        <div className="font-serif-heading text-base font-semibold text-[#171717] line-clamp-1">
                          {m.title}
                        </div>
                        <div className="text-[11px] text-secondary">
                          {m.speaker} • {m.speakerTitle}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 text-secondary">
                        <span className="px-2 py-0.5 rounded bg-black/5 text-[11px] font-medium text-[#171717]">
                          {m.categoryLabel}
                        </span>
                      </td>

                      {/* Format & Duration */}
                      <td className="py-4 px-4">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#171717] text-white">
                          {m.mediaType === 'audio' ? (
                            <Volume2 className="w-3 h-3 text-accent-gold" />
                          ) : (
                            <Video className="w-3 h-3 text-accent-orange" />
                          )}
                          <span className="capitalize">{m.mediaType}</span>
                          <span>• {m.duration}</span>
                        </div>
                      </td>

                      {/* Location & District */}
                      <td className="py-4 px-4 text-secondary">
                        <div className="flex items-center gap-1 text-[11px]">
                          <MapPin className="w-3 h-3 text-secondary" />
                          <span>{m.district}</span>
                        </div>
                        <span className="text-[10px] text-secondary/70">{m.location}</span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            m.status === 'published'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : m.status === 'archived'
                              ? 'bg-stone-100 text-stone-600 border border-stone-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              m.status === 'published'
                                ? 'bg-emerald-600'
                                : m.status === 'archived'
                                ? 'bg-stone-500'
                                : 'bg-amber-600'
                            }`}
                          />
                          <span>{m.status}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => setPreviewMedia(m)}
                            className="p-1.5 rounded-lg text-secondary hover:text-[#171717] hover:bg-black/5 transition-colors cursor-pointer"
                            title="Preview Media"
                          >
                            <Play className="w-4 h-4 fill-current" />
                          </button>

                          {canUpdate && (
                            <Link
                              href={`/admin/media/${m.id}`}
                              className="p-1.5 rounded-lg text-secondary hover:text-[#171717] hover:bg-black/5 transition-colors"
                              title="Edit Media"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                          )}

                          {canArchive && (
                            <>
                              {m.status === 'published' ? (
                                <button
                                  onClick={() => handleArchive(m)}
                                  className="p-1.5 rounded-lg text-secondary hover:text-amber-700 hover:bg-black/5 transition-colors cursor-pointer"
                                  title="Archive media (Hide from public discovery)"
                                >
                                  <Archive className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleRestore(m)}
                                  className="p-1.5 rounded-lg text-secondary hover:text-emerald-700 hover:bg-black/5 transition-colors cursor-pointer"
                                  title="Restore to public platform"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                </button>
                              )}
                            </>
                          )}

                          {canDelete && (
                            <button
                              onClick={() => setDeletingMedia(m)}
                              className="p-1.5 rounded-lg text-secondary hover:text-rose-700 hover:bg-black/5 transition-colors cursor-pointer"
                              title="Delete permanently"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Layout */}
            <div className="divide-y divide-black/5 md:hidden">
              {filteredMedia.map((m) => (
                <div key={m.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-base font-serif-heading font-medium text-[#171717]">
                        {m.title}
                      </h4>
                      <p className="text-xs text-secondary">
                        {m.speaker} • {m.district}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-black/5">
                      {m.mediaType}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-secondary">
                    <span>{m.categoryLabel}</span>
                    <span className="font-mono text-[10px]">{m.duration}</span>
                  </div>

                  <div className="pt-2 border-t border-black/5 flex items-center justify-end gap-2">
                    <button
                      onClick={() => setPreviewMedia(m)}
                      className="px-3 py-1 rounded-lg text-xs bg-black/5 text-[#171717]"
                    >
                      Preview
                    </button>
                    {canUpdate && (
                      <Link
                        href={`/admin/media/${m.id}`}
                        className="px-3 py-1 rounded-lg text-xs bg-black/5 text-[#171717]"
                      >
                        Edit
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="p-12 text-center text-xs text-secondary">
            No recordings found matching your filter criteria.
          </div>
        )}
      </div>

      {/* 1. Modal: Media Preview */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-surface rounded-3xl border border-black/10 shadow-2xl p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/8">
              <h3 className="font-serif-heading text-2xl font-medium text-[#171717]">
                Media Preview
              </h3>
              <button
                onClick={() => setPreviewMedia(null)}
                className="p-1.5 rounded-full hover:bg-black/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-white border border-black/5">
                <span className="text-[10px] uppercase tracking-wider font-bold text-accent-orange block mb-1">
                  {previewMedia.categoryLabel}
                </span>
                <h4 className="font-serif-heading text-xl text-[#171717] font-medium mb-1">
                  {previewMedia.title}
                </h4>
                <p className="text-xs text-secondary">
                  {previewMedia.speaker} • {previewMedia.location} ({previewMedia.district})
                </p>
              </div>

              {/* Player UI representation */}
              <div className="p-4 rounded-2xl bg-[#171717] text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    {previewMedia.mediaType === 'audio' ? (
                      <Volume2 className="w-5 h-5 text-accent-gold" />
                    ) : (
                      <Video className="w-5 h-5 text-accent-orange" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white truncate max-w-50">
                      {previewMedia.title}
                    </p>
                    <p className="text-[10px] text-white/60 font-mono">{previewMedia.duration}</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white/80">
                  Ready to stream
                </span>
              </div>

              {/* Storage references */}
              <div className="p-3 bg-black/4 rounded-xl text-[11px] font-mono text-secondary space-y-1">
                <div>Storage Key: {previewMedia.storageKey}</div>
                <div>Language: {previewMedia.language}</div>
              </div>
            </div>

            <div className="pt-4 border-t border-black/8 flex justify-end">
              <button
                onClick={() => setPreviewMedia(null)}
                className="px-4 py-2 rounded-xl bg-[#171717] text-white text-xs font-medium"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal: Confirm Delete */}
      {deletingMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="bg-surface rounded-3xl border border-black/10 shadow-2xl p-6 max-w-md w-full space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-red-100 text-red-700">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif-heading text-xl font-medium text-[#171717]">
                  Delete Media Recording
                </h3>
                <p className="text-xs text-secondary">Confirm permanent deletion</p>
              </div>
            </div>

            <p className="text-xs text-secondary leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <strong className="text-[#171717]">&ldquo;{deletingMedia.title}&rdquo;</strong>? This
              action will remove the database record and clean up the object storage file. This
              cannot be undone.
            </p>

            <div className="pt-4 border-t border-black/8 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingMedia(null)}
                className="px-4 py-2 rounded-xl text-xs text-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-red-600 text-white text-xs font-medium hover:bg-red-700 disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Deleting...' : 'Confirm Permanent Deletion'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
