import React, { useState, useEffect } from 'react';
import { 
  Search, Edit, Trash2, Radio as PodcastIcon, 
  PlayCircle, Filter, CheckCircle2, XCircle, Mic, 
  Eye, Plus, ArrowLeft, Headphones, RefreshCw, ShieldCheck
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { podcastService } from '../../services/podcastService';
import { apiService } from '../../services/api';
import { Loader2, X } from 'lucide-react';
import { Podcast } from '../../types';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Preloader from '../../components/ui/Preloader';

const ChevronDown = ({ className, size }: { className?: string; size?: number }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
);

const PodcastManagement: React.FC = () => {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPodcast, setSelectedPodcast] = useState<Podcast | null>(null);
  const [podcastToDelete, setPodcastToDelete] = useState<string | null>(null);
  const [podcastToModerate, setPodcastToModerate] = useState<{id: string, action: 'approve' | 'reject', title: string} | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddEpisodeOpen, setIsAddEpisodeOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPodcast, setNewPodcast] = useState({ title: '', description: '', category: 'Music', explicit: false, coverArt: '' });
  const [newEpisode, setNewEpisode] = useState({ title: '', description: '', audioUrl: '', duration: '', episodeNumber: '' });
  const [stats, setStats] = useState({ total: 0, published: 0, pending: 0, episodes: 0 });

  const fetchPodcasts = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (search) filters.search = search;
      if (statusFilter !== 'all') filters.status = statusFilter;
      const response = await adminService.getAllPodcasts(page, 10, filters);
      if (response && response.data) {
        let list = response.data;
        let pagination = (response as any).pagination;
        if (response.data.data && Array.isArray(response.data.data)) {
          list = response.data.data;
          pagination = response.data.pagination;
        }
        setPodcasts(list);
        const total = pagination?.total ?? list.length;
        const pages = pagination?.pages ?? 1;
        setTotalPages(pages);
        setStats({
          total,
          published: list.filter((p: any) => p.isApproved).length,
          pending: list.filter((p: any) => !p.isApproved).length,
          episodes: list.reduce((sum: number, p: any) => sum + (p.episodes?.length || 0), 0)
        });
      }
    } catch {
      toast.error('Failed to synchronize podcast data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPodcasts(); }, [page, statusFilter]);

  const handleAddPodcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const id = toast.loading('Creating podcast series...');
    try {
      await podcastService.createPodcast(newPodcast);
      toast.success('Podcast created!', { id });
      setIsAddModalOpen(false);
      setNewPodcast({ title: '', description: '', category: 'Music', explicit: false, coverArt: '' });
      fetchPodcasts();
    } catch {
      toast.error('Failed to create podcast', { id });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddEpisode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPodcast) return;
    setIsSubmitting(true);
    const id = toast.loading('Adding episode...');
    try {
      await apiService.post(`/podcast/${selectedPodcast._id}/episodes`, {
        title: newEpisode.title,
        description: newEpisode.description,
        audioFileKey: newEpisode.audioUrl,
        duration: newEpisode.duration ? parseInt(newEpisode.duration) : 0,
        episodeNumber: newEpisode.episodeNumber ? parseInt(newEpisode.episodeNumber) : undefined,
      });
      toast.success('Episode published!', { id });
      setIsAddEpisodeOpen(false);
      setNewEpisode({ title: '', description: '', audioUrl: '', duration: '', episodeNumber: '' });
      fetchPodcasts();
      // Update selected podcast episode count locally
      setSelectedPodcast(prev => prev ? { ...prev, episodes: [...(prev.episodes || []), { title: newEpisode.title } as any] } : prev);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to add episode', { id });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModerate = async () => {
    if (!podcastToModerate) return;
    const id = toast.loading(`${podcastToModerate.action === 'approve' ? 'Approving' : 'Deactivating'}...`);
    try {
      await adminService.moderateContent('podcasts', podcastToModerate.id, podcastToModerate.action);
      toast.success(`Podcast ${podcastToModerate.action}d`, { id });
      fetchPodcasts();
    } catch {
      toast.error('Operation failed', { id });
    } finally {
      setPodcastToModerate(null);
    }
  };

  const handleDelete = async () => {
    if (!podcastToDelete) return;
    const id = toast.loading('Deleting podcast...');
    try {
      await adminService.moderateContent('podcasts', podcastToDelete, 'delete');
      toast.success('Deleted', { id });
      setPodcasts(prev => prev.filter(p => p._id !== podcastToDelete));
      if (selectedPodcast?._id === podcastToDelete) setSelectedPodcast(null);
    } catch {
      toast.error('Delete failed', { id });
    } finally {
      setPodcastToDelete(null);
    }
  };

  if (loading && podcasts.length === 0) return <Preloader isVisible={true} text="Loading podcasts..." />;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          {selectedPodcast && (
            <button onClick={() => setSelectedPodcast(null)} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white text-sm font-semibold mb-3 transition-colors">
              <ArrowLeft size={16} /> Back to all podcasts
            </button>
          )}
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2 flex items-center gap-3">
            <Mic className="text-purple-500" size={32} />
            {selectedPodcast ? selectedPodcast.title : 'Podcast Management'}
          </h1>
          <p className="text-zinc-500 text-xs font-semibold ml-1">
            {selectedPodcast
              ? `${selectedPodcast.episodes?.length || 0} episodes · ${selectedPodcast.category}`
              : 'Monitor and manage podcasts and episodes across the platform.'}
          </p>
        </div>
        {selectedPodcast ? (
          <button onClick={() => setIsAddEpisodeOpen(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> Add Episode
          </button>
        ) : (
          <button onClick={() => setIsAddModalOpen(true)} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> New Series
          </button>
        )}
      </div>

      {/* Stats (list view only) */}
      {!selectedPodcast && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Series', value: stats.total, icon: PodcastIcon, color: 'text-blue-500', bg: 'bg-blue-500/5' },
            { label: 'Published', value: stats.published, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
            { label: 'Pending', value: stats.pending, icon: Eye, color: 'text-amber-500', bg: 'bg-amber-500/5' },
            { label: 'Total Episodes', value: stats.episodes, icon: Mic, color: 'text-purple-500', bg: 'bg-purple-500/5' },
          ].map(s => (
            <div key={s.label} className="premium-card">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-6 ${s.bg}`}>
                <s.icon size={20} className={s.color} />
              </div>
              <p className="text-zinc-500 text-xs font-medium mb-1">{s.label}</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Episode view */}
      {selectedPodcast ? (
        <div className="premium-card !p-0 overflow-hidden">
          {selectedPodcast.episodes && selectedPodcast.episodes.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-black/5 dark:border-white/5 bg-zinc-100 dark:bg-zinc-950/50">
                  <th className="px-6 py-5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">#</th>
                  <th className="px-6 py-5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Episode</th>
                  <th className="px-6 py-5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Plays</th>
                  <th className="px-6 py-5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {selectedPodcast.episodes.map((ep: any, idx: number) => (
                  <tr key={ep._id || idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-zinc-500">{ep.episodeNumber || idx + 1}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                          <Headphones size={14} className="text-purple-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-900 dark:text-white">{ep.title}</p>
                          {ep.description && <p className="text-xs text-zinc-500 truncate max-w-xs">{ep.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-zinc-500 font-medium">
                        {ep.audioFile?.duration ? `${Math.floor(ep.audioFile.duration / 60)}m ${ep.audioFile.duration % 60}s` : '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-zinc-500">{ep.playCount || 0}</span>
                    </td>
                    <td className="px-6 py-4">
                      {ep.isPublished ? (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Published</span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-zinc-500/10 text-zinc-500 border border-zinc-500/20">Draft</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-24 text-center">
              <Headphones className="h-10 w-10 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500 font-medium mb-2">No episodes yet</p>
              <p className="text-zinc-600 text-xs mb-6">Click "Add Episode" to publish your first episode.</p>
              <button onClick={() => setIsAddEpisodeOpen(true)} className="btn-primary inline-flex items-center gap-2 mx-auto">
                <Plus size={16} /> Add First Episode
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Toolbar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row gap-4 w-full md:max-w-3xl">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by series title or artist..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && fetchPodcasts()}
                  className="w-full pl-11 pr-4 h-14 bg-zinc-100 dark:bg-zinc-950/40 border border-black/5 dark:border-white/5 rounded-2xl text-zinc-900 dark:text-white text-[10px] font-bold focus:outline-none focus:border-purple-500/30 focus:ring-4 focus:ring-purple-500/5 transition-all shadow-inner placeholder:text-zinc-400 dark:placeholder:text-zinc-800"
                />
              </div>
              <div className="relative w-full md:w-64">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="w-full pl-11 pr-10 h-14 bg-zinc-100 dark:bg-zinc-950/40 border border-black/5 dark:border-white/5 rounded-2xl text-zinc-900 dark:text-white text-[10px] font-bold focus:outline-none focus:border-purple-500/30 focus:ring-4 focus:ring-purple-500/5 transition-all shadow-inner appearance-none cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="approved">Live Only</option>
                  <option value="pending">Pending Only</option>
                  <option value="inactive">Inactive</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={16} />
              </div>
            </div>
          </div>

          {/* Podcast Table */}
          <div className="premium-card !p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-black/5 dark:border-white/5 bg-zinc-100 dark:bg-zinc-950/50">
                    <th className="px-6 py-5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Series</th>
                    <th className="px-6 py-5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Artist</th>
                    <th className="px-6 py-5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Episodes</th>
                    <th className="px-6 py-5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading && podcasts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-24 text-center">
                        <RefreshCw className="h-8 w-8 text-purple-500 animate-spin mx-auto mb-4" />
                        <p className="text-zinc-500">Synchronizing broadcasts...</p>
                      </td>
                    </tr>
                  ) : podcasts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-24 text-center">
                        <PodcastIcon className="h-10 w-10 text-zinc-800 mx-auto mb-4" />
                        <p className="text-zinc-500">No podcasts detected in repository.</p>
                      </td>
                    </tr>
                  ) : (
                    podcasts.map(podcast => (
                      <tr
                        key={podcast._id}
                        className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                        onClick={() => setSelectedPodcast(podcast)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-black/5 dark:border-white/5 overflow-hidden flex items-center justify-center">
                              {podcast.coverArt
                                ? <img src={podcast.coverArt} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt={podcast.title} />
                                : <PodcastIcon size={20} className="text-zinc-500" />}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-purple-400 transition-colors">{podcast.title}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-bold text-zinc-600 uppercase">{podcast.category}</span>
                                <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-800" />
                                <span className="text-[10px] font-bold text-zinc-600 uppercase">{podcast.explicit ? 'Explicit' : 'Clean'}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{(podcast.artist as any)?.name || 'Unknown'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-xs font-bold text-zinc-500">
                            <PlayCircle size={14} className="text-purple-500" />
                            {podcast.episodes?.length || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {!podcast.isApproved ? (
                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">Pending</span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Live</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!podcast.isApproved ? (
                              <button onClick={() => setPodcastToModerate({id: podcast._id, action: 'approve', title: podcast.title})} className="p-2 rounded-lg text-emerald-500 hover:bg-emerald-500/10 transition-all" title="Approve">
                                <ShieldCheck size={18} />
                              </button>
                            ) : (
                              <button onClick={() => setPodcastToModerate({id: podcast._id, action: 'reject', title: podcast.title})} className="p-2 rounded-lg text-amber-500 hover:bg-amber-500/10 transition-all" title="Deactivate">
                                <XCircle size={18} />
                              </button>
                            )}
                            <button
                              onClick={() => { setSelectedPodcast(podcast); setIsAddEpisodeOpen(true); }}
                              className="p-2 rounded-lg text-purple-400 hover:bg-purple-500/10 transition-all"
                              title="Add Episode"
                            >
                              <Plus size={18} />
                            </button>
                            <button onClick={() => setPodcastToDelete(podcast._id)} className="p-2 rounded-lg text-zinc-500 hover:text-rose-500 hover:bg-rose-500/5 transition-all" title="Delete">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-black/5 dark:border-white/5 bg-zinc-100 dark:bg-zinc-950/50 flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary !py-1 !px-3 disabled:opacity-30">Prev</button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary !py-1 !px-3 disabled:opacity-30">Next</button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Confirm Dialogs */}
      <ConfirmDialog
        isOpen={!!podcastToDelete}
        title="Delete Series?"
        message="This will permanently remove the podcast and all its episodes."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setPodcastToDelete(null)}
      />
      <ConfirmDialog
        isOpen={!!podcastToModerate}
        title={podcastToModerate?.action === 'approve' ? 'Approve Podcast?' : 'Deactivate Podcast?'}
        message={podcastToModerate?.action === 'approve'
          ? `Make "${podcastToModerate?.title}" live for all users?`
          : `Hide "${podcastToModerate?.title}" from the platform?`}
        confirmLabel={podcastToModerate?.action === 'approve' ? 'Approve' : 'Deactivate'}
        onConfirm={handleModerate}
        onCancel={() => setPodcastToModerate(null)}
      />

      {/* Add Series Modal */}
      <AnimatePresence mode="wait">
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="premium-card w-full max-w-lg shadow-2xl border-black/10 dark:border-white/10 p-8" onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20">
                    <PodcastIcon className="text-purple-500" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Add Podcast Series</h3>
                    <p className="text-sm text-zinc-500 font-medium">Create a new platform podcast.</p>
                  </div>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-zinc-500 transition-colors"><X size={20} /></button>
              </div>
              <form onSubmit={handleAddPodcast} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Series Title</label>
                  <input type="text" value={newPodcast.title} onChange={e => setNewPodcast({...newPodcast, title: e.target.value})} className="w-full px-4 h-12 bg-zinc-50 dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 rounded-xl text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-purple-500/30 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600" placeholder="e.g. Daily Top Hits" required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Description</label>
                  <textarea value={newPodcast.description} onChange={e => setNewPodcast({...newPodcast, description: e.target.value})} className="w-full p-4 h-24 bg-zinc-50 dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 rounded-xl text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-purple-500/30 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 resize-none" placeholder="A brief description..." required />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Category</label>
                    <div className="relative">
                      <select value={newPodcast.category} onChange={e => setNewPodcast({...newPodcast, category: e.target.value})} className="w-full h-12 px-4 pr-10 bg-zinc-50 dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 rounded-xl text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-purple-500/30 appearance-none cursor-pointer">
                        <option value="Music">Music</option>
                        <option value="News">News</option>
                        <option value="Comedy">Comedy</option>
                        <option value="Education">Education</option>
                        <option value="Technology">Technology</option>
                        <option value="Business">Business</option>
                        <option value="Health">Health</option>
                        <option value="Sports">Sports</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Other">Other</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Content Rating</label>
                    <div className="relative">
                      <select value={newPodcast.explicit ? 'true' : 'false'} onChange={e => setNewPodcast({...newPodcast, explicit: e.target.value === 'true'})} className="w-full h-12 px-4 pr-10 bg-zinc-50 dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 rounded-xl text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-purple-500/30 appearance-none cursor-pointer">
                        <option value="false">Clean</option>
                        <option value="true">Explicit</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Cover Art URL</label>
                  <input type="url" value={newPodcast.coverArt} onChange={e => setNewPodcast({...newPodcast, coverArt: e.target.value})} className="w-full px-4 h-12 bg-zinc-50 dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 rounded-xl text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-purple-500/30 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600" placeholder="https://..." required />
                </div>
                <div className="pt-6 flex justify-end gap-3 border-t border-black/5 dark:border-white/5">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-6 py-2.5 text-sm font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-white text-black rounded-xl text-sm font-bold hover:bg-zinc-200 transition-colors flex items-center gap-2">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <PodcastIcon size={18} />}
                    Create Series
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Episode Modal */}
      <AnimatePresence mode="wait">
        {isAddEpisodeOpen && selectedPodcast && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm" onClick={() => setIsAddEpisodeOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="premium-card w-full max-w-lg shadow-2xl border-black/10 dark:border-white/10 p-8" onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20">
                    <Headphones className="text-purple-500" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Add Episode</h3>
                    <p className="text-sm text-zinc-500 font-medium truncate max-w-[220px]">{selectedPodcast.title}</p>
                  </div>
                </div>
                <button onClick={() => setIsAddEpisodeOpen(false)} className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-zinc-500 transition-colors"><X size={20} /></button>
              </div>
              <form onSubmit={handleAddEpisode} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Episode Title <span className="text-rose-400">*</span></label>
                  <input type="text" value={newEpisode.title} onChange={e => setNewEpisode({...newEpisode, title: e.target.value})} className="w-full px-4 h-12 bg-zinc-50 dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 rounded-xl text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-purple-500/30 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600" placeholder="e.g. Episode 1: Introduction" required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Description</label>
                  <textarea value={newEpisode.description} onChange={e => setNewEpisode({...newEpisode, description: e.target.value})} className="w-full p-4 h-20 bg-zinc-50 dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 rounded-xl text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-purple-500/30 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600 resize-none" placeholder="What is this episode about?" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Audio File URL <span className="text-rose-400">*</span></label>
                  <input type="url" value={newEpisode.audioUrl} onChange={e => setNewEpisode({...newEpisode, audioUrl: e.target.value})} className="w-full px-4 h-12 bg-zinc-50 dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 rounded-xl text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-purple-500/30 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600" placeholder="https://... (MP3, AAC, or S3 URL)" required />
                  <p className="text-[11px] text-zinc-500">Paste a direct link to the audio file (S3, CDN, or any hosted URL).</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Duration (seconds)</label>
                    <input type="number" min="0" value={newEpisode.duration} onChange={e => setNewEpisode({...newEpisode, duration: e.target.value})} className="w-full px-4 h-12 bg-zinc-50 dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 rounded-xl text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-purple-500/30 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600" placeholder="e.g. 1800" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Episode Number</label>
                    <input type="number" min="1" value={newEpisode.episodeNumber} onChange={e => setNewEpisode({...newEpisode, episodeNumber: e.target.value})} className="w-full px-4 h-12 bg-zinc-50 dark:bg-zinc-900/50 border border-black/5 dark:border-white/5 rounded-xl text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-purple-500/30 transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600" placeholder="e.g. 1" />
                  </div>
                </div>
                <div className="pt-6 flex justify-end gap-3 border-t border-black/5 dark:border-white/5">
                  <button type="button" onClick={() => setIsAddEpisodeOpen(false)} className="px-6 py-2.5 text-sm font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-white text-black rounded-xl text-sm font-bold hover:bg-zinc-200 transition-colors flex items-center gap-2">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Headphones size={18} />}
                    Publish Episode
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PodcastManagement;