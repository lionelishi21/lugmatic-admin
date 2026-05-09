import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Preloader from '../../components/ui/Preloader';
import { toast } from 'react-hot-toast';
import playlistService, { Playlist, CreatePlaylistData, UpdatePlaylistData } from '../../services/playlistService';
import songService, { Song } from '../../services/songService';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import {
  Plus, Edit, Trash2, Search, ListMusic, X, MoreHorizontal,
  Music, LayoutGrid, List, Loader2, CheckSquare, Square, Star
} from 'lucide-react';

const PlaylistManagement: React.FC = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [songSearch, setSongSearch] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [playlistToDelete, setPlaylistToDelete] = useState<string | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<CreatePlaylistData>>({
    name: '',
    description: '',
    songs: [],
    isRecommended: true,
  });
  const [selectedSongs, setSelectedSongs] = useState<string[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchPlaylists();
    fetchSongs();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchPlaylists = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await playlistService.getAllPlaylists();
      setPlaylists(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch playlists';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchSongs = async () => {
    try {
      const data = await songService.getAllSongs();
      setSongs(data);
    } catch (err: any) {
      console.error('Failed to fetch songs:', err);
    }
  };

  const handleOpenDialog = (playlist?: Playlist) => {
    if (playlist) {
      setSelectedPlaylist(playlist);
      setFormData({
        name: playlist.name,
        description: playlist.description || '',
        songs: playlist.songs || [],
        isRecommended: true,
      });
      setSelectedSongs(playlist.songs || []);
    } else {
      setSelectedPlaylist(null);
      setFormData({ name: '', description: '', songs: [], isRecommended: true });
      setSelectedSongs([]);
    }
    setSongSearch('');
    setIsDialogOpen(true);
    setOpenMenuId(null);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedPlaylist(null);
    setFormData({ name: '', description: '', songs: [], isRecommended: true });
    setSelectedSongs([]);
    setSongSearch('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSongToggle = (songId: string) => {
    setSelectedSongs((prev) => {
      const newSelection = prev.includes(songId)
        ? prev.filter((id) => id !== songId)
        : [...prev, songId];
      setFormData((prevData) => ({ ...prevData, songs: newSelection }));
      return newSelection;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (selectedPlaylist) {
        await playlistService.adminUpdatePlaylist(selectedPlaylist._id, {
          ...formData,
          songs: selectedSongs,
        } as Partial<UpdatePlaylistData>);
        toast.success('Playlist updated successfully');
      } else {
        await playlistService.createRecommendedPlaylist({
          ...formData,
          songs: selectedSongs,
        } as CreatePlaylistData);
        toast.success('Playlist created successfully');
      }
      handleCloseDialog();
      fetchPlaylists();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save playlist';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!playlistToDelete) return;
    try {
      await playlistService.deletePlaylist(playlistToDelete);
      toast.success('Playlist deleted successfully');
      fetchPlaylists();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete playlist';
      toast.error(errorMessage);
    } finally {
      setPlaylistToDelete(null);
    }
  };

  const filteredPlaylists = playlists.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSongs = songs.filter((s) =>
    s.name.toLowerCase().includes(songSearch.toLowerCase()) ||
    (typeof s.artist === 'string' ? s.artist : s.artist?.name || '').toLowerCase().includes(songSearch.toLowerCase())
  );

  const totalSongs = playlists.reduce((sum, p) => sum + (p.songs?.length || 0), 0);
  const recommendedCount = playlists.filter((p) => p.isRecommended).length;
  const avgSongs = playlists.length > 0 ? Math.round(totalSongs / playlists.length) : 0;

  const getSongName = (id: string) => songs.find((s) => s._id === id)?.name || id;

  const cardClass = "bg-zinc-900 border border-white/[0.06] rounded-lg p-6 shadow-2xl relative overflow-hidden group";
  const labelClass = "text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1 italic";
  const valueClass = "text-sm font-black text-white italic uppercase tracking-tight";
  const inputClass = "w-full bg-zinc-950 border border-white/10 rounded px-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-emerald-500/50 transition-all font-bold italic uppercase tracking-tight";

  if (loading && playlists.length === 0) {
    return <Preloader isVisible={true} text="Synchronizing playlists..." />;
  }

  return (
    <div className="max-w-7xl mx-auto pb-24 space-y-8 px-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-1.5 italic">Content Curation Protocol</p>
           <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
             Playlist Management
           </h1>
           <p className="text-xs text-zinc-500 mt-1 uppercase font-bold tracking-widest">
             Create and manage curated sonic repositories for the user base.
           </p>
        </div>
        <button
          onClick={() => handleOpenDialog()}
          className="px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded hover:bg-emerald-400 transition-all shadow-xl italic flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Initialize New Playlist
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Repositories', value: playlists.length, icon: ListMusic, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Signal Units', value: totalSongs, icon: Music, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Curated Sets', value: recommendedCount, icon: Star, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { label: 'Density Ratio', value: avgSongs, icon: CheckSquare, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={cardClass}>
            <div className="flex items-center justify-between mb-4">
               <div className={`w-10 h-10 rounded flex items-center justify-center ${bg} border border-white/5`}>
                 <Icon className={`w-5 h-5 ${color}`} />
               </div>
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className={labelClass}>{label}</p>
            <p className="text-2xl font-black text-white italic uppercase tracking-tighter tabular-nums">{value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className={`${cardClass} py-4 px-6`}>
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 w-4 h-4" />
            <input
              type="text"
              placeholder="SEARCH REGISTRY..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${inputClass} pl-11 py-2.5`}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic">{filteredPlaylists.length} NODES DETECTED</span>
            <div className="flex bg-zinc-950 border border-white/5 rounded p-1 gap-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-all ${viewMode === 'grid' ? 'bg-zinc-800 text-emerald-500' : 'text-zinc-600 hover:text-zinc-400'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-all ${viewMode === 'list' ? 'bg-zinc-800 text-emerald-500' : 'text-zinc-600 hover:text-zinc-400'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Playlists Container */}
      <div className="min-h-[400px]">
        {filteredPlaylists.length === 0 ? (
          <div className={`${cardClass} flex flex-col items-center justify-center py-24 text-center border-dashed`}>
            <div className="w-16 h-16 rounded bg-zinc-950 border border-white/10 flex items-center justify-center mb-6">
              <ListMusic className="w-8 h-8 text-zinc-800" />
            </div>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">NO PLAYLIST DATA MATCHES CURRENT FILTERS</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPlaylists.map((playlist) => (
              <motion.div
                key={playlist._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${cardClass} p-0 flex flex-col hover:border-emerald-500/30 transition-all cursor-pointer overflow-hidden`}
              >
                {/* Cover / Icon */}
                <div className="relative aspect-square bg-zinc-950 overflow-hidden">
                  {playlist.artwork?.full || playlist.artwork?.thumbnail ? (
                    <img
                      src={playlist.artwork.full || playlist.artwork.thumbnail}
                      alt={playlist.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ListMusic className="w-16 h-16 text-zinc-900 group-hover:text-emerald-500/20 transition-colors" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />

                  {/* Badges */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                    {playlist.isRecommended && (
                      <span className="px-2 py-1 bg-emerald-500 text-black text-[9px] font-black uppercase tracking-widest rounded italic shadow-2xl">
                        CURATED
                      </span>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="absolute bottom-4 right-4 flex gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleOpenDialog(playlist); }}
                      className="w-10 h-10 bg-white text-black rounded flex items-center justify-center hover:bg-emerald-400 transition-all shadow-xl"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setPlaylistToDelete(playlist._id); }}
                      className="w-10 h-10 bg-zinc-900/80 backdrop-blur-md text-rose-500 border border-white/10 rounded flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-xl"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-5">
                  <h3 className="text-sm font-black text-white uppercase italic tracking-tight truncate group-hover:text-emerald-500 transition-colors">{playlist.name}</h3>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2 text-zinc-500 italic">
                       <Music className="w-3 h-3 text-emerald-500" />
                       <span className="text-[10px] font-black uppercase tracking-widest">{(playlist.songs?.length || 0)} UNITS</span>
                    </div>
                    <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.2em]">NODE: {playlist._id.slice(-6).toUpperCase()}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* List view */
          <div className={`${cardClass} p-0 overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-zinc-800/50 border-b border-white/[0.06]">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] italic">Playlist Identity</th>
                    <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] italic hidden md:table-cell">Descriptor</th>
                    <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] italic text-center">Density</th>
                    <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] italic text-center">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] italic text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredPlaylists.map((playlist) => (
                    <tr key={playlist._id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded bg-zinc-950 border border-white/10 flex-shrink-0 overflow-hidden flex items-center justify-center">
                            {playlist.artwork?.thumbnail ? (
                              <img src={playlist.artwork.thumbnail} alt={playlist.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100" />
                            ) : (
                              <ListMusic className="w-6 h-6 text-zinc-800" />
                            )}
                          </div>
                          <p className="text-sm font-black text-white uppercase italic tracking-tight">{playlist.name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-5 hidden md:table-cell">
                        <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest line-clamp-1 max-w-xs">{playlist.description || 'NO METADATA'}</p>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="text-xs font-black text-emerald-500 uppercase italic">{(playlist.songs?.length || 0)} UNITS</span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        {playlist.isRecommended ? (
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest rounded border border-emerald-500/20 italic">PREDEFINED</span>
                        ) : (
                          <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest italic">—</span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => handleOpenDialog(playlist)}
                            className="w-9 h-9 bg-zinc-800 text-white rounded border border-white/5 flex items-center justify-center hover:bg-emerald-500 hover:text-black transition-all"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setPlaylistToDelete(playlist._id)}
                            className="w-9 h-9 bg-zinc-800 text-rose-500 rounded border border-white/5 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
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
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <AnimatePresence>
        {isDialogOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-zinc-900 border border-white/10 rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[60px] rounded-full" />
              
              {/* Modal Header */}
              <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 relative bg-zinc-800/30">
                <div>
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-1 italic">Protocol Initialization</p>
                   <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">
                     {selectedPlaylist ? 'Modify Playlist' : 'Initialize Playlist'}
                   </h2>
                </div>
                <button
                  onClick={handleCloseDialog}
                  className="w-10 h-10 bg-zinc-950 border border-white/10 rounded flex items-center justify-center text-zinc-500 hover:text-emerald-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-8 space-y-6 relative">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className={labelClass}>Playlist Designation <span className="text-emerald-500">*</span></label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="ENTER DESIGNATION..."
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Operational Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={2}
                      placeholder="ENTER OPERATIONAL METADATA..."
                      className={`${inputClass} resize-none`}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className={labelClass}>Signal Selection</label>
                      <span className="text-[10px] font-black text-emerald-500 uppercase italic">
                        {selectedSongs.length} UNITS SYNCED
                      </span>
                    </div>

                    <div className="relative mb-3">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 w-3.5 h-3.5" />
                      <input
                        type="text"
                        placeholder="SEARCH SIGNALS..."
                        value={songSearch}
                        onChange={(e) => setSongSearch(e.target.value)}
                        className={`${inputClass} pl-10 py-2.5 text-xs`}
                      />
                    </div>

                    <div className="bg-zinc-950 border border-white/5 rounded overflow-hidden max-h-56 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
                      {songs.length === 0 ? (
                        <div className="py-12 text-center text-zinc-700 italic text-[10px] font-black uppercase">NO SIGNALS AVAILABLE</div>
                      ) : filteredSongs.length === 0 ? (
                        <div className="py-8 text-center text-zinc-700 italic text-[10px] font-black uppercase">NO MATCHES IN STREAM</div>
                      ) : (
                        <div className="divide-y divide-white/[0.03]">
                          {filteredSongs.map((song) => {
                            const isChecked = selectedSongs.includes(song._id);
                            const artistName = typeof song.artist === 'string' ? song.artist : song.artist?.name || 'UNKNOWN';
                            return (
                              <div
                                key={song._id}
                                onClick={() => handleSongToggle(song._id)}
                                className={`flex items-center gap-4 px-4 py-3 cursor-pointer transition-colors ${isChecked ? 'bg-emerald-500/5' : 'hover:bg-white/[0.02]'}`}
                              >
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isChecked ? 'bg-emerald-500 border-emerald-500' : 'bg-zinc-900 border-white/10'}`}>
                                  {isChecked && <CheckSquare className="w-3 h-3 text-black" />}
                                </div>
                                <div className="w-10 h-10 rounded bg-zinc-900 border border-white/5 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                  {song.coverArt ? (
                                    <img src={song.coverArt} alt={song.name} className="w-full h-full object-cover opacity-60" />
                                  ) : (
                                    <Music className="w-4 h-4 text-zinc-800" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-black text-white uppercase italic tracking-tight truncate">{song.name}</p>
                                  <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest truncate">{artistName}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-4 pt-6 border-t border-white/5">
                  <button
                    type="button"
                    onClick={handleCloseDialog}
                    disabled={submitting}
                    className="px-6 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest italic hover:text-white transition-colors"
                  >
                    Abort
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-3 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest rounded hover:bg-emerald-400 transition-all shadow-xl italic flex items-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      selectedPlaylist ? 'SYNC CHANGES' : 'INITIALIZE REPOSITORY'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={!!playlistToDelete}
        title="Purge Repository"
        message="Are you sure you want to purge this playlist from the system? This action cannot be reversed."
        confirmLabel="PURGE_SEQUENCE"
        cancelLabel="ABORT"
        onConfirm={confirmDelete}
        onCancel={() => setPlaylistToDelete(null)}
      />
    </div>
  );
};

export default PlaylistManagement;
