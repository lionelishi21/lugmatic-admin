// @ts-nocheck
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Plus, Edit3, Trash2, BarChart3, Upload, Loader2, Play, Pause,
  Headphones, TrendingUp, Eye, Search, Mic, ChevronDown, X, CheckCircle2,
  History, Settings2, Sparkles, Clock, LayoutGrid, Layout, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { podcastService } from '../../services/podcastService';
import type { Podcast, CreatePodcastRequest } from '../../types';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

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
    { id: 'all', label: 'All Episodes', count: podcasts.length },
    { id: 'published', label: 'Published', count: totals.published },
    { id: 'drafts', label: 'Drafts', count: podcasts.length - totals.published },
    { id: 'analytics', label: 'Analytics', count: null },
  ] as const;

  const inputClass = "w-full bg-zinc-950 border border-white/5 rounded-2xl px-6 py-4 text-white text-sm font-medium focus:outline-none focus:border-emerald-500/30 transition-all";
  const labelClass = "text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 block px-1";

  return (
    <div className="max-w-7xl mx-auto pb-24 space-y-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold tracking-tight text-white leading-none uppercase">Podcast Management</h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Active Studio</span>
            </div>
          </div>
          <p className="text-zinc-500 font-medium">Manage your podcast episodes, tracks, and listener engagement data.</p>
        </div>
        <button
          onClick={openCreate}
          className="h-14 px-8 bg-white text-black rounded-2xl text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-3"
        >
          <Plus size={18} />
          New Episode
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: Mic, label: 'Total Episodes', value: podcasts.length },
          { icon: Play, label: 'Published', value: totals.published },
          { icon: Headphones, label: 'Total Listeners', value: totals.listeners.toLocaleString() },
          { icon: Eye, label: 'Engagement', value: totals.likes.toLocaleString() },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="premium-card p-6 border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-zinc-950 flex items-center justify-center border border-white/5 text-zinc-600 group-hover:text-emerald-500 transition-colors">
                <Icon size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-0.5">{label}</p>
                <p className="text-2xl font-bold text-white tracking-tight tabular-nums">{loading ? '—' : value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="premium-card !p-0 border-white/5 shadow-2xl overflow-hidden">
        {/* Sub-Header / Filters */}
        <div className="px-10 py-6 border-b border-white/5 bg-zinc-950/20 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex bg-zinc-950 p-1.5 rounded-2xl border border-white/5 gap-1">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id as any)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
                  tab === t.id ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-white'
                }`}
              >
                {t.label}
                {t.count !== null && (
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                    tab === t.id ? 'bg-zinc-100 text-black' : 'bg-zinc-900 text-zinc-600'
                  }`}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder="SEARCH EPISODES..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-12 pl-14 pr-6 bg-zinc-950 border border-white/5 rounded-2xl text-[10px] font-bold uppercase tracking-widest focus:border-emerald-500/30 transition-all outline-none text-white placeholder:text-zinc-700"
            />
          </div>
        </div>

        <div className="p-10">
          {tab !== 'analytics' ? (
            loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="aspect-[4/3] rounded-[2.5rem] bg-zinc-950/50 animate-pulse border border-white/5" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-24 h-24 bg-zinc-900 rounded-[2.5rem] flex items-center justify-center mb-8 border border-white/5">
                  <Mic className="h-10 w-10 text-zinc-800" />
                </div>
                <h3 className="text-xl font-bold text-white uppercase tracking-tight">No episodes found</h3>
                <p className="text-sm text-zinc-500 mt-3 mb-8 max-w-sm mx-auto font-medium">Create your first episode to start engaging with your audience.</p>
                {!search && (
                  <button onClick={openCreate} className="h-14 px-10 bg-emerald-500 text-black rounded-2xl text-xs font-bold uppercase tracking-widest shadow-xl">
                    New Episode
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtered.map(p => (
                  <div key={p._id} className="premium-card !p-0 overflow-hidden border-white/5 shadow-xl hover:border-emerald-500/20 transition-all group rounded-[2.5rem] bg-zinc-950/20">
                    <div className="aspect-video relative overflow-hidden bg-zinc-950">
                      <img src={p.coverImage || '/default-podcast-cover.jpg'} alt={p.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute top-4 left-4">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
                          p.isPublished ? 'bg-emerald-500 text-black border-emerald-400/20' : 'bg-zinc-900 text-zinc-500 border-white/5'
                        }`}>
                          {p.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>
                    <div className="p-8 space-y-4">
                      <div>
                        <h3 className="text-lg font-bold text-white truncate">{p.title}</h3>
                        <p className="text-xs text-zinc-500 font-medium line-clamp-2 mt-1 leading-relaxed">{p.description}</p>
                      </div>
                      <div className="flex items-center justify-between border-t border-white/5 pt-4">
                        <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                           <div className="flex items-center gap-1.5"><Clock size={12} /> {formatDuration(p.duration)}</div>
                           <div className="flex items-center gap-1.5"><Headphones size={12} /> {p.listeners || 0}</div>
                        </div>
                        <div className="flex gap-2">
                           <button onClick={() => openEdit(p)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-900 text-zinc-500 hover:text-white border border-white/5 transition-all"><Edit3 size={16} /></button>
                           <button onClick={() => setPodcastToDelete(p._id)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-900 text-zinc-500 hover:text-rose-500 border border-white/5 transition-all"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* Analytics */
            <div className="animate-in fade-in duration-300">
               <div className="overflow-x-auto rounded-[2rem] border border-white/5 bg-zinc-950/20 shadow-inner">
                <table className="w-full text-left">
                  <thead className="bg-zinc-950/40 border-b border-white/5">
                    <tr>
                      {['Episode', 'Listeners', 'Likes', 'Duration', 'Status'].map(h => (
                        <th key={h} className="px-8 py-5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {podcasts.map(p => (
                      <tr key={p._id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-8 py-5 flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 shrink-0">
                            <img src={p.coverImage || '/default-podcast-cover.jpg'} alt={p.title} className="w-full h-full object-cover" />
                          </div>
                          <span className="text-sm font-bold text-white truncate max-w-[200px]">{p.title}</span>
                        </td>
                        <td className="px-8 py-5 text-sm font-bold text-white tabular-nums">{(p.listeners || 0).toLocaleString()}</td>
                        <td className="px-8 py-5 text-sm font-bold text-white tabular-nums">{(p.likes || 0).toLocaleString()}</td>
                        <td className="px-8 py-5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{formatDuration(p.duration)}</td>
                        <td className="px-8 py-5">
                          <span className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
                            p.isPublished ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-zinc-900 text-zinc-600 border-white/5'
                          }`}>
                            {p.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !uploading && setOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="premium-card !p-0 w-full max-w-2xl relative z-10 border-white/10 shadow-2xl overflow-hidden rounded-[3rem]">
              <div className="px-10 py-8 border-b border-white/5 bg-zinc-950/40 flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-black shadow-xl"><Mic size={24} /></div>
                   <div>
                      <h2 className="text-xl font-bold text-white uppercase tracking-tight">{editing ? 'Edit Episode' : 'New Episode'}</h2>
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Configure your podcast details</p>
                   </div>
                </div>
                <button onClick={() => setOpen(false)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-zinc-900 text-zinc-500 hover:text-white transition-all"><X size={20} /></button>
              </div>

              <div className="p-10 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <div className="space-y-2">
                  <label className={labelClass}>Episode Title</label>
                  <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className={inputClass} placeholder="Enter a descriptive title" />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Description</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={inputClass + ' h-32 resize-none'} placeholder="What is this episode about?" />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Audio Resource URL</label>
                  <input value={form.audioUrl} onChange={e => setForm({ ...form, audioUrl: e.target.value })} className={inputClass} placeholder="Link to your audio file" />
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className={labelClass}>Category</label>
                    <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={inputClass + " appearance-none cursor-pointer"}>
                      <option value="">Select Category</option>
                      {CATEGORIES.map(c => <option key={c} value={c.toLowerCase()}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className={labelClass}>Tags (Comma Separated)</label>
                    <input value={(form.tags || []).join(', ')} onChange={e => setForm({ ...form, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })} className={inputClass} placeholder="music, talk, etc" />
                  </div>
                </div>
              </div>

              <div className="px-10 py-8 border-t border-white/5 bg-zinc-950/40 flex justify-end gap-4">
                <button onClick={() => setOpen(false)} className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-all">Cancel</button>
                <button onClick={handleSubmit} disabled={uploading || !form.title || !form.audioUrl} className="h-14 px-10 bg-emerald-500 text-black rounded-2xl text-xs font-bold uppercase tracking-widest shadow-xl flex items-center gap-3 disabled:opacity-50">
                  {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                  {editing ? 'Update' : 'Publish'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog isOpen={!!podcastToDelete} title="Delete Episode" message="This episode will be permanently removed from the platform. Proceed?" confirmLabel="Delete" onConfirm={confirmDelete} onCancel={() => setPodcastToDelete(null)} />
    </div>
  );
}
