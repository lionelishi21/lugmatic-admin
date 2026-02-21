// @ts-nocheck
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Plus, Edit3, Trash2, BarChart3, Upload, Loader2, Play, Pause,
  Headphones, TrendingUp, Eye, Search, Mic, ChevronDown, X, CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { podcastService } from '../../services/podcastService';
import type { Podcast, CreatePodcastRequest } from '../../types';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

const CATEGORIES = ['Music', 'Comedy', 'News', 'Education', 'Technology', 'Lifestyle'];

const inputClass =
  'w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent text-gray-900 placeholder-gray-400 transition-all duration-200 text-sm';
const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5';

export default function Podcasts() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'all' | 'published' | 'drafts' | 'analytics'>('all');
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Podcast | null>(null);
  const [podcastToDelete, setPodcastToDelete] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<CreatePodcastRequest>({
    title: '', description: '', audioUrl: '', category: '', tags: [],
  });

  useEffect(() => { void load(); }, []);

  async function load() {
    try {
      setLoading(true);
      const resp = await podcastService.getArtistPodcasts('current-artist-id');
      const data = resp?.data?.data as unknown as Podcast[];
      setPodcasts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load podcasts');
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setEditing(null);
    setForm({ title: '', description: '', audioUrl: '', category: '', tags: [] });
  }

  function openCreate() { resetForm(); setOpen(true); }

  function openEdit(p: Podcast) {
    setEditing(p);
    setForm({ title: p.title, description: p.description, audioUrl: p.audioUrl, category: p.category, tags: p.tags || [] });
    setOpen(true);
  }

  async function handleSubmit() {
    try {
      setUploading(true);
      if (editing) {
        await podcastService.updatePodcast(editing._id, form);
        toast.success('Podcast updated');
      } else {
        await podcastService.createPodcast(form);
        toast.success('Podcast created');
      }
      setOpen(false);
      resetForm();
      await load();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save podcast');
    } finally {
      setUploading(false);
    }
  }

  async function confirmDelete() {
    if (!podcastToDelete) return;
    try {
      await podcastService.deletePodcast(podcastToDelete);
      toast.success('Podcast deleted');
      await load();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete podcast');
    } finally {
      setPodcastToDelete(null);
    }
  }

  async function handleTogglePublish(id: string, isPublished: boolean) {
    try {
      await podcastService.togglePublishStatus(id, !isPublished);
      toast.success(!isPublished ? 'Published' : 'Unpublished');
      await load();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    }
  }

  const totals = useMemo(() => {
    const published = podcasts.filter(p => p.isPublished).length;
    const listeners = podcasts.reduce((s, p) => s + (p.listeners || 0), 0);
    const likes = podcasts.reduce((s, p) => s + (p.likes || 0), 0);
    return { published, listeners, likes };
  }, [podcasts]);

  const filtered = useMemo(() => {
    let list = podcasts;
    if (tab === 'published') list = list.filter(p => p.isPublished);
    if (tab === 'drafts') list = list.filter(p => !p.isPublished);
    if (search.trim()) list = list.filter(p =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
    );
    return list;
  }, [podcasts, tab, search]);

  const tabs = [
    { id: 'all', label: 'All', count: podcasts.length },
    { id: 'published', label: 'Published', count: totals.published },
    { id: 'drafts', label: 'Drafts', count: podcasts.length - totals.published },
    { id: 'analytics', label: 'Analytics', count: null },
  ] as const;

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg shadow-green-500/20">
            <Mic className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Podcasts</h1>
            <p className="text-gray-500 text-sm">Manage your podcast content and track performance</p>
          </div>
        </div>
        <motion.button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30 transition-all duration-200"
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="h-4 w-4" />
          Upload Podcast
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Headphones, label: 'Total Podcasts', value: podcasts.length, color: 'text-blue-500', bg: 'bg-blue-50' },
          { icon: Play, label: 'Published', value: totals.published, color: 'text-green-500', bg: 'bg-green-50' },
          { icon: TrendingUp, label: 'Total Listeners', value: totals.listeners.toLocaleString(), color: 'text-amber-500', bg: 'bg-amber-50' },
          { icon: Eye, label: 'Total Likes', value: totals.likes.toLocaleString(), color: 'text-rose-500', bg: 'bg-rose-50' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className={`${bg} p-2.5 rounded-xl`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-xl font-bold text-gray-900">{loading ? '—' : value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs + Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 pt-4 pb-0 border-b border-gray-100">
          {/* Tabs */}
          <div className="flex gap-1">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-all duration-150 -mb-px ${
                  tab === t.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {t.id === 'analytics' ? <BarChart3 className="h-3.5 w-3.5" /> : null}
                {t.label}
                {t.count !== null && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    tab === t.id ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search */}
          {tab !== 'analytics' && (
            <div className="relative mb-3 sm:mb-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search podcasts..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent w-56 transition-all duration-200"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          {tab !== 'analytics' ? (
            loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
                    <div className="aspect-video bg-gray-100" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-100 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-full" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-4">
                  <Headphones className="h-8 w-8 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  {search ? 'No results found' : 'No podcasts yet'}
                </h3>
                <p className="text-gray-500 text-sm mb-5">
                  {search ? `No podcasts match "${search}"` : 'Upload your first episode to get started.'}
                </p>
                {!search && (
                  <motion.button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-green-500/20"
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  >
                    <Plus className="h-4 w-4" /> Upload Podcast
                  </motion.button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(p => (
                  <div
                    key={p._id}
                    className="group rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                  >
                    {/* Cover */}
                    <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
                      <img
                        src={p.coverImage || '/default-podcast-cover.jpg'}
                        alt={p.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        loading="lazy"
                      />
                      <div className="absolute top-2 left-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          p.isPublished
                            ? 'bg-green-500/90 text-white'
                            : 'bg-gray-800/70 text-white'
                        }`}>
                          {p.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4 space-y-2">
                      <h3 className="font-semibold text-gray-900 truncate text-sm">{p.title}</h3>
                      <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{p.description}</p>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span>{formatDuration(p.duration)}</span>
                          <span className="flex items-center gap-1">
                            <Headphones className="h-3 w-3" /> {p.listeners || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" /> {p.likes || 0}
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleTogglePublish(p._id, p.isPublished)}
                            title={p.isPublished ? 'Unpublish' : 'Publish'}
                            className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-150"
                          >
                            {p.isPublished ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                          </button>
                          <button
                            onClick={() => openEdit(p)}
                            title="Edit"
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-150"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setPodcastToDelete(p._id)}
                            title="Delete"
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-150"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {p.category && (
                        <span className="inline-block text-xs px-2.5 py-0.5 bg-emerald-50 text-emerald-600 rounded-full font-medium">
                          {p.category}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* Analytics Tab */
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">Podcast Analytics</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Overview of engagement across episodes</p>
                </div>
                <span className="flex items-center gap-1 text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">
                  <BarChart3 className="h-3.5 w-3.5" /> {podcasts.length} episodes
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead>
                    <tr className="bg-gray-50">
                      {['Podcast', 'Listeners', 'Likes', 'Duration', 'Status'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-50">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-center">
                          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                            <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                          </div>
                        </td>
                      </tr>
                    ) : podcasts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-10 text-center text-sm text-gray-400">No data yet.</td>
                      </tr>
                    ) : (
                      podcasts.map(p => (
                        <tr key={p._id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                <img src={p.coverImage || '/default-podcast-cover.jpg'} alt={p.title} className="w-full h-full object-cover" />
                              </div>
                              <span className="text-sm font-medium text-gray-900 truncate max-w-[180px]">{p.title}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">{(p.listeners || 0).toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{(p.likes || 0).toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 font-mono">{formatDuration(p.duration)}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                              p.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {p.isPublished ? 'Published' : 'Draft'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setOpen(false); resetForm(); }}
            />
            <motion.div
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', duration: 0.3 }}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                    <Mic className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-gray-900">
                      {editing ? 'Edit Podcast' : 'Upload New Podcast'}
                    </h2>
                    <p className="text-xs text-gray-500">Title and Audio URL are required</p>
                  </div>
                </div>
                <button
                  onClick={() => { setOpen(false); resetForm(); }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-150"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
                <div>
                  <label className={labelClass}>Title <span className="text-red-400">*</span></label>
                  <input
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    className={inputClass}
                    placeholder="Episode title"
                  />
                </div>

                <div>
                  <label className={labelClass}>Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    className={inputClass + ' resize-none'}
                    placeholder="Short description of this episode"
                    rows={3}
                  />
                </div>

                <div>
                  <label className={labelClass}>Audio URL <span className="text-red-400">*</span></label>
                  <input
                    value={form.audioUrl}
                    onChange={e => setForm({ ...form, audioUrl: e.target.value })}
                    className={inputClass}
                    placeholder="https://.../episode.mp3"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Category</label>
                    <select
                      value={form.category}
                      onChange={e => setForm({ ...form, category: e.target.value })}
                      className={inputClass}
                    >
                      <option value="">Select a category</option>
                      {CATEGORIES.map(c => (
                        <option key={c} value={c.toLowerCase()}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Tags <span className="text-gray-400 font-normal">(comma separated)</span></label>
                    <input
                      value={(form.tags || []).join(', ')}
                      onChange={e => setForm({
                        ...form,
                        tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean),
                      })}
                      className={inputClass}
                      placeholder="music, interview, live"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                <button
                  onClick={() => { setOpen(false); resetForm(); }}
                  className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-150"
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleSubmit}
                  disabled={uploading || !form.title || !form.audioUrl}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  whileHover={{ scale: uploading ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {uploading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
                  ) : (
                    <><Upload className="h-4 w-4" /> {editing ? 'Update Podcast' : 'Upload Podcast'}</>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={!!podcastToDelete}
        title="Delete Podcast"
        message="Are you sure you want to delete this podcast? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setPodcastToDelete(null)}
      />
    </div>
  );
}
