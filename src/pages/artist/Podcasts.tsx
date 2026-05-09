// @ts-nocheck
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Plus, Edit3, Trash2, BarChart3, Upload, Loader2, Play, Pause,
  Headphones, TrendingUp, Eye, Search, Mic, ChevronDown, X, CheckCircle2,
  History, Settings2, Sparkles, Clock, LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { podcastService } from '../../services/podcastService';
import type { Podcast, CreatePodcastRequest } from '../../types';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const card = 'bg-zinc-900 border border-white/[0.06] rounded-lg shadow-2xl relative overflow-hidden group';

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

const CATEGORIES = ['Music', 'Comedy', 'News', 'Education', 'Technology', 'Lifestyle'];

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
  const { user } = useAuth();

  useEffect(() => { void load(); }, []);

  async function load() {
    if (!user?.artistId) {
      setPodcasts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const resp = await podcastService.getArtistPodcasts(user.artistId);
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
    { id: 'all', label: 'All Content', count: podcasts.length },
    { id: 'published', label: 'Transmitting', count: totals.published },
    { id: 'drafts', label: 'Encrypted (Drafts)', count: podcasts.length - totals.published },
    { id: 'analytics', label: 'Pulse Analytics', count: null },
  ] as const;

  const inputClass = "w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-white/[0.08] rounded-xl px-4 py-3 text-zinc-900 dark:text-white text-sm placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all";
  const labelClass = "text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block px-1";

  return (
    <div className="max-w-6xl mx-auto pb-16 space-y-6">

      {/* ── Header Card ── */}
      <div className={`${card} p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6`}>
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
            <Mic className="h-7 w-7 text-white" />
          </div>
          <div>
             <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1 italic">Audio Broadcasting</p>
             <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight uppercase italic">
               Podcast Command
             </h1>
             <p className="text-sm text-zinc-500 mt-0.5">
               Manage your broadcast frequencies and listener engagement telemetry.
             </p>
          </div>
        </div>
        <motion.button
          onClick={openCreate}
          className="h-11 flex items-center justify-center gap-3 px-8 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20"
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="h-4 w-4" />
          Initialize Broadcast
        </motion.button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Headphones, label: 'Total Broadasts', value: podcasts.length, color: 'emerald' },
          { icon: Play, label: 'Transmitting', value: totals.published, color: 'blue' },
          { icon: TrendingUp, label: 'Engagement Index', value: totals.listeners.toLocaleString(), color: 'purple' },
          { icon: Eye, label: 'Total Approval', value: totals.likes.toLocaleString(), color: 'rose' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className={`${card} p-5 group relative overflow-hidden`}>
             <div className="absolute top-0 right-0 w-20 h-20 bg-zinc-50 dark:bg-white/[0.01] rounded-bl-full -mr-10 -mt-10" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center border border-zinc-100 dark:border-white/5">
                <Icon className="h-5 w-5 text-zinc-500" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-0.5 italic">{label}</p>
                <p className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight tabular-nums">{loading ? '—' : value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Card */}
      <div className={`${card} overflow-hidden`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 border-b border-white/[0.06] bg-zinc-50/30 dark:bg-white/[0.01]">
          {/* Tabs */}
          <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 shadow-inner border border-zinc-200 dark:border-white/5">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id as any)}
                className={`flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                  tab === t.id
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-lg'
                    : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                {t.id === 'analytics' && <BarChart3 className="h-3 w-3" />}
                {t.label}
                {t.count !== null && (
                  <span className={`px-1.5 py-0.5 rounded-md text-[9px] ${
                    tab === t.id ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500'
                  }`}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search */}
          {tab !== 'analytics' && (
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="SEARCH BROADCASTS..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-11 pr-4 h-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] rounded-xl text-[10px] font-black uppercase tracking-widest focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none w-full sm:w-64 transition-all text-zinc-900 dark:text-white placeholder:text-zinc-500 shadow-sm"
              />
            </div>
          )}
        </div>

        {/* List Content */}
        <div className="p-6">
          {tab !== 'analytics' ? (
            loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-[4/3] rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 animate-pulse border border-zinc-100 dark:border-white/5" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl flex items-center justify-center mb-6 border border-dashed border-zinc-200 dark:border-white/10 group">
                  <Headphones className="h-10 w-10 text-zinc-400 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight italic">
                  {search ? 'Zero Match Frequency' : 'No Active Transmissions'}
                </h3>
                <p className="text-xs text-zinc-500 mt-2 mb-6 max-w-xs mx-auto leading-relaxed font-medium">
                  {search ? `Your search parameters yielded zero results in the current sector.` : 'Initialize your first broadcast to start engaging your audience.'}
                </p>
                {!search && (
                  <motion.button
                    onClick={openCreate}
                    className="h-10 flex items-center gap-3 px-6 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20"
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  >
                    <Plus className="h-4 w-4" /> Start Broadcast
                  </motion.button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map(p => (
                  <div
                    key={p._id}
                    className="group rounded-2xl border border-zinc-100 dark:border-white/[0.04] overflow-hidden hover:border-emerald-500/30 hover:shadow-xl hover:shadow-black/20 transition-all duration-300 bg-white dark:bg-white/[0.01]"
                  >
                    {/* Cover */}
                    <div className="aspect-video relative overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                      <img
                        src={p.coverImage || '/default-podcast-cover.jpg'}
                        alt={p.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute top-3 left-3">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg shadow-lg border ${
                          p.isPublished
                            ? 'bg-emerald-500 text-white border-emerald-400/20'
                            : 'bg-zinc-900 text-white border-zinc-700'
                        }`}>
                          {p.isPublished ? 'Live Status: Transmitting' : 'Operational Draft'}
                        </span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                         <div className="flex items-center gap-2">
                             <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform">
                                <Play className="h-5 w-5 text-white fill-current ml-1" />
                             </div>
                         </div>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-5 space-y-3">
                      <div>
                        <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight truncate italic">{p.title}</h3>
                        <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed mt-1 font-medium">{p.description}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-3">
                           <div className="flex items-center gap-1.5 text-[10px] font-black text-zinc-400 uppercase tracking-tighter">
                              <Clock className="h-3 w-3" /> {formatDuration(p.duration)}
                           </div>
                           <div className="w-1 h-1 rounded-full bg-zinc-700" />
                           <div className="flex items-center gap-1.5 text-[10px] font-black text-zinc-400 uppercase tracking-tighter">
                              <Headphones className="h-3 w-3" /> {p.listeners || 0}
                           </div>
                        </div>

                        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200 dark:border-white/5 shadow-inner">
                          <button
                            onClick={() => handleTogglePublish(p._id, p.isPublished)}
                            className="p-2 text-zinc-500 hover:text-emerald-500 transition-colors"
                          >
                            {p.isPublished ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => openEdit(p)}
                            className="p-2 text-zinc-500 hover:text-blue-500 transition-colors"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setPodcastToDelete(p._id)}
                            className="p-2 text-zinc-500 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {p.category && (
                        <span className="inline-block text-[9px] px-2.5 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-md font-black uppercase tracking-widest border border-emerald-500/20">
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
            <div className="animate-in fade-in duration-300">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-widest italic flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-emerald-500" /> Podcast Telemetry
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Cross-episode engagement matrix</p>
                </div>
                <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[9px] font-black uppercase tracking-widest rounded-lg border border-zinc-200 dark:border-white/5 shadow-sm">
                   Inventory: {podcasts.length} Units
                </span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-zinc-100 dark:border-white/[0.04] bg-white dark:bg-white/[0.01]">
                <table className="min-w-full divide-y divide-zinc-100 dark:divide-white/[0.06]">
                  <thead>
                    <tr className="bg-zinc-50/50 dark:bg-white/[0.02]">
                      {['Broadcast Component', 'Telemetry (Listeners)', 'Approval (Likes)', 'Duration', 'Transmission Status'].map(h => (
                        <th key={h} className="px-6 py-4 text-left text-[9px] font-black text-zinc-500 uppercase tracking-widest italic">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.06]">
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <div className="flex items-center justify-center gap-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                            <div className="w-4 h-4 border-2 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin" /> Syncing Matrix...
                          </div>
                        </td>
                      </tr>
                    ) : podcasts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-[10px] font-black text-zinc-500 uppercase tracking-widest">Database Empty.</td>
                      </tr>
                    ) : (
                      podcasts.map(p => (
                        <tr key={p._id} className="hover:bg-zinc-50/50 dark:hover:bg-white/[0.02] transition-colors group cursor-default">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 group-hover:scale-110 transition-transform">
                                <img src={p.coverImage || '/default-podcast-cover.jpg'} alt={p.title} className="w-full h-full object-cover" />
                              </div>
                              <span className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-tight italic truncate max-w-[220px]">{p.title}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs font-bold text-zinc-700 dark:text-zinc-300 tabular-nums">{(p.listeners || 0).toLocaleString()}</td>
                          <td className="px-6 py-4 text-xs font-bold text-zinc-700 dark:text-zinc-300 tabular-nums">{(p.likes || 0).toLocaleString()}</td>
                          <td className="px-6 py-4 text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-tighter">{formatDuration(p.duration)}</td>
                          <td className="px-6 py-4">
                            <span className={`text-[9px] px-2.5 py-1 rounded-lg font-black uppercase tracking-widest border ${
                              p.isPublished ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-sm shadow-emerald-500/5' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-transparent'
                            }`}>
                              {p.isPublished ? 'Active' : 'Draft'}
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

      {/* ── Create / Edit Modal ── */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { if (!uploading) { setOpen(false); resetForm(); } }}
            />
            <motion.div
              className={`${card} relative w-full max-w-xl overflow-hidden shadow-2xl border-white/10`}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', duration: 0.4 }}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-8 py-6 border-b border-white/[0.06] bg-zinc-50/50 dark:bg-white/[0.01]">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <Mic className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-zinc-900 dark:text-white uppercase tracking-tight italic">
                      {editing ? 'Modify Transmission' : 'Initialize New Signal'}
                    </h2>
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-0.5">Parameters Required for deployment</p>
                  </div>
                </div>
                <button
                  onClick={() => { setOpen(false); resetForm(); }}
                  className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="px-8 py-8 space-y-6 max-h-[65vh] overflow-y-auto">
                <div className="space-y-2">
                  <label className={labelClass}>Operational Title <span className="text-emerald-500">*</span></label>
                  <input
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    className={inputClass}
                    placeholder="E.g. The Studio Sessions #04"
                  />
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>Transmission Metadata (Description)</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    className={inputClass + ' resize-none leading-relaxed h-32'}
                    placeholder="Short summary of this signal..."
                  />
                </div>

                <div className="space-y-2">
                  <label className={labelClass}>Source Link (Audio URL) <span className="text-emerald-500">*</span></label>
                  <div className="relative group">
                     <LayoutGrid className="absolute left-4 top-3.5 h-4 w-4 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
                     <input
                       value={form.audioUrl}
                       onChange={e => setForm({ ...form, audioUrl: e.target.value })}
                       className={inputClass + " pl-11"}
                       placeholder="https://storage.hub/signal_path.mp3"
                     />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className={labelClass}>Genre / Sector</label>
                    <select
                      value={form.category}
                      onChange={e => setForm({ ...form, category: e.target.value })}
                      className={inputClass + " appearance-none cursor-pointer"}
                    >
                      <option value="">Select Sector</option>
                      {CATEGORIES.map(c => (
                        <option key={c} value={c.toLowerCase()}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className={labelClass}>Targeting Tags <span className="text-zinc-500 font-bold">(CSV Format)</span></label>
                    <input
                      value={(form.tags || []).join(', ')}
                      onChange={e => setForm({
                        ...form,
                        tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean),
                      })}
                      className={inputClass}
                      placeholder="E.g. raw, live, master"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-4 px-8 py-6 border-t border-white/[0.06] bg-zinc-50/50 dark:bg-white/[0.01]">
                <button
                  onClick={() => { setOpen(false); resetForm(); }}
                  className="px-6 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all"
                >
                  Abort Mission
                </button>
                <motion.button
                  onClick={handleSubmit}
                  disabled={uploading || !form.title || !form.audioUrl}
                  className="h-11 flex items-center justify-center gap-3 px-8 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  whileHover={{ scale: uploading ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {uploading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
                  ) : (
                    <><Upload className="h-4 w-4" /> {editing ? 'Deploy Update' : 'Initialize Deployment'}</>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={!!podcastToDelete}
        title="Terminate Broadcast"
        message="Are you certain you want to permanently erase this signal? This operation is irreversible."
        confirmLabel="Execute Deletion"
        onConfirm={confirmDelete}
        onCancel={() => setPodcastToDelete(null)}
      />
    </div>
  );
}
