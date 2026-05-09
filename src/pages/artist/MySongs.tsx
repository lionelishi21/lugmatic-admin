import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Music2, Search, BarChart2, Edit2, Trash2,
  AlertCircle, Plus, X, ListMusic, ChevronRight,
  Play, Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { RootState } from '../../store';
import artistService from '../../services/artistService';
import songService, { Song } from '../../services/songService';
import { Skeleton } from '../../components/ui/skeleton';
import { toast } from 'react-hot-toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const STATUS_OPTIONS = ['all', 'approved', 'pending', 'rejected'] as const;

const card = 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] rounded-lg';

const StatusBadge = ({ status }: { status: string }) => {
  const config: Record<string, { label: string; cls: string }> = {
    approved: { label: 'Approved', cls: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
    pending:  { label: 'Pending',  cls: 'bg-amber-500/10 text-amber-500 border-amber-500/20'   },
    rejected: { label: 'Rejected', cls: 'bg-rose-500/10 text-rose-500 border-rose-500/20'     },
    default:  { label: 'Unknown',  cls: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'     },
  };
  const sc = config[status] ?? config.default;
  return (
    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${sc.cls}`}>
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
    <div className="max-w-5xl mx-auto pb-16 space-y-6">

      {/* ── Header Card ── */}
      <div className={`${card} p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6`}>
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
            <ListMusic className="h-7 w-7 text-white" />
          </div>
          <div>
             <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1 italic">Sonic Archive</p>
             <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight uppercase italic">
               Track Library
             </h1>
             <p className="text-sm text-zinc-500 mt-0.5">
               Manage your uploads, splits, and performance metrics.
             </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/artist/upload')}
          className="h-11 px-6 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[10px] font-black uppercase tracking-widest rounded hover:opacity-90 transition-all shadow-xl shadow-zinc-900/10 flex items-center justify-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add New Track
        </button>
      </div>

      {/* ── Search & Filter ── */}
      <div className={`${card} p-4 flex flex-col md:flex-row gap-4 bg-zinc-50/50 dark:bg-zinc-800/20`}>
        <div className="relative flex-1 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            placeholder="Search sonic archive..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 h-11 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded text-zinc-900 dark:text-white text-sm font-medium focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded gap-1">
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 h-9 rounded text-[10px] font-black uppercase tracking-widest transition-all ${
                statusFilter === s
                  ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tracks List ── */}
      <div className={`${card} overflow-hidden`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-white/[0.06] bg-zinc-50/30 dark:bg-white/[0.01]">
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
            {filteredSongs.length} Records Found
          </span>
          <div className="flex items-center gap-1.5">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
             <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Library Synced</span>
          </div>
        </div>

        <div className="divide-y divide-zinc-100 dark:divide-white/[0.04]">
          <AnimatePresence mode="wait">
            {loading ? (
              [1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center gap-5 px-6 py-5">
                  <Skeleton className="w-14 h-14 rounded-lg" />
                  <div className="flex-1 space-y-2.5">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/5" />
                  </div>
                  <Skeleton className="h-8 w-24 rounded" />
                </div>
              ))
            ) : filteredSongs.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-24 text-center"
              >
                <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-3xl flex items-center justify-center mx-auto mb-5 border border-zinc-200 dark:border-white/5">
                  <Music2 className="h-10 w-10 text-zinc-400" />
                </div>
                <p className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-tight">No records located</p>
                <p className="text-[11px] text-zinc-500 mt-1 uppercase tracking-widest">Adjust your search or upload new content.</p>
              </motion.div>
            ) : (
              filteredSongs.map((track, i) => (
                <motion.div
                  key={track._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center justify-between px-6 py-5 hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-all group"
                >
                  <div className="flex items-center gap-5 min-w-0">
                    <div className="relative flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                      <img
                        src={track.coverArtUrl || track.coverArt || '/default-track-cover.jpg'}
                        alt={track.name}
                        className="w-14 h-14 rounded-lg object-cover border border-zinc-200 dark:border-white/10"
                        onError={e => { (e.target as HTMLImageElement).src = '/default-track-cover.jpg'; }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                        <Play className="h-6 w-6 text-white fill-current" />
                      </div>
                    </div>
                    
                    <div className="min-w-0">
                       <div className="flex items-center gap-3">
                          <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-tight truncate max-w-[250px]">
                            {track.name}
                          </h3>
                          <StatusBadge status={track.status} />
                       </div>
                       <div className="flex items-center gap-4 mt-2">
                          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                             <BarChart2 className="h-3 w-3 text-emerald-500" />
                             {(track.playCount ?? 0).toLocaleString()} <span className="text-zinc-600 font-medium">Plays</span>
                          </span>
                          <div className="w-1 h-1 rounded-full bg-zinc-700" />
                          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                             <Clock className="h-3 w-3" />
                             {format(new Date(track.createdAt || Date.now()), 'MMM d, yyyy')}
                          </span>
                       </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/artist/songs/${track._id}/analytics`)}
                      className="w-10 h-10 rounded-lg flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all border border-transparent hover:border-emerald-500/20"
                      title="Performance"
                    >
                      <BarChart2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => navigate(`/artist/song-edit/${track._id}`)}
                      className="w-10 h-10 rounded-lg flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all border border-transparent hover:border-indigo-500/20"
                      title="Modify"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setSongToDelete(track._id)}
                      className="w-10 h-10 rounded-lg flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20"
                      title="Terminate"
                    >
                      <Trash2 className="h-4 w-4" />
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
        title="Terminate Record"
        message="This action is irreversible. The record will be permanently purged from the sonic archive."
        confirmLabel="Purge"
        onConfirm={handleDelete}
        onCancel={() => setSongToDelete(null)}
      />
    </div>
  );
}
