import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Preloader from '../../components/ui/Preloader';
import { toast } from 'react-hot-toast';
import songService, { Song } from '../../services/songService';
import albumService, { Album } from '../../services/albumService';
import artistService, { Artist } from '../../services/artistService';
import genreService, { Genre } from '../../services/genreService';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import {
  Plus, Music2, Search, Trash2, Eye, CheckCircle2,
  Disc, User, Clock, BarChart3, MoreVertical, ShieldCheck,
  AlertCircle, ChevronRight, Filter, Target, Activity, Globe,
  Cpu, ArrowUpRight, Layers, Database, Save, HardDrive, Info,
  Music, Zap, SlidersHorizontal, ChevronDown, ArrowUpDown, ArrowUp, ArrowDown,
  XCircle, X
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { motion, AnimatePresence } from 'framer-motion';

const SongManagement: React.FC = () => {
  const navigate = useNavigate();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [songToDelete, setSongToDelete] = useState<string | null>(null);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const renderSortHeader = (label: string, field: string) => {
    const isSorted = sortField === field;
    return (
      <button 
        onClick={() => handleSort(field)}
        className="flex items-center gap-1.5 hover:text-zinc-900 dark:text-white transition-colors group/btn text-[10px] font-bold text-zinc-500"
      >
        <span>{label}</span>
        {isSorted ? (
          sortDirection === 'asc' ? <ArrowUp size={12} className="text-emerald-500" /> : <ArrowDown size={12} className="text-emerald-500" />
        ) : (
          <ArrowUpDown size={12} className="text-zinc-700 opacity-60 group-hover/btn:opacity-100 transition-opacity" />
        )}
      </button>
    );
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [songsData, artistsData, albumsData, genresData] = await Promise.all([
        songService.getAllSongs(),
        artistService.getAllArtists(),
        albumService.getAllAlbums(),
        genreService.getAllGenres()
      ]);
      setSongs(songsData);
      setArtists(artistsData);
      setAlbums(albumsData);
      setGenres(genresData);
    } catch (err: any) {
      toast.error('Failed to load catalog data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (songId: string) => {
    const loadingId = toast.loading('Approving song...');
    try {
      await adminService.moderateContent('songs', songId, 'approve');
      toast.success('Song approved successfully', { id: loadingId });
      setSongs(prev => prev.map(s => s._id === songId ? { ...s, isApproved: true } : s));
    } catch (err: any) {
      toast.error('Approval failed', { id: loadingId });
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    const songId = rejectTarget;
    setRejectTarget(null);
    const loadingId = toast.loading('Rejecting song...');
    try {
      await adminService.moderateContent('songs', songId, 'reject', rejectReason);
      toast.success('Song rejected', { id: loadingId });
      setSongs(prev => prev.map(s => s._id === songId ? { ...s, isApproved: false } : s));
      setRejectReason('');
    } catch (err: any) {
      toast.error('Rejection failed', { id: loadingId });
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredSongs = songs.filter((song) => {
    const q = searchTerm.toLowerCase();
    const nameMatch = song.name.toLowerCase().includes(q);
    const artistName = typeof song.artist === 'string' ? '' : (song.artist as any)?.name || '';
    const albumName = typeof song.album === 'string' ? '' : (song.album as any)?.name || '';
    return nameMatch || artistName.toLowerCase().includes(q) || albumName.toLowerCase().includes(q);
  });

  const sortedSongs = React.useMemo(() => {
    const list = [...filteredSongs];
    list.sort((a, b) => {
      let valA: any = '';
      let valB: any = '';

      if (sortField === 'name') {
        valA = a.name || '';
        valB = b.name || '';
      } else if (sortField === 'artist') {
        valA = typeof a.artist === 'string' ? '' : (a.artist as any)?.name || '';
        valB = typeof b.artist === 'string' ? '' : (b.artist as any)?.name || '';
      } else if (sortField === 'duration') {
        valA = a.duration || 0;
        valB = b.duration || 0;
      } else if (sortField === 'plays') {
        valA = a.playCount || 0;
        valB = b.playCount || 0;
      }

      if (typeof valA === 'string') {
        return sortDirection === 'asc' 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      } else {
        return sortDirection === 'asc' 
          ? (valA > valB ? 1 : -1) 
          : (valB > valA ? 1 : -1);
      }
    });
    return list;
  }, [filteredSongs, sortField, sortDirection]);

  if (loading && songs.length === 0) return <Preloader isVisible={true} text="Loading songs..." />;

  return (
    <div className="space-y-12 pb-24">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white leading-none">Song Management</h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500">System: Online</span>
            </div>
          </div>
          <p className="text-zinc-500 text-xs font-semibold ml-1">Manage and moderate all audio tracks, catalog items, and their metadata.</p>
        </div>
        <button 
          onClick={() => navigate('/admin/song-management/add')} 
          className="h-16 px-10 bg-white text-black rounded-2xl text-[10px] font-bold hover:scale-105 transition-all shadow-2xl flex-shrink-0 flex items-center justify-center gap-4 group border border-black/10 dark:border-white/10"
        >
          <Plus size={18} />
          Add New Song
        </button>
      </div>

      {/* Control Tools */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="relative w-full lg:max-w-xl group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 h-5 w-5 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            placeholder="Search songs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-12 h-14 bg-zinc-100 dark:bg-zinc-950/40 border border-black/5 dark:border-white/5 rounded-2xl text-zinc-900 dark:text-white text-[10px] font-bold focus:outline-none focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 transition-all shadow-inner placeholder:text-zinc-800"
          />
        </div>
        <div className="flex items-center gap-6">
           <div className="px-5 py-3 bg-zinc-100 dark:bg-zinc-950/40 border border-black/5 dark:border-white/5 rounded-2xl shadow-inner flex items-center gap-4">
              <Activity size={14} className="text-emerald-500" />
              <span className="text-[10px] font-bold text-zinc-500 leading-none">Found <span className="text-zinc-900 dark:text-white">{filteredSongs.length}</span> Results</span>
           </div>
           <div className="flex bg-zinc-100 dark:bg-zinc-950/40 border border-black/5 dark:border-white/5 rounded-2xl p-1.5 gap-1.5 shadow-inner">
              <button className="px-5 py-2.5 rounded-xl text-[9px] font-bold text-zinc-900 dark:text-white bg-black/10 dark:bg-white/10 border border-black/5 dark:border-white/5 shadow-xl">All Songs</button>
              <button className="px-5 py-2.5 rounded-xl text-[9px] font-bold text-zinc-600 hover:text-zinc-700 dark:text-zinc-300 transition-all">Needs Review</button>
           </div>
        </div>
      </div>

      {/* Songs Table */}
      <div className="premium-card !p-0 overflow-hidden border-black/5 dark:border-white/5 shadow-2xl bg-white dark:bg-[#0a0a0a]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-black/5 dark:border-white/5 bg-zinc-100 dark:bg-zinc-950/50">
                <th className="px-10 py-8 text-[10px] font-bold text-zinc-500">{renderSortHeader('Song Details', 'name')}</th>
                <th className="px-10 py-8 text-[10px] font-bold text-zinc-500">{renderSortHeader('Artist / Album', 'artist')}</th>
                <th className="px-10 py-8 text-[10px] font-bold text-zinc-500">{renderSortHeader('Duration / Genre', 'duration')}</th>
                <th className="px-10 py-8 text-[10px] font-bold text-zinc-500">{renderSortHeader('Plays', 'plays')}</th>
                <th className="px-10 py-8 text-[10px] font-bold text-zinc-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sortedSongs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-10 py-40 text-center">
                    <div className="w-24 h-24 bg-zinc-50 dark:bg-zinc-950 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 border border-black/5 dark:border-white/5 shadow-2xl group cursor-default">
                      <Music2 size={36} className="text-zinc-800 group-hover:text-emerald-500 transition-colors" />
                    </div>
                    <h3 className="text-[10px] font-bold text-zinc-900 dark:text-white mb-3">No Songs Found</h3>
                    <p className="text-[10px] text-zinc-600 font-bold max-w-sm mx-auto opacity-60">Adjust your search parameters or register a new song.</p>
                  </td>
                </tr>
              ) : (
                sortedSongs.map((song, i) => (
                  <motion.tr 
                    key={song._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-emerald-500/[0.01] transition-all group"
                  >
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-black/5 dark:border-white/5 overflow-hidden flex items-center justify-center shadow-inner relative group-hover:scale-110 transition-all duration-500">
                          <img
                            src={song.coverArtUrl || song.coverArt || '/assets/images/lugmaticIcon.png'}
                            alt={song.name}
                            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/assets/images/lugmaticIcon.png'; }}
                          />
                          <div className="absolute inset-0 bg-black/20" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight group-hover:text-emerald-400 transition-colors leading-none mb-2">{song.name}</p>
                          {!song.isApproved && (
                            <div className="flex items-center gap-2 bg-amber-500/5 px-2 py-1 rounded-lg border border-amber-500/10 w-fit">
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b] animate-pulse" />
                              <span className="text-[8px] font-black text-amber-500">Pending Approval</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                           <User size={12} className="text-zinc-700" />
                           <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-400 leading-none">{typeof song.artist === 'string' ? 'Unknown Artist' : (song.artist as any)?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <Disc size={12} className="text-zinc-700" />
                           <span className="text-[9px] text-zinc-600 font-bold leading-none">
                             {song.album ? (typeof song.album === 'string' ? 'Standalone Track' : (song.album as any)?.name) : 'Standalone Track'}
                           </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-zinc-500">
                           <Clock size={12} className="text-zinc-700" />
                           <span className="text-[10px] font-bold tabular-nums">{formatDuration(song.duration)} <span className="opacity-40 ml-1">minutes</span></span>
                        </div>
                        <div className="px-2 py-1 bg-zinc-50 dark:bg-zinc-950 border border-black/5 dark:border-white/5 rounded-lg w-fit">
                           <span className="text-[8px] font-black text-zinc-600">
                             {typeof song.genre === 'string' ? 'Genre Mix' : (song.genre as any)?.name || 'Genre Mix'}
                           </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-emerald-500/5 rounded-xl flex items-center justify-center border border-emerald-500/10 shadow-inner">
                            <Zap size={16} className="text-emerald-500" />
                         </div>
                         <div className="flex flex-col">
                            <span className="text-lg font-bold text-zinc-900 dark:text-white tracking-tighter tabular-nums leading-none">{(song.playCount || 0).toLocaleString()}</span>
                            <span className="text-[8px] font-black text-zinc-700 mt-1">plays</span>
                         </div>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        {!song.isApproved && (
                          <button
                            onClick={() => handleApprove(song._id)}
                            className="w-12 h-12 rounded-2xl flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 border border-black/5 dark:border-white/5 text-emerald-500/60 hover:text-emerald-500 hover:bg-emerald-500/10 transition-all shadow-inner"
                            title="Approve Song"
                          >
                            <ShieldCheck size={20} />
                          </button>
                        )}
                        <button
                          onClick={() => { setRejectReason(''); setRejectTarget(song._id); }}
                          className="w-12 h-12 rounded-2xl flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 border border-black/5 dark:border-white/5 text-amber-500/60 hover:text-amber-500 hover:bg-amber-500/10 transition-all shadow-inner"
                          title="Reject Song"
                        >
                          <XCircle size={20} />
                        </button>
                        <button 
                          onClick={() => navigate(`/admin/song-management/${song._id}`)} 
                          className="w-12 h-12 rounded-2xl flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 border border-black/5 dark:border-white/5 text-zinc-600 hover:text-zinc-900 dark:text-white hover:bg-black/5 dark:bg-white/5 transition-all shadow-inner" 
                          title="View Details"
                        >
                          <Eye size={20} />
                        </button>
                        <button 
                          onClick={() => setSongToDelete(song._id)} 
                          className="w-12 h-12 rounded-2xl flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 border border-black/5 dark:border-white/5 text-zinc-600 hover:text-rose-500 hover:bg-rose-500/10 transition-all shadow-inner" 
                          title="Delete Song"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!songToDelete}
        title="Delete Song?"
        message="Are you sure you want to permanently delete this song from the system? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={async () => {
          if (!songToDelete) return;
          const loadingId = toast.loading('Deleting song...');
          try {
            await songService.deleteSong(songToDelete);
            toast.success('Song deleted successfully', { id: loadingId });
            fetchData();
          } catch { toast.error('Delete failed', { id: loadingId }); }
          finally { setSongToDelete(null); }
        }}
        onCancel={() => setSongToDelete(null)}
      />

      {/* Reject Dialog */}
      <AnimatePresence>
        {rejectTarget && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={() => setRejectTarget(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="premium-card w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Reject Song</h3>
                <button onClick={() => setRejectTarget(null)} className="p-2 rounded-full hover:bg-black/5 dark:bg-white/5 text-zinc-500"><X size={20} /></button>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Rejection Reason</label>
                  <textarea
                    autoFocus placeholder="Specify violation or error..."
                    className="input-field h-32 resize-none"
                    value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-4 pt-4 border-t border-black/5 dark:border-white/5">
                  <button onClick={() => setRejectTarget(null)} className="btn-secondary">Cancel</button>
                  <button onClick={handleReject} className="btn-primary !bg-amber-500 !text-black hover:!bg-amber-400">
                    Confirm Rejection
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SongManagement;
