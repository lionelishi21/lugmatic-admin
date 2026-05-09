import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Music2, Search, BarChart2, Edit2, Trash2,
  AlertCircle, Plus, X, ListMusic, ChevronRight,
  Play, Clock, Target, Activity, Award, ShieldCheck
} from 'lucide-react';
import { format } from 'date-fns';
import { RootState } from '../../store';
import artistService from '../../services/artistService';
import songService, { Song } from '../../services/songService';
import { Skeleton } from '../../components/ui/skeleton';
import { toast } from 'react-hot-toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const STATUS_OPTIONS = ['all', 'approved', 'pending', 'rejected'] as const;

// ── Shared primitives ─────────────────────────────────────────────
const card = 'bg-zinc-900 border border-white/[0.06] rounded-lg shadow-2xl relative overflow-hidden group';
const labelClass = 'block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 italic';

const StatusBadge = ({ status }: { status: string }) => {
  const config: Record<string, { label: string; cls: string }> = {
    approved: { label: 'Approved', cls: 'bg-emerald-500/5 text-emerald-500 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' },
    pending:  { label: 'Pending Signal',  cls: 'bg-amber-500/5 text-amber-500 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]'   },
    rejected: { label: 'Rejected Signal', cls: 'bg-rose-500/5 text-rose-500 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]'     },
    default:  { label: 'Unknown Status',  cls: 'bg-zinc-500/5 text-zinc-500 border-zinc-500/20'     },
  };
  const sc = config[status] ?? config.default;
  return (
    <span className={`text-[9px] font-black uppercase tracking-[0.15em] px-3 py-1 rounded-md border italic ${sc.cls}`}>
      {sc.label}
    </span>
  );
};

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

  return (
    <div className="max-w-7xl mx-auto pb-16 space-y-8 animate-in fade-in duration-700">

      {/* ── Branded Archive Header ── */}
      <div className={`${card} p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden group`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/[0.02] rounded-bl-full pointer-events-none" />
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xl shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-500">
            <ListMusic className="h-8 w-8 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-2 italic">Sonic Intelligence Archive</p>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight uppercase italic">
              Track Library
            </h1>
            <p className="text-sm text-zinc-500 mt-1 font-medium">
              Manage your high-fidelity uploads, revenue splits, and performance metrics.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/artist/upload')}
          className="h-14 px-8 bg-emerald-500 text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-600 hover:scale-[1.02] transition-all shadow-2xl shadow-emerald-500/20 flex items-center justify-center gap-3 italic relative z-10"
        >
          <Plus className="h-5 w-5" />
          Initialize New Transmission
        </button>
      </div>

      {/* ── Search & Filter Engine HUD ── */}
      <div className={`${card} p-3 flex flex-col md:flex-row gap-4 bg-zinc-950/20 shadow-inner`}>
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 h-4.5 w-4.5 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            placeholder="SCAN SONIC ARCHIVE..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-12 h-14 bg-zinc-950 border border-white/[0.08] rounded-xl text-zinc-900 dark:text-white text-sm font-medium focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all shadow-inner placeholder:text-zinc-600 italic tracking-widest"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-rose-500 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="flex bg-zinc-950 p-1.5 rounded-xl border border-white/[0.04] shadow-inner gap-1.5">
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-6 h-11 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all italic ${
                statusFilter === s
                  ? 'bg-white text-zinc-950 shadow-2xl'
                  : 'text-zinc-500 hover:text-white hover:bg-white/[0.02]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tracks Stream HUD ── */}
      <div className={`${card} overflow-hidden shadow-2xl`}>
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/[0.06] bg-zinc-950/40">
          <div className="flex items-center gap-4">
             <Target className="h-5 w-5 text-emerald-500" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 italic">
               {filteredSongs.length} Records Identified
             </span>
          </div>
          <div className="flex items-center gap-3 bg-zinc-950 px-4 py-1.5 rounded-xl border border-white/[0.04] shadow-inner">
             <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)] animate-pulse" />
             <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic">Library Synced</span>
          </div>
        </div>

        <div className="divide-y divide-zinc-100 dark:divide-white/[0.04]">
          <AnimatePresence mode="wait">
            {loading ? (
              [1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center gap-8 px-8 py-7 bg-zinc-950/10">
                  <Skeleton className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/[0.04]" />
                  <div className="flex-1 space-y-4">
                    <Skeleton className="h-5 w-1/4 bg-zinc-900 rounded-lg" />
                    <Skeleton className="h-3 w-1/6 bg-zinc-900 rounded-lg" />
                  </div>
                  <div className="flex gap-3">
                     <Skeleton className="h-12 w-12 rounded-xl bg-zinc-900" />
                     <Skeleton className="h-12 w-12 rounded-xl bg-zinc-900" />
                     <Skeleton className="h-12 w-12 rounded-xl bg-zinc-900" />
                  </div>
                </div>
              ))
            ) : filteredSongs.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-32 text-center bg-zinc-950/20 shadow-inner"
              >
                <div className="w-20 h-20 bg-zinc-950 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/[0.04] shadow-2xl group cursor-default">
                  <Music2 className="h-10 w-10 text-zinc-700 group-hover:text-emerald-500 transition-colors" />
                </div>
                <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest italic">No Records Located</h3>
                <p className="text-[11px] text-zinc-500 font-black uppercase tracking-[0.15em] mt-3 max-w-xs mx-auto leading-relaxed opacity-60">
                  Adjust your search parameters or initialize a new transmission cycle.
                </p>
              </motion.div>
            ) : (
              filteredSongs.map((track, i) => (
                <motion.div
                  key={track._id}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center justify-between px-8 py-7 hover:bg-white/[0.02] transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.01] rounded-bl-full pointer-events-none" />
                  
                  <div className="flex items-center gap-8 min-w-0 relative z-10">
                    <div className="relative flex-shrink-0 group-hover:scale-105 transition-transform duration-500 shadow-2xl">
                      <img
                        src={track.coverArtUrl || track.coverArt || '/default-track-cover.jpg'}
                        alt={track.name}
                        className="w-16 h-16 rounded-2xl object-cover border border-white/[0.06] shadow-inner bg-zinc-950"
                        onError={e => { (e.target as HTMLImageElement).src = '/default-track-cover.jpg'; }}
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl backdrop-blur-sm">
                        <Play className="h-7 w-7 text-white fill-current animate-pulse" />
                      </div>
                    </div>
                    
                    <div className="min-w-0">
                       <div className="flex items-center gap-4 mb-2.5">
                          <h3 className="text-base font-black text-zinc-900 dark:text-white uppercase tracking-tight truncate max-w-[300px] italic group-hover:text-emerald-500 transition-colors">
                            {track.name}
                          </h3>
                          <StatusBadge status={track.status} />
                       </div>
                       <div className="flex items-center gap-5">
                          <div className="flex items-center gap-2.5 px-3 py-1 bg-zinc-950 rounded-xl border border-white/[0.04] shadow-inner">
                             <Activity className="h-3.5 w-3.5 text-emerald-500" />
                             <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest tabular-nums italic">
                                {(track.playCount ?? 0).toLocaleString()} <span className="text-zinc-600 ml-1">Transmissions</span>
                             </span>
                          </div>
                          <div className="w-1 h-1 rounded-full bg-zinc-800" />
                          <div className="flex items-center gap-2.5 text-[10px] text-zinc-500 font-black uppercase tracking-widest italic">
                             <Clock className="h-4 w-4 text-emerald-500/50" />
                             {format(new Date(track.createdAt || Date.now()), 'MMM d, yyyy')}
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 relative z-10">
                    <button
                      onClick={() => navigate(`/artist/songs/${track._id}/analytics`)}
                      className="w-12 h-12 rounded-xl flex items-center justify-center bg-zinc-950 text-zinc-600 hover:text-emerald-500 border border-white/[0.04] hover:border-emerald-500/30 transition-all shadow-xl group-hover:shadow-emerald-500/5"
                      title="Performance Analytics"
                    >
                      <BarChart2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => navigate(`/artist/song-edit/${track._id}`)}
                      className="w-12 h-12 rounded-xl flex items-center justify-center bg-zinc-950 text-zinc-600 hover:text-indigo-400 border border-white/[0.04] hover:border-indigo-500/30 transition-all shadow-xl group-hover:shadow-indigo-500/5"
                      title="Modify Metadata"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <div className="w-px h-8 bg-white/[0.06] mx-1" />
                    <button
                      onClick={() => setSongToDelete(track._id)}
                      className="w-12 h-12 rounded-xl flex items-center justify-center bg-zinc-950 text-zinc-600 hover:text-rose-500 border border-white/[0.04] hover:border-rose-500/30 transition-all shadow-xl group-hover:shadow-rose-500/5"
                      title="Terminate Record"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!songToDelete}
        title="Terminate Record Sequence"
        message="This action is irreversible. The record will be permanently purged from the sonic archive across all distribution sectors."
        confirmLabel="Purge Unit"
        onConfirm={handleDelete}
        onCancel={() => setSongToDelete(null)}
      />
    </div>
  );
}
