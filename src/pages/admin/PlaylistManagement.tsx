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

  if (loading && playlists.length === 0) {
    return <Preloader isVisible={true} text="Loading playlists..." />;
  }

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Playlist Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Create and manage curated playlists for users</p>
        </div>
        <button
          onClick={() => handleOpenDialog()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create Playlist
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Playlists', value: playlists.length, icon: ListMusic, color: 'bg-green-50 text-green-600' },
          { label: 'Total Songs', value: totalSongs, icon: Music, color: 'bg-blue-50 text-blue-600' },
          { label: 'Predefined', value: recommendedCount, icon: Star, color: 'bg-purple-50 text-purple-600' },
          { label: 'Avg Songs', value: avgSongs, icon: CheckSquare, color: 'bg-amber-50 text-amber-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search playlists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* View toggle + count */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">{filteredPlaylists.length} playlist{filteredPlaylists.length !== 1 ? 's' : ''}</span>
            <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          <X className="w-4 h-4 flex-shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Playlists */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filteredPlaylists.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <ListMusic className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-700 font-medium">No playlists found</p>
            <p className="text-sm text-gray-400 mt-1">
              {searchTerm ? 'Try adjusting your search.' : 'Create your first playlist to get started.'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => handleOpenDialog()}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Playlist
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 p-5">
            {filteredPlaylists.map((playlist) => (
              <motion.div
                key={playlist._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md hover:border-green-100 transition-all"
              >
                {/* Cover / Icon */}
                <div className="relative aspect-square bg-gradient-to-br from-green-50 to-emerald-100 overflow-hidden">
                  {playlist.artwork?.full || playlist.artwork?.thumbnail ? (
                    <img
                      src={playlist.artwork.full || playlist.artwork.thumbnail}
                      alt={playlist.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ListMusic className="w-14 h-14 text-green-300" />
                    </div>
                  )}

                  {/* Predefined badge */}
                  {playlist.isRecommended && (
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-0.5 bg-black/50 backdrop-blur-sm text-white text-xs rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Predefined
                      </span>
                    </div>
                  )}

                  {/* Actions menu */}
                  <div className="absolute top-2 left-2" ref={openMenuId === playlist._id ? menuRef : undefined}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === playlist._id ? null : playlist._id); }}
                      className="w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>
                    <AnimatePresence>
                      {openMenuId === playlist._id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -4 }}
                          transition={{ duration: 0.1 }}
                          className="absolute left-0 top-9 w-36 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-20"
                        >
                          <button
                            onClick={() => handleOpenDialog(playlist)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5 text-gray-400" />
                            Edit
                          </button>
                          <button
                            onClick={() => { setPlaylistToDelete(playlist._id); setOpenMenuId(null); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 truncate">{playlist.name}</h3>
                  {playlist.description && (
                    <p className="text-sm text-gray-500 truncate mt-0.5">{playlist.description}</p>
                  )}
                  <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-50 text-xs text-gray-400">
                    <Music className="w-3.5 h-3.5" />
                    <span>{playlist.songs?.length || 0} song{(playlist.songs?.length || 0) !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* List view */
          <div className="divide-y divide-gray-50">
            <div className="hidden sm:grid grid-cols-12 px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide bg-gray-50/60">
              <div className="col-span-5">Playlist</div>
              <div className="col-span-4">Description</div>
              <div className="col-span-1 text-center">Songs</div>
              <div className="col-span-1 text-center">Type</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>
            {filteredPlaylists.map((playlist) => (
              <motion.div
                key={playlist._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-12 items-center px-5 py-3.5 hover:bg-gray-50/60 transition-colors"
              >
                <div className="col-span-7 sm:col-span-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-green-50 to-emerald-100 flex-shrink-0 flex items-center justify-center">
                    {playlist.artwork?.thumbnail ? (
                      <img src={playlist.artwork.thumbnail} alt={playlist.name} className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <ListMusic className="w-5 h-5 text-green-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate text-sm">{playlist.name}</p>
                  </div>
                </div>
                <div className="hidden sm:block col-span-4 text-sm text-gray-500 truncate pr-4">
                  {playlist.description || <span className="text-gray-300">—</span>}
                </div>
                <div className="hidden sm:flex col-span-1 justify-center">
                  <span className="text-sm text-gray-500">{playlist.songs?.length || 0}</span>
                </div>
                <div className="hidden sm:flex col-span-1 justify-center">
                  {playlist.isRecommended ? (
                    <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full">Predefined</span>
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </div>
                <div className="col-span-5 sm:col-span-1 flex items-center justify-end gap-1">
                  <button
                    onClick={() => handleOpenDialog(playlist)}
                    className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPlaylistToDelete(playlist._id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <AnimatePresence>
        {isDialogOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {selectedPlaylist ? 'Edit Playlist' : 'Create Playlist'}
                  </h2>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {selectedPlaylist ? 'Update playlist details below' : 'Fill in the playlist details below'}
                  </p>
                </div>
                <button
                  onClick={handleCloseDialog}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Playlist Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Chill Vibes"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="Brief description of this playlist..."
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Songs */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium text-gray-700">Select Songs</label>
                    <span className="text-xs text-gray-400">
                      {selectedSongs.length} selected
                    </span>
                  </div>

                  {/* Song search */}
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                    <input
                      type="text"
                      placeholder="Search songs..."
                      value={songSearch}
                      onChange={(e) => setSongSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div className="border border-gray-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                    {songs.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                        <Music className="w-8 h-8 mb-2 text-gray-300" />
                        <p className="text-sm">No songs available</p>
                      </div>
                    ) : filteredSongs.length === 0 ? (
                      <div className="py-6 text-center text-sm text-gray-400">No songs match your search</div>
                    ) : (
                      <div className="divide-y divide-gray-50">
                        {filteredSongs.map((song) => {
                          const isChecked = selectedSongs.includes(song._id);
                          const artistName = typeof song.artist === 'string' ? song.artist : song.artist?.name || 'Unknown';
                          return (
                            <label
                              key={song._id}
                              className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${isChecked ? 'bg-green-50' : 'hover:bg-gray-50'}`}
                            >
                              <div className={`flex-shrink-0 text-${isChecked ? 'green-500' : 'gray-300'}`}>
                                {isChecked
                                  ? <CheckSquare className="w-4 h-4 text-green-500" />
                                  : <Square className="w-4 h-4 text-gray-300" />
                                }
                              </div>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleSongToggle(song._id)}
                                className="sr-only"
                              />
                              {song.coverArt ? (
                                <img src={song.coverArt} alt={song.name}
                                  className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                              ) : (
                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                  <Music className="w-4 h-4 text-gray-300" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{song.name}</p>
                                <p className="text-xs text-gray-400 truncate">{artistName}</p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Selected pills */}
                  {selectedSongs.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {selectedSongs.slice(0, 6).map((id) => (
                        <span key={id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full">
                          {getSongName(id)}
                          <button type="button" onClick={() => handleSongToggle(id)} className="hover:text-green-900">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                      {selectedSongs.length > 6 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                          +{selectedSongs.length - 6} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleCloseDialog}
                    disabled={submitting}
                    className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 shadow-sm"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {selectedPlaylist ? 'Saving...' : 'Creating...'}
                      </>
                    ) : (
                      selectedPlaylist ? 'Save Changes' : 'Create Playlist'
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
        title="Delete Playlist"
        message="Are you sure you want to delete this playlist? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setPlaylistToDelete(null)}
      />
    </div>
  );
};

export default PlaylistManagement;
