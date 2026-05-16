import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Music2, Search, BarChart2, Edit2, Trash2,
  AlertCircle, Plus, X, ListMusic, ChevronRight,
  Play, Clock, Target, Activity, Award, ShieldCheck,
  Zap, Headphones, Filter, SlidersHorizontal, ArrowUpRight,
  Disc, Mic, Layers, Activity as ActivityIcon,
  Globe, Shield, Database, Radio, Share2
} from 'lucide-react';
import ShareModal from '../../components/ShareModal';
import { format } from 'date-fns';
import { RootState } from '../../store';
import artistService from '../../services/artistService';
import songService, { Song } from '../../services/songService';
import { Skeleton } from '../../components/ui/skeleton';
import { toast } from 'react-hot-toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const STATUS_OPTIONS = ['all', 'approved', 'pending', 'rejected'] as const;

export default function MySongs() {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [songToDelete, setSongToDelete] = useState<string | null>(null);
  const [shareTarget, setShareTarget] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    if (user?.artistId) fetchSongs();
  }, [user?.artistId]);

  const fetchSongs = async () => {
    try {
      setLoading(true);
      const data = await artistService.getArtistSongs(String(user?.artistId));
      setSongs(data);
    } catch (err) {
      console.error('Failed to fetch songs:', err);
      toast.error('Failed to load your tracks.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!songToDelete) return;
    try {
      await songService.deleteSong(songToDelete);
      toast.success('Track deleted');
      setSongs(songs.filter(s => s._id !== songToDelete));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete track');
    } finally {
      setSongToDelete(null);
    }
  };

  const filteredSongs = songs.filter(song => {
    const matchesSearch = song.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || song.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const StatusBadge = ({ status }: { status: string }) => {
    const config: Record<string, { label: string; cls: string; dot: string }> = {
      approved: { label: 'Approved', cls: 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10', dot: 'bg-emerald-500' },
      pending:  { label: 'Pending',  cls: 'bg-amber-500/5 text-amber-500 border-amber-500/10', dot: 'bg-amber-500'   },
      rejected: { label: 'Rejected', cls: 'bg-rose-500/5 text-rose-500 border-rose-500/10', dot: 'bg-rose-500'     },
      default:  { label: 'Unknown',  cls: 'bg-zinc-500/5 text-zinc-500 border-zinc-500/10', dot: 'bg-zinc-500'     },
    };
    const sc = config[status] ?? config.default;
    return (
      <div className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border ${sc.cls} shadow-sm backdrop-blur-md`}>
        <div className={`w-1 h-1 rounded-full ${sc.dot} animate-pulse`} />
        <span className="text-[10px] font-bold uppercase tracking-wider">{sc.label}</span>
      </div>
    );
  };

  return (
    <div className="space-y-10 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold tracking-tight text-white leading-none">Your Songs</h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{songs.length} Tracks</span>
            </div>
          </div>
          <p className="text-zinc-500 font-medium">Manage your musical catalog and track performance across all platforms.</p>
        </div>
        
        <button
          onClick={() => navigate('/artist/upload')}
          className="h-14 px-10 bg-white text-black rounded-2xl text-sm font-bold hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-3 border border-white/10"
        >
          <Plus size={20} />
          Upload New Song
        </button>
      </div>

      {/* Control Console */}
      <div className="premium-card !p-3 bg-zinc-950/40 flex flex-col lg:flex-row gap-3 border-white/5 shadow-inner backdrop-blur-3xl">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-700 h-4 w-4 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            placeholder="Search your tracks..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 h-12 bg-[#0a0a0a] border border-white/5 rounded-xl text-white text-sm font-medium focus:outline-none focus:border-emerald-500/30 transition-all shadow-inner placeholder:text-zinc-800"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-700 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div className="flex bg-[#0a0a0a] p-1 rounded-xl border border-white/5 shadow-inner gap-1 backdrop-blur-3xl">
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-6 py-2.5 rounded-lg text-xs font-semibold capitalize transition-all duration-300 ${
                statusFilter === s
                  ? 'bg-white/10 text-white shadow-lg border border-white/5'
                  : 'text-zinc-600 hover:text-zinc-300'
              }`}
            >
              {s === 'all' ? 'All Songs' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Asset Registry */}
      <div className="premium-card !p-0 overflow-hidden border-white/5 shadow-2xl">
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-zinc-950/20">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center border border-white/5 shadow-inner">
               <SlidersHorizontal size={18} className="text-emerald-500" />
             </div>
             <div>
                <h3 className="text-lg font-bold text-white">Song Registry</h3>
                <p className="text-xs text-zinc-500 font-medium">Your complete musical discography</p>
             </div>
          </div>
        </div>

        <div className="divide-y divide-white/5">
          <AnimatePresence mode="wait">
            {loading ? (
              [1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center gap-10 px-8 py-8 opacity-50">
                  <Skeleton className="w-20 h-20 rounded-2xl bg-white/5" />
                  <div className="flex-1 space-y-4">
                    <Skeleton className="h-5 w-1/3 bg-white/5 rounded-lg" />
                    <Skeleton className="h-3 w-1/4 bg-white/5 rounded-md" />
                  </div>
                  <div className="flex gap-3">
                     {[1, 2, 3].map(j => <Skeleton key={j} className="h-12 w-12 rounded-xl bg-white/5" />)}
                  </div>
                </div>
              ))
            ) : filteredSongs.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-32 text-center"
              >
                <div className="w-20 h-20 bg-zinc-950 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/5 shadow-inner">
                   <Disc size={32} className="text-zinc-800" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">No songs found</h3>
                <p className="text-sm text-zinc-500 max-w-xs mx-auto leading-relaxed">
                   Your uploaded songs will appear here once you start building your catalog.
                </p>
              </motion.div>
            ) : (
              filteredSongs.map((track, i) => (
                <motion.div
                  key={track._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex flex-col xl:flex-row xl:items-center justify-between px-8 py-8 hover:bg-white/[0.01] transition-all group relative overflow-hidden"
                >
                  <div className="flex items-center gap-8 min-w-0 relative z-10">
                    <div className="relative flex-shrink-0 group-hover:scale-105 transition-all duration-700 shadow-xl">
                      <img
                        src={track.coverArtUrl || track.coverArt || '/default-track-cover.jpg'}
                        alt={track.name}
                        className="w-20 h-20 rounded-2xl object-cover border border-white/5 bg-zinc-950 group-hover:border-emerald-500/20 transition-all"
                        onError={e => { (e.target as HTMLImageElement).src = '/default-track-cover.jpg'; }}
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center rounded-2xl">
                        <Play size={24} className="text-white fill-current" />
                      </div>
                    </div>
                    
                    <div className="min-w-0">
                       <div className="flex flex-wrap items-center gap-4 mb-2">
                          <h4 className="text-lg font-bold text-white truncate max-w-[400px] group-hover:text-emerald-400 transition-colors">
                            {track.name}
                          </h4>
                          <StatusBadge status={track.status} />
                       </div>
                       <div className="flex flex-wrap items-center gap-6">
                          <div className="flex items-center gap-2 px-3 py-1 bg-[#0a0a0a] rounded-lg border border-white/5 shadow-inner">
                             <Activity size={14} className="text-emerald-500" />
                             <span className="text-xs text-zinc-500 font-semibold tabular-nums">
                                {(track.playCount ?? 0).toLocaleString()} plays
                             </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-zinc-600 font-medium">
                             <Clock size={14} className="text-zinc-800" />
                             {format(new Date(track.createdAt || Date.now()), 'MMM d, yyyy')}
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-8 xl:mt-0 relative z-10">
                    <button
                      onClick={() => navigate(`/artist/songs/${track._id}/analytics`)}
                      className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#0a0a0a] text-zinc-700 hover:text-emerald-500 border border-white/5 hover:border-emerald-500/20 transition-all shadow-xl"
                    >
                      <BarChart2 size={20} />
                    </button>
                    <button
                      onClick={() => setShareTarget({ id: track._id, title: track.name })}
                      className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#0a0a0a] text-zinc-700 hover:text-indigo-400 border border-white/5 hover:border-indigo-500/20 transition-all shadow-xl"
                      title="Share"
                    >
                      <Share2 size={20} />
                    </button>
                    <button
                      onClick={() => navigate(`/artist/song-edit/${track._id}`)}
                      className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#0a0a0a] text-zinc-700 hover:text-blue-500 border border-white/5 hover:border-blue-500/20 transition-all shadow-xl"
                    >
                      <Edit2 size={20} />
                    </button>
                    <div className="w-px h-8 bg-white/5 mx-2" />
                    <button
                      onClick={() => setSongToDelete(track._id)}
                      className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#0a0a0a] text-zinc-700 hover:text-rose-500 border border-white/5 hover:border-rose-500/20 transition-all shadow-xl"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
        <div className="p-6 bg-[#0a0a0a] border-t border-white/5 text-center">
            <button className="text-xs font-bold text-zinc-700 hover:text-white transition-all uppercase tracking-widest">Load More Songs</button>
        </div>
      </div>

      {shareTarget && (
        <ShareModal
          type="song"
          id={shareTarget.id}
          title={shareTarget.title}
          onClose={() => setShareTarget(null)}
        />
      )}

      <ConfirmDialog
        isOpen={!!songToDelete}
        title="Delete Song"
        message="Are you sure you want to delete this song? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setSongToDelete(null)}
      />
    </div>
  );
}
