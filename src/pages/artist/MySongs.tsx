import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Music2, Search, BarChart2, Edit2, Trash2,
  AlertCircle, Plus, X, ListMusic, ChevronRight,
  Play, Clock, Target, Activity, Award, ShieldCheck,
  Zap, Headphones, Filter, SlidersHorizontal, ArrowUpRight
} from 'lucide-react';
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
      approved: { label: 'SYNCHRONIZED', cls: 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10', dot: 'bg-emerald-500' },
      pending:  { label: 'PENDING SYNC',  cls: 'bg-amber-500/5 text-amber-500 border-amber-500/10', dot: 'bg-amber-500'   },
      rejected: { label: 'SYNC REJECTED', cls: 'bg-rose-500/5 text-rose-500 border-rose-500/10', dot: 'bg-rose-500'     },
      default:  { label: 'UNKNOWN_NODE',  cls: 'bg-zinc-500/5 text-zinc-500 border-zinc-500/10', dot: 'bg-zinc-500'     },
    };
    const sc = config[status] ?? config.default;
    return (
      <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border ${sc.cls}`}>
        <div className={`w-1 h-1 rounded-full ${sc.dot} shadow-[0_0_5px_currentColor] animate-pulse`} />
        <span className="text-[9px] font-bold uppercase tracking-widest italic">{sc.label}</span>
      </div>
    );
  };

  return (
    <div className="space-y-12 pb-24">
      {/* Cinematic Archive Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold tracking-tight text-white leading-none">Neural Discography</h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{songs.length} Assets Registered</span>
            </div>
          </div>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.3em] ml-1">Managing high-fidelity musical transmissions and semantic metadata.</p>
        </div>
        <button
          onClick={() => navigate('/artist/upload')}
          className="h-16 px-10 bg-white text-black rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-2xl flex items-center justify-center gap-4 group border border-white/10"
        >
          <Plus size={18} />
          Initialize New Asset
        </button>
      </div>

      {/* Control Matrix HUD */}
      <div className="premium-card !p-4 bg-zinc-950/40 flex flex-col lg:flex-row gap-4 border-white/5 shadow-inner">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 h-5 w-5 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            placeholder="SCAN ARCHIVE REGISTRY..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-12 h-14 bg-[#0a0a0a] border border-white/5 rounded-2xl text-white text-[10px] font-bold tracking-[0.2em] uppercase focus:outline-none focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 transition-all shadow-inner placeholder:text-zinc-700 italic"
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

        <div className="flex bg-[#0a0a0a] p-1.5 rounded-2xl border border-white/5 shadow-inner gap-1.5">
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-8 h-11 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${
                statusFilter === s
                  ? 'bg-white/10 text-white shadow-xl border border-white/5'
                  : 'text-zinc-600 hover:text-zinc-300 hover:bg-white/5'
              }`}
            >
              {s === 'all' ? 'FULL SPECTRUM' : s.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Asset Stream Registry */}
      <div className="premium-card !p-0 overflow-hidden border-white/5 shadow-2xl">
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-zinc-950/50">
          <div className="flex items-center gap-4">
             <SlidersHorizontal size={18} className="text-emerald-500" />
             <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 italic">
               {filteredSongs.length} Neural Nodes Identified
             </h2>
          </div>
          <div className="flex items-center gap-3 px-4 py-1.5 bg-emerald-500/5 rounded-full border border-emerald-500/10">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
             <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">Neural Sync Optimized</span>
          </div>
        </div>

        <div className="divide-y divide-white/5">
          <AnimatePresence mode="wait">
            {loading ? (
              [1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center gap-10 px-10 py-8">
                  <Skeleton className="w-20 h-20 rounded-2xl bg-white/5" />
                  <div className="flex-1 space-y-4">
                    <Skeleton className="h-5 w-1/4 bg-white/5 rounded-lg" />
                    <Skeleton className="h-3 w-1/6 bg-white/5 rounded-lg" />
                  </div>
                  <div className="flex gap-4">
                     {[1, 2, 3].map(j => <Skeleton key={j} className="h-14 w-14 rounded-2xl bg-white/5" />)}
                  </div>
                </div>
              ))
            ) : filteredSongs.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-40 text-center bg-zinc-950/20"
              >
                <div className="w-24 h-24 bg-zinc-900 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-white/5 shadow-2xl group cursor-default">
                  <Music2 size={36} className="text-zinc-800 group-hover:text-emerald-500 transition-colors" />
                </div>
                <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.3em] mb-3 italic">Archive Scan Result: Null</h3>
                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.15em] max-w-sm mx-auto leading-relaxed opacity-60">
                   Adjust your search parameters or initialize a new transmission cycle for deployment.
                </p>
              </motion.div>
            ) : (
              filteredSongs.map((track, i) => (
                <motion.div
                  key={track._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                  className="flex flex-col xl:flex-row xl:items-center justify-between px-10 py-8 hover:bg-emerald-500/[0.01] transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/[0.01] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
                  
                  <div className="flex items-center gap-8 min-w-0 relative z-10">
                    <div className="relative flex-shrink-0 group-hover:scale-105 transition-all duration-700 shadow-2xl">
                      <img
                        src={track.coverArtUrl || track.coverArt || '/default-track-cover.jpg'}
                        alt={track.name}
                        className="w-20 h-20 rounded-2xl object-cover border border-white/5 shadow-inner bg-zinc-950 group-hover:border-emerald-500/20 transition-all"
                        onError={e => { (e.target as HTMLImageElement).src = '/default-track-cover.jpg'; }}
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center rounded-2xl backdrop-blur-[2px]">
                        <Play size={28} className="text-white fill-current animate-pulse" />
                      </div>
                    </div>
                    
                    <div className="min-w-0">
                       <div className="flex flex-wrap items-center gap-4 mb-3">
                          <h3 className="text-xl font-bold text-white uppercase tracking-tight truncate max-w-[400px] italic group-hover:text-emerald-400 transition-colors">
                            {track.name}
                          </h3>
                          <StatusBadge status={track.status} />
                       </div>
                       <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2.5 px-3 py-1 bg-[#0a0a0a] rounded-lg border border-white/5 shadow-inner">
                             <Activity size={14} className="text-emerald-500" />
                             <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest tabular-nums italic">
                                {(track.playCount ?? 0).toLocaleString()} <span className="opacity-50">Pulses</span>
                             </span>
                          </div>
                          <div className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
                          <div className="flex items-center gap-2.5 text-[10px] text-zinc-600 font-bold uppercase tracking-widest italic">
                             <Clock size={16} className="text-zinc-800 group-hover:text-emerald-500/40 transition-colors" />
                             {format(new Date(track.createdAt || Date.now()), 'MMM d, yyyy').toUpperCase()}
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-8 xl:mt-0 relative z-10">
                    <button
                      onClick={() => navigate(`/artist/songs/${track._id}/analytics`)}
                      className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#0a0a0a] text-zinc-600 hover:text-emerald-500 border border-white/5 hover:border-emerald-500/20 transition-all shadow-xl group-hover:shadow-emerald-500/5"
                    >
                      <BarChart2 size={20} />
                    </button>
                    <button
                      onClick={() => navigate(`/artist/song-edit/${track._id}`)}
                      className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#0a0a0a] text-zinc-600 hover:text-blue-500 border border-white/5 hover:border-blue-500/20 transition-all shadow-xl group-hover:shadow-blue-500/5"
                    >
                      <Edit2 size={20} />
                    </button>
                    <div className="w-px h-10 bg-white/5 mx-2" />
                    <button
                      onClick={() => setSongToDelete(track._id)}
                      className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#0a0a0a] text-zinc-600 hover:text-rose-500 border border-white/5 hover:border-rose-500/20 transition-all shadow-xl group-hover:shadow-rose-500/5"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
        <div className="p-8 bg-[#0a0a0a] border-t border-white/5 text-center">
             <button className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest hover:text-white transition-all">Intercept Entire Neural Discography Spectrum</button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!songToDelete}
        title="Protocol: Terminate Record Sequence"
        message="This action is irreversible. The neural record will be permanently purged from the sonic archive across all distribution sectors."
        confirmLabel="Initiate Purge"
        onConfirm={handleDelete}
        onCancel={() => setSongToDelete(null)}
      />
    </div>
  );
}
