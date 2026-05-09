import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Music2, Search, BarChart2, Edit2, Trash2,
  AlertCircle, Plus, X
} from 'lucide-react';
import { format } from 'date-fns';
import { RootState } from '../../store';
import artistService from '../../services/artistService';
import songService, { Song } from '../../services/songService';
import { Skeleton } from '../../components/ui/skeleton';
import { toast } from 'react-hot-toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const STATUS_OPTIONS = ['all', 'approved', 'pending', 'rejected'] as const;

const statusConfig: Record<string, { label: string; color: string }> = {
  approved: { label: 'Approved', color: 'emerald' },
  pending:  { label: 'Pending',  color: 'amber'   },
  rejected: { label: 'Rejected', color: 'red'     },
  default:  { label: 'Unknown',  color: 'zinc'    },
};

const StatusBadge = ({ status }: { status: string }) => {
  const sc = statusConfig[status] ?? statusConfig.default;
  const colorMap: Record<string, string> = {
    emerald: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    amber:   'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400',
    red:     'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400',
    zinc:    'bg-zinc-50 dark:bg-zinc-500/10 text-zinc-700 dark:text-zinc-400',
  };
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${colorMap[sc.color]}`}>
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">My Library</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Manage your tracks and view performance analytics</p>
        </div>
        <button
          onClick={() => navigate('/artist/upload')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded text-sm font-semibold hover:bg-emerald-700 transition-colors self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Upload Track
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] rounded-lg p-4 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search tracks…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/[0.08] rounded text-zinc-900 dark:text-white text-sm px-3 py-2 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 pl-9"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded p-0.5 self-start sm:self-auto">
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wide transition-colors ${
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

      {/* Track count */}
      {!loading && (
        <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest px-1">
          {filteredSongs.length} {filteredSongs.length === 1 ? 'track' : 'tracks'}
          {statusFilter !== 'all' && ` · ${statusFilter}`}
          {searchTerm && ` · "${searchTerm}"`}
        </p>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] rounded-lg overflow-hidden">
        {loading ? (
          <div className="divide-y divide-zinc-100 dark:divide-white/[0.04]">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center gap-4 p-5">
                <Skeleton className="w-11 h-11 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-1/3" />
                  <Skeleton className="h-2.5 w-1/5" />
                </div>
                <Skeleton className="h-5 w-16 rounded" />
                <Skeleton className="h-5 w-12 rounded" />
              </div>
            ))}
          </div>
        ) : filteredSongs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-white/[0.06] bg-zinc-50/80 dark:bg-white/[0.02]">
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-zinc-500">Track</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-zinc-500">Status</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-zinc-500 hidden md:table-cell">Source</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-zinc-500 hidden sm:table-cell">Plays</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-zinc-500 hidden sm:table-cell">Uploaded</th>
                  <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-widest text-zinc-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.04]">
                <AnimatePresence initial={false}>
                  {filteredSongs.map((track, i) => (
                    <motion.tr
                      key={track._id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Track */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={track.coverArtUrl || track.coverArt || '/default-track-cover.jpg'}
                            alt={track.name}
                            className="w-11 h-11 rounded object-cover flex-shrink-0"
                            onError={e => { (e.target as HTMLImageElement).src = '/default-track-cover.jpg'; }}
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate max-w-[200px]">{track.name}</p>
                            {track.status === 'rejected' && (
                              <p className="text-[11px] text-red-600 dark:text-red-400 font-medium flex items-center gap-1 mt-0.5">
                                <AlertCircle className="h-3 w-3" />
                                Needs attention
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <StatusBadge status={track.status} />
                      </td>

                      {/* Source */}
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        {/* @ts-ignore */}
                        {track.uploadSource === 'admin' ? (
                          <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400">Admin</span>
                        ) : (
                          <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-zinc-50 dark:bg-zinc-500/10 text-zinc-700 dark:text-zinc-400">Self</span>
                        )}
                      </td>

                      {/* Plays */}
                      <td className="px-5 py-3.5 hidden sm:table-cell">
                        <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 tabular-nums">
                          {(track.playCount ?? 0).toLocaleString()}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-3.5 text-sm text-zinc-500 hidden sm:table-cell">
                        {format(new Date(track.createdAt || Date.now()), 'MMM d, yyyy')}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => navigate(`/artist/songs/${track._id}/analytics`)}
                            className="w-8 h-8 rounded flex items-center justify-center bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-500/20 transition-colors"
                            title="Analytics"
                          >
                            <BarChart2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/artist/song-edit/${track._id}`)}
                            className="w-8 h-8 rounded flex items-center justify-center bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setSongToDelete(track._id)}
                            className="w-8 h-8 rounded flex items-center justify-center bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center">
            <div className="w-14 h-14 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Music2 className="h-6 w-6 text-zinc-400" />
            </div>
            <p className="font-semibold text-zinc-700 dark:text-zinc-300">No tracks found</p>
            <p className="text-sm text-zinc-400 mt-1">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filter.'
                : 'Upload your first track to get started.'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button
                onClick={() => navigate('/artist/upload')}
                className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded hover:bg-emerald-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Upload Track
              </button>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!songToDelete}
        title="Delete Track"
        message="This action cannot be undone. The track will be permanently removed."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setSongToDelete(null)}
      />
    </div>
  );
}
