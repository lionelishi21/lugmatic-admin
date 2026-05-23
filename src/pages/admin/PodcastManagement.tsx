import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, MoreVertical, Edit, Trash2, Radio as PodcastIcon, 
  PlayCircle, Filter, CheckCircle2, XCircle, Mic, 
  Calendar, Eye, Plus, ChevronRight, BarChart3, Clock,
  RefreshCw, ShieldCheck, AlertCircle, Play
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { Podcast } from '../../types';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Preloader from '../../components/ui/Preloader';

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
  
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    pending: 0,
    episodes: 0
  });

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
        if (pagination) {
          setTotalPages(pagination.pages);
          setStats(prev => ({
            ...prev,
            total: pagination.total,
            published: list.filter((p: any) => p.isApproved).length,
            pending: list.filter((p: any) => !p.isApproved).length,
            episodes: list.reduce((sum: number, p: any) => sum + (p.episodes?.length || 0), 0)
          }));
        }
      }
    } catch (err: any) {
      toast.error('Failed to synchronize podcast data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPodcasts();
  }, [page, statusFilter]);

  const handleModerate = async () => {
    if (!podcastToModerate) return;
    const loadingId = toast.loading(`${podcastToModerate.action === 'approve' ? 'Approving' : 'Deactivating'} podcast...`);
    try {
      await adminService.moderateContent('podcasts', podcastToModerate.id, podcastToModerate.action);
      toast.success(`Podcast ${podcastToModerate.action}d`, { id: loadingId });
      fetchPodcasts();
    } catch (err) {
      toast.error('Operation failed', { id: loadingId });
    } finally {
      setPodcastToModerate(null);
    }
  };

  const handleDelete = async () => {
    if (!podcastToDelete) return;
    const loadingId = toast.loading('Deleting podcast...');
    try {
      await adminService.moderateContent('podcasts', podcastToDelete, 'delete');
      toast.success('Podcast deleted successfully', { id: loadingId });
      setPodcasts(prev => prev.filter(p => p._id !== podcastToDelete));
    } catch (err) {
      toast.error('Delete failed', { id: loadingId });
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
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
            <Mic className="text-purple-500" size={32} />
            Podcast Management
          </h1>
          <p className="text-zinc-500 text-xs font-semibold ml-1">Monitor and manage podcasts and episodes across the platform.</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          New Series
        </button>
      </div>

      {/* Stats */}
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
            <p className="text-2xl font-bold text-white tracking-tight">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row gap-4 w-full md:max-w-3xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by series title or artist..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchPodcasts()}
              className="input-field pl-11"
            />
          </div>
          <div className="relative w-full md:w-64">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field pl-11 pr-10 appearance-none cursor-pointer"
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

      {/* Main Content */}
      <div className="premium-card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5">
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
                podcasts.map((podcast) => (
                  <tr key={podcast._id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/5 overflow-hidden flex items-center justify-center">
                          <img src={podcast.coverArt} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">{podcast.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold text-zinc-600 uppercase">{podcast.category}</span>
                            <span className="w-1 h-1 rounded-full bg-zinc-800" />
                            <span className="text-[10px] font-bold text-zinc-600 uppercase">{podcast.explicit ? 'Explicit' : 'Clean'}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-zinc-400">{(podcast.artist as any)?.name || 'Unknown'}</span>
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
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!podcast.isApproved ? (
                          <button 
                            onClick={() => setPodcastToModerate({id: podcast._id, action: 'approve', title: podcast.title})} 
                            className="p-2 rounded-lg text-emerald-500 hover:bg-emerald-500/10 transition-all"
                          >
                            <ShieldCheck size={18} />
                          </button>
                        ) : (
                          <button 
                            onClick={() => setPodcastToModerate({id: podcast._id, action: 'reject', title: podcast.title})} 
                            className="p-2 rounded-lg text-amber-500 hover:bg-amber-500/10 transition-all"
                          >
                            <XCircle size={18} />
                          </button>
                        )}
                        <button className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-all"><Edit size={18} /></button>
                        <button onClick={() => setPodcastToDelete(podcast._id)} className="p-2 rounded-lg text-zinc-500 hover:text-rose-500 hover:bg-rose-500/5 transition-all"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary !py-1 !px-3 disabled:opacity-30">Prev</button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary !py-1 !px-3 disabled:opacity-30">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={!!podcastToDelete}
        title="Delete Series?"
        message="This action will permanently remove the podcast and all associated episodes from the platform."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setPodcastToDelete(null)}
      />

      <ConfirmDialog
        isOpen={!!podcastToModerate}
        title={podcastToModerate?.action === 'approve' ? 'Approve Podcast?' : 'Deactivate Podcast?'}
        message={podcastToModerate?.action === 'approve' 
          ? `Make "${podcastToModerate.title}" live for all users?`
          : `Hide "${podcastToModerate.title}" from the platform?`}
        confirmLabel={podcastToModerate?.action === 'approve' ? 'Approve' : 'Deactivate'}
        onConfirm={handleModerate}
        onCancel={() => setPodcastToModerate(null)}
      />
    </div>
  );
};

const ChevronDown = ({ className, size }: { className?: string; size?: number }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
);

export default PodcastManagement;