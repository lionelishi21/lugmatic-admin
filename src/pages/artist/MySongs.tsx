import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Music2, Search, BarChart2, Edit2, Trash2,
  AlertCircle, Plus, Filter, X
} from 'lucide-react';
import { format } from 'date-fns';
import { RootState } from '../../store';
import artistService from '../../services/artistService';
import songService, { Song } from '../../services/songService';
import { Skeleton } from '../../components/ui/skeleton';
import { toast } from 'react-hot-toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const STATUS_OPTIONS = ['all', 'approved', 'pending', 'rejected'] as const;

const statusConfig: Record<string, { label: string; cls: string }> = {
  approved: { label: 'Approved',  cls: 'badge badge-green'  },
  pending:  { label: 'Pending',   cls: 'badge badge-amber'  },
  rejected: { label: 'Rejected',  cls: 'badge badge-red'    },
  default:  { label: 'Unknown',   cls: 'badge badge-gray'   },
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
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-header-title">My Library</h1>
          <p className="page-header-subtitle">Manage your tracks and view performance analytics</p>
        </div>
        <button
          onClick={() => navigate('/artist/upload')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl transition-all shadow-sm hover:shadow-emerald-200 hover:-translate-y-0.5 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Upload Track
        </button>
      </div>

      {/* ── Filter Bar ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search tracks…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all bg-gray-50 focus:bg-white"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 bg-gray-50 rounded-xl p-1 border border-gray-100 self-start sm:self-auto">
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
                statusFilter === s
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Track count ── */}
      {!loading && (
        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider px-1">
          {filteredSongs.length} {filteredSongs.length === 1 ? 'track' : 'tracks'}
          {statusFilter !== 'all' && ` · ${statusFilter}`}
          {searchTerm && ` · "${searchTerm}"`}
        </p>
      )}

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="divide-y divide-gray-50">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center gap-4 p-5">
                <div className="skeleton w-12 h-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-3.5 w-1/3" />
                  <div className="skeleton h-2.5 w-1/5" />
                </div>
                <div className="skeleton h-5 w-16 rounded-full" />
                <div className="skeleton h-5 w-12 rounded-full" />
              </div>
            ))}
          </div>
        ) : filteredSongs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th className="px-5 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Track</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">Source</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Plays</th>
                  <th className="px-5 py-3.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Uploaded</th>
                  <th className="px-5 py-3.5 text-right text-[11px] font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <AnimatePresence initial={false}>
                  {filteredSongs.map((track, i) => {
                    const sc = statusConfig[track.status] ?? statusConfig.default;
                    return (
                      <motion.tr
                        key={track._id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="hover:bg-gray-50/70 transition-colors group"
                      >
                        {/* Track */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <img
                              src={track.coverArtUrl || track.coverArt || '/default-track-cover.jpg'}
                              alt={track.name}
                              className="w-11 h-11 rounded-xl object-cover shadow-sm flex-shrink-0"
                              onError={e => { (e.target as HTMLImageElement).src = '/default-track-cover.jpg'; }}
                            />
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">{track.name}</p>
                              {track.status === 'rejected' && (
                                <p className="text-[11px] text-red-600 font-medium flex items-center gap-1 mt-0.5">
                                  <AlertCircle className="h-3 w-3" />
                                  Needs attention
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-3.5">
                          <span className={sc.cls}>{sc.label}</span>
                        </td>

                        {/* Source */}
                        <td className="px-5 py-3.5 hidden md:table-cell">
                          {/* @ts-ignore */}
                          {track.uploadSource === 'admin' ? (
                            <span className="badge badge-blue">Admin</span>
                          ) : (
                            <span className="badge badge-gray">Self</span>
                          )}
                        </td>

                        {/* Plays */}
                        <td className="px-5 py-3.5 hidden sm:table-cell">
                          <span className="text-sm font-semibold text-gray-800 tabular-nums">
                            {(track.playCount ?? 0).toLocaleString()}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-5 py-3.5 text-sm text-gray-500 hidden sm:table-cell">
                          {format(new Date(track.createdAt || Date.now()), 'MMM d, yyyy')}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => navigate(`/artist/songs/${track._id}/analytics`)}
                              className="icon-btn icon-btn-purple"
                              title="Analytics"
                            >
                              <BarChart2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => navigate(`/artist/song-edit/${track._id}`)}
                              className="icon-btn icon-btn-emerald"
                              title="Edit"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setSongToDelete(track._id)}
                              className="icon-btn icon-btn-red"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Music2 className="h-7 w-7 text-gray-400" />
            </div>
            <p className="empty-state-title">No tracks found</p>
            <p className="empty-state-body">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filter.'
                : 'Upload your first track to get started.'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button
                onClick={() => navigate('/artist/upload')}
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-500 transition-all"
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
