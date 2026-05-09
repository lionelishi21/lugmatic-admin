import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Preloader from '../../components/ui/Preloader';
import { toast } from 'react-hot-toast';
import songService, { Song } from '../../services/songService';
import albumService, { Album } from '../../services/albumService';
import artistService, { Artist } from '../../services/artistService';
import genreService, { Genre } from '../../services/genreService';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Plus, Music2, Search, Trash2, Eye, CheckCircle } from 'lucide-react';
import { adminService } from '../../services/adminService';

const SongManagement: React.FC = () => {
  const navigate = useNavigate();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [songToDelete, setSongToDelete] = useState<string | null>(null);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);

  // Fetch songs, artists, albums, and genres
  useEffect(() => {
    fetchSongs();
    fetchArtists();
    fetchAlbums();
    fetchGenres();
  }, []);

  const fetchArtists = async () => {
    try {
      const data = await artistService.getAllArtists();
      setArtists(data);
    } catch (err: any) {
      console.error('Failed to fetch artists:', err);
    }
  };

  const fetchAlbums = async () => {
    try {
      const data = await albumService.getAllAlbums();
      setAlbums(data);
    } catch (err: any) {
      console.error('Failed to fetch albums:', err);
    }
  };

  const fetchGenres = async () => {
    try {
      const data = await genreService.getAllGenres();
      setGenres(data);
    } catch (err: any) {
      console.error('Failed to fetch genres:', err);
    }
  };

  const fetchSongs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await songService.getAllSongs();
      setSongs(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch songs';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (songId: string) => {
    try {
      toast.loading('Approving song...', { id: 'approve-song' });
      await adminService.moderateContent('songs', songId, 'approve');
      toast.success('Song approved successfully', { id: 'approve-song' });
      // Update local state instead of re-fetching everything
      setSongs(prev => prev.map(s => s._id === songId ? { ...s, isApproved: true } : s));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to approve song';
      toast.error(errorMessage, { id: 'approve-song' });
    }
  };

  const confirmDelete = async () => {
    if (!songToDelete) return;
    try {
      await songService.deleteSong(songToDelete);
      toast.success('Song deleted successfully');
      fetchSongs();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete song';
      toast.error(errorMessage);
    } finally {
      setSongToDelete(null);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredSongs = songs.filter((song) => {
    const nameMatch = song.name.toLowerCase().includes(searchTerm.toLowerCase());
    const artistMatch = typeof song.artist === 'string'
      ? song.artist.toLowerCase().includes(searchTerm.toLowerCase())
      : (song.artist?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const albumMatch = song.album
      ? (typeof song.album === 'string'
        ? song.album.toLowerCase().includes(searchTerm.toLowerCase())
        : (song.album?.name || '').toLowerCase().includes(searchTerm.toLowerCase()))
      : false;
    return nameMatch || artistMatch || albumMatch;
  });

  const cardClass = "bg-zinc-900 border border-white/[0.06] rounded-lg p-6 shadow-2xl relative overflow-hidden group";
  const labelClass = "text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1 italic";
  const valueClass = "text-sm font-black text-white italic uppercase tracking-tight";
  const inputClass = "w-full bg-zinc-950 border border-white/10 rounded px-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-emerald-500/50 transition-all font-bold italic uppercase tracking-tight";

  if (loading && songs.length === 0) {
    return <Preloader isVisible={true} text="Synchronizing frequencies..." />;
  }

  return (
    <div className="max-w-7xl mx-auto pb-24 space-y-8 px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-1.5 italic">Signal Node Registry</p>
           <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
             Song Management
           </h1>
           <p className="text-xs text-zinc-500 mt-1 uppercase font-bold tracking-widest">
             Audit and synchronize individual sonic transmissions across the grid.
           </p>
        </div>
        <button
          onClick={() => navigate('/admin/song-management/add')}
          className="px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded hover:bg-emerald-400 transition-all shadow-xl italic flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Initialize New Signal
        </button>
      </div>

      {/* Search Bar */}
      <div className={`${cardClass} py-4 px-6`}>
        <div className="relative w-full max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 w-4 h-4" />
          <input
            type="text"
            placeholder="SEARCH SONIC REGISTRY..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`${inputClass} pl-11 py-2.5`}
          />
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded text-xs font-black uppercase tracking-widest italic mb-6">
          SCAN ERROR: {error}
        </div>
      )}

      {/* Table Content */}
      <div className={`${cardClass} p-0 overflow-hidden`}>
        {filteredSongs.length === 0 ? (
          <div className="p-24 text-center">
            <Music2 className="w-16 h-16 mx-auto mb-6 text-zinc-800" />
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">NO SIGNAL NODES MATCH CURRENT FREQUENCY SCAN</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-zinc-800/50 border-b border-white/[0.06]">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] italic">Unit ID</th>
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] italic">Designation</th>
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] italic">Origin</th>
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] italic">Repository</th>
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] italic">Frequency</th>
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] italic">Cycle</th>
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] italic text-center">Load</th>
                  <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] italic text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filteredSongs.map((song) => (
                  <tr key={song._id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-5">
                      <div className="w-12 h-12 rounded bg-zinc-950 border border-white/10 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        <img
                          src={song.coverArtUrl || song.coverArt || '/assets/images/lugmaticIcon.png'}
                          alt={song.name}
                          className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/images/lugmaticIcon.png';
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div>
                        <div className="text-sm font-black text-white uppercase italic tracking-tight">{song.name}</div>
                        {!song.isApproved && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="w-1 h-1 rounded-full bg-amber-500 animate-pulse"></span>
                            <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest italic">PENDING APPROVAL</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-xs font-black text-zinc-500 uppercase italic">
                        {typeof song.artist === 'object' && song.artist !== null
                          ? (song.artist.name || 'UNKNOWN')
                          : (artists.find(a => a._id === song.artist)?.name || (typeof song.artist === 'string' ? song.artist : 'UNKNOWN'))}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-xs font-black text-zinc-500 uppercase italic">
                        {song.album
                          ? (typeof song.album === 'object' && song.album !== null
                            ? (song.album.name || 'N/A')
                            : (albums.find(a => a._id === song.album)?.name || (typeof song.album === 'string' ? song.album : 'N/A')))
                          : 'SINGLE'}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 text-[9px] font-black uppercase tracking-widest rounded border border-white/5 italic">
                        {typeof song.genre === 'object' && song.genre !== null
                          ? (song.genre.name || '—')
                          : (genres.find(g => g._id === (typeof song.genre === 'string' ? song.genre : ''))?.name || (typeof song.genre === 'string' ? song.genre : '—'))}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-xs font-black text-zinc-500 uppercase italic tabular-nums">
                      {formatDuration(song.duration)}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="text-sm font-black text-emerald-500 italic tabular-nums">
                        {(song.playCount || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2">
                        {!song.isApproved && (
                          <button
                            type="button"
                            onClick={() => handleApprove(song._id)}
                            className="w-9 h-9 bg-emerald-500 text-black rounded border border-emerald-400/20 flex items-center justify-center hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
                            title="Approve Signal"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/song-management/${song._id}`)}
                          className="w-9 h-9 bg-zinc-800 text-white rounded border border-white/5 flex items-center justify-center hover:bg-emerald-500 hover:text-black transition-all"
                          title="Audit Node"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSongToDelete(song._id)}
                          className="w-9 h-9 bg-zinc-800 text-rose-500 rounded border border-white/5 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
                          title="Purge Node"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!songToDelete}
        title="Purge Signal Node"
        message="Are you sure you want to purge this transmission from the grid? This protocol is irreversible."
        confirmLabel="PURGE_SEQUENCE"
        cancelLabel="ABORT"
        onConfirm={confirmDelete}
        onCancel={() => setSongToDelete(null)}
      />
    </div>
  );
};

export default SongManagement;

