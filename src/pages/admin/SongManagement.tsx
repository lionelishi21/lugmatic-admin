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
  AlertCircle, ChevronRight, Filter
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
    const loadingId = toast.loading('Approving track...');
    try {
      await adminService.moderateContent('songs', songId, 'approve');
      toast.success('Track approved', { id: loadingId });
      setSongs(prev => prev.map(s => s._id === songId ? { ...s, isApproved: true } : s));
    } catch (err: any) {
      toast.error('Approval failed', { id: loadingId });
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

  if (loading && songs.length === 0) return <Preloader isVisible={true} text="Auditing audio tracks..." />;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Tracks</h1>
          <p className="text-zinc-500">Audit and manage the global song repository.</p>
        </div>
        <button 
          onClick={() => navigate('/admin/song-management/add')} 
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Add Track
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search tracks, artists, or albums..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-11"
          />
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold text-zinc-500">
          <Filter size={14} />
          <span>Showing {filteredSongs.length} results</span>
        </div>
      </div>

      {/* Main Table */}
      <div className="premium-card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-6 py-5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Track</th>
                <th className="px-6 py-5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Artist & Album</th>
                <th className="px-6 py-5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Details</th>
                <th className="px-6 py-5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Stats</th>
                <th className="px-6 py-5 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredSongs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-24 text-center">
                    <Music2 className="h-10 w-10 text-zinc-800 mx-auto mb-4" />
                    <p className="text-zinc-500 font-medium">No tracks found matching your search.</p>
                  </td>
                </tr>
              ) : (
                filteredSongs.map((song) => (
                  <tr key={song._id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 overflow-hidden flex items-center justify-center">
                          <img
                            src={song.coverArtUrl || song.coverArt || '/assets/images/lugmaticIcon.png'}
                            alt={song.name}
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/assets/images/lugmaticIcon.png'; }}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">{song.name}</p>
                          {!song.isApproved && (
                            <div className="flex items-center gap-1.5 mt-1">
                              <div className="w-1 h-1 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b] animate-pulse" />
                              <span className="text-[10px] font-bold text-amber-500 uppercase">Pending Approval</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-zinc-400">{typeof song.artist === 'string' ? 'Unknown' : (song.artist as any)?.name}</span>
                        <span className="text-[10px] text-zinc-600 font-medium">
                          {song.album ? (typeof song.album === 'string' ? 'Single' : (song.album as any)?.name) : 'Single'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4 text-xs font-medium text-zinc-500">
                        <span className="flex items-center gap-1.5"><Clock size={12} /> {formatDuration(song.duration)}</span>
                        <span className="px-2 py-0.5 bg-white/5 border border-white/5 rounded text-[10px] font-bold uppercase tracking-wider">
                          {typeof song.genre === 'string' ? 'Mix' : (song.genre as any)?.name || 'Mix'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                        <BarChart3 size={14} />
                        {(song.playCount || 0).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!song.isApproved && (
                          <button onClick={() => handleApprove(song._id)} className="p-2 rounded-lg text-emerald-500 hover:bg-emerald-500/10 transition-all" title="Approve">
                            <ShieldCheck size={18} />
                          </button>
                        )}
                        <button onClick={() => navigate(`/admin/song-management/${song._id}`)} className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-all" title="View">
                          <Eye size={18} />
                        </button>
                        <button onClick={() => setSongToDelete(song._id)} className="p-2 rounded-lg text-zinc-500 hover:text-rose-500 hover:bg-rose-500/5 transition-all" title="Delete">
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
      </div>

      {/* Confirmation */}
      <ConfirmDialog
        isOpen={!!songToDelete}
        title="Delete Track?"
        message="This will permanently remove the song from all albums and playlists. This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={async () => {
          if (!songToDelete) return;
          try {
            await songService.deleteSong(songToDelete);
            toast.success('Track removed');
            fetchData();
          } catch { toast.error('Failed to delete track'); }
          finally { setSongToDelete(null); }
        }}
        onCancel={() => setSongToDelete(null)}
      />
    </div>
  );
};

export default SongManagement;
