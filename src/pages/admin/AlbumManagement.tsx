import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Preloader from '../../components/ui/Preloader';
import { toast } from 'react-hot-toast';
import albumService, { Album, CreateAlbumData } from '../../services/albumService';
import artistService, { Artist } from '../../services/artistService';
import genreService, { Genre } from '../../services/genreService';
import FileUpload from '../../components/ui/FileUpload';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import {
  Plus, Edit, Trash2, Disc, Search, X, MoreHorizontal,
  Music, Calendar, User, Tag, LayoutGrid, List, ChevronDown, Loader2
} from 'lucide-react';

const AlbumManagement: React.FC = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [albumToDelete, setAlbumToDelete] = useState<string | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [genreFilter, setGenreFilter] = useState<string>('all');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<CreateAlbumData>>({
    name: '',
    artist: '',
    releaseDate: new Date().toISOString().split('T')[0],
    genre: '',
    coverArt: '',
    songs: [],
  });
  const [coverArtFile, setCoverArtFile] = useState<File | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAlbums();
    fetchArtists();
    fetchGenres();
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

  const fetchAlbums = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await albumService.getAllAlbums();
      setAlbums(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch albums';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchArtists = async () => {
    try {
      const data = await artistService.getAllArtists();
      setArtists(data);
    } catch (err) {
      console.error('Failed to fetch artists:', err);
    }
  };

  const fetchGenres = async () => {
    try {
      const data = await genreService.getAllGenres();
      setGenres(data);
    } catch (err) {
      console.error('Failed to fetch genres:', err);
    }
  };

  const handleOpenDialog = (album?: Album) => {
    if (album) {
      setSelectedAlbum(album);
      setFormData({
        name: album.name,
        artist: typeof album.artist === 'string' ? album.artist : album.artist._id,
        releaseDate: (() => {
          if (!album.releaseDate) return '';
          try {
            const d = new Date(album.releaseDate);
            return !isNaN(d.getTime()) ? d.toISOString().split('T')[0] : '';
          } catch { return ''; }
        })(),
        genre: typeof album.genre === 'string' ? album.genre : album.genre?._id || '',
        coverArt: album.coverArt,
        songs: album.songs || [],
      });
      setCoverArtFile(null);
    } else {
      setSelectedAlbum(null);
      setFormData({
        name: '',
        artist: '',
        releaseDate: new Date().toISOString().split('T')[0],
        genre: '',
        coverArt: '',
        songs: [],
      });
      setCoverArtFile(null);
    }
    setIsDialogOpen(true);
    setOpenMenuId(null);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedAlbum(null);
    setFormData({
      name: '',
      artist: '',
      releaseDate: new Date().toISOString().split('T')[0],
      genre: '',
      coverArt: '',
      songs: [],
    });
    setCoverArtFile(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCoverArtSelect = (file: File) => {
    setCoverArtFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (selectedAlbum) {
        let coverArtUrl = formData.coverArt || '';
        if (coverArtFile) {
          coverArtUrl = await albumService.uploadCoverArt(coverArtFile);
        }
        await albumService.adminUpdateAlbum(selectedAlbum._id, { ...formData, coverArt: coverArtUrl });
        toast.success('Album updated successfully');
      } else {
        if (coverArtFile) {
          const { coverArt, ...rest } = formData as CreateAlbumData;
          await albumService.createAlbumWithImage(rest, coverArtFile);
        } else {
          await albumService.createAlbum(formData as CreateAlbumData);
        }
        toast.success('Album created successfully');
      }
      handleCloseDialog();
      fetchAlbums();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save album';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!albumToDelete) return;
    try {
      await albumService.deleteAlbum(albumToDelete);
      toast.success('Album deleted successfully');
      fetchAlbums();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete album';
      toast.error(errorMessage);
    } finally {
      setAlbumToDelete(null);
    }
  };

  const getArtistDisplayName = (artist: string | { _id: string; name: string; firstName?: string; lastName?: string }) => {
    if (typeof artist === 'string') {
      const found = artists.find((a) => a._id === artist);
      return found ? (found.name || `${found.firstName || ''} ${found.lastName || ''}`.trim()) : artist;
    }
    return artist.name || `${artist.firstName || ''} ${artist.lastName || ''}`.trim() || 'Unknown Artist';
  };

  const getGenreDisplayName = (genre: string | { _id: string; name: string } | null | undefined) => {
    if (!genre) return null;
    if (typeof genre === 'string') {
      const found = genres.find((g) => g._id === genre);
      return found?.name || null;
    }
    return (genre as any).name || null;
  };

  const filteredAlbums = albums.filter((album) => {
    const albumName = album.name.toLowerCase();
    const artistName = typeof album.artist === 'string' ? '' : (album.artist as any)?.name || '';
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = albumName.includes(searchLower) || artistName.toLowerCase().includes(searchLower);
    const albumGenreId = typeof album.genre === 'string' ? album.genre : (album.genre as any)?._id || '';
    const matchesGenre = genreFilter === 'all' || albumGenreId === genreFilter;
    return matchesSearch && matchesGenre;
  });

  const totalTracks = albums.reduce((sum, a) => sum + (a.songs?.length || 0), 0);
  const uniqueArtists = new Set(albums.map((a) => (typeof a.artist === 'string' ? a.artist : (a.artist as any)?._id))).size;
  const avgTracks = albums.length > 0 ? Math.round(totalTracks / albums.length) : 0;

  const coverPreviewSrc = coverArtFile
    ? URL.createObjectURL(coverArtFile)
    : formData.coverArt || undefined;

  if (loading && albums.length === 0) {
    return <Preloader isVisible={true} text="Loading albums..." />;
  }

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Album Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage all albums in your platform</p>
        </div>
        <button
          onClick={() => handleOpenDialog()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add New Album
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Albums', value: albums.length, icon: Disc, color: 'bg-green-50 text-green-600' },
          { label: 'Total Tracks', value: totalTracks, icon: Music, color: 'bg-blue-50 text-blue-600' },
          { label: 'Artists', value: uniqueArtists, icon: User, color: 'bg-purple-50 text-purple-600' },
          { label: 'Avg Tracks', value: avgTracks, icon: Tag, color: 'bg-amber-50 text-amber-600' },
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
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search albums or artists..."
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

            {/* Genre Filter */}
            <div className="relative">
              <select
                value={genreFilter}
                onChange={(e) => setGenreFilter(e.target.value)}
                className="pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white appearance-none cursor-pointer"
              >
                <option value="all">All Genres</option>
                {genres.map((g) => (
                  <option key={g._id} value={g._id}>{g.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* View toggle + count */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">{filteredAlbums.length} album{filteredAlbums.length !== 1 ? 's' : ''}</span>
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

      {/* Albums */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filteredAlbums.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Disc className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-700 font-medium">No albums found</p>
            <p className="text-sm text-gray-400 mt-1">
              {searchTerm || genreFilter !== 'all' ? 'Try adjusting your search or filters.' : 'Create your first album to get started.'}
            </p>
            {!searchTerm && genreFilter === 'all' && (
              <button
                onClick={() => handleOpenDialog()}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Album
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 p-5">
            {filteredAlbums.map((album) => {
              const artistName = getArtistDisplayName(album.artist);
              const genreName = getGenreDisplayName(album.genre);
              const trackCount = album.songs?.length || 0;
              const releaseYear = album.releaseDate ? new Date(album.releaseDate).getFullYear() : null;

              return (
                <motion.div
                  key={album._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md hover:border-green-100 transition-all"
                >
                  {/* Cover Art */}
                  <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    {album.coverArt ? (
                      <img
                        src={album.coverArt}
                        alt={album.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Disc className="w-12 h-12 text-gray-300" />
                      </div>
                    )}

                    {/* Genre badge */}
                    {genreName && (
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-0.5 bg-black/50 backdrop-blur-sm text-white text-xs rounded-full">
                          {genreName}
                        </span>
                      </div>
                    )}

                    {/* Actions menu */}
                    <div className="absolute top-2 left-2" ref={openMenuId === album._id ? menuRef : undefined}>
                      <button
                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === album._id ? null : album._id); }}
                        className="w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </button>
                      <AnimatePresence>
                        {openMenuId === album._id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -4 }}
                            transition={{ duration: 0.1 }}
                            className="absolute left-0 top-9 w-36 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-20"
                          >
                            <button
                              onClick={() => handleOpenDialog(album)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5 text-gray-400" />
                              Edit
                            </button>
                            <button
                              onClick={() => { setAlbumToDelete(album._id); setOpenMenuId(null); }}
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
                    <h3 className="font-semibold text-gray-900 truncate">{album.name}</h3>
                    <p className="text-sm text-gray-500 truncate mt-0.5">{artistName}</p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Music className="w-3.5 h-3.5" />
                        <span>{trackCount} track{trackCount !== 1 ? 's' : ''}</span>
                      </div>
                      {releaseYear && (
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{releaseYear}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* List view */
          <div className="divide-y divide-gray-50">
            <div className="hidden sm:grid grid-cols-12 px-5 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide bg-gray-50/60">
              <div className="col-span-5">Album</div>
              <div className="col-span-3">Artist</div>
              <div className="col-span-2">Genre</div>
              <div className="col-span-1 text-center">Tracks</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>
            {filteredAlbums.map((album) => {
              const artistName = getArtistDisplayName(album.artist);
              const genreName = getGenreDisplayName(album.genre);
              const trackCount = album.songs?.length || 0;

              return (
                <motion.div
                  key={album._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-12 items-center px-5 py-3.5 hover:bg-gray-50/60 transition-colors"
                >
                  <div className="col-span-7 sm:col-span-5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0">
                      {album.coverArt ? (
                        <img src={album.coverArt} alt={album.name} className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Disc className="w-5 h-5 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate text-sm">{album.name}</p>
                      {album.releaseDate && (
                        <p className="text-xs text-gray-400">{new Date(album.releaseDate).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                  <div className="hidden sm:block col-span-3 text-sm text-gray-600 truncate pr-4">{artistName}</div>
                  <div className="hidden sm:block col-span-2">
                    {genreName ? (
                      <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full">{genreName}</span>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </div>
                  <div className="hidden sm:flex col-span-1 justify-center">
                    <span className="text-sm text-gray-500">{trackCount}</span>
                  </div>
                  <div className="col-span-5 sm:col-span-1 flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleOpenDialog(album)}
                      className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setAlbumToDelete(album._id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
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
              className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {selectedAlbum ? 'Edit Album' : 'Add New Album'}
                  </h2>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {selectedAlbum ? 'Update album details below' : 'Fill in the album details below'}
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
                {/* Cover Art */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cover Art</label>
                  {coverPreviewSrc && (
                    <div className="mb-3 flex items-center gap-3">
                      <img
                        src={coverPreviewSrc}
                        alt="Cover preview"
                        className="w-20 h-20 object-cover rounded-xl border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => { setCoverArtFile(null); setFormData((prev) => ({ ...prev, coverArt: '' })); }}
                        className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                      >
                        <X className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  )}
                  <FileUpload
                    label="Upload Cover Art"
                    currentFile={coverPreviewSrc}
                    onFileSelect={handleCoverArtSelect}
                    onFileRemove={() => {
                      setCoverArtFile(null);
                      setFormData((prev) => ({ ...prev, coverArt: '' }));
                    }}
                  />
                </div>

                {/* Album Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Album Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Midnight Sessions"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                {/* Artist */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Artist <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="artist"
                      value={formData.artist}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white appearance-none cursor-pointer"
                    >
                      <option value="">Select an artist</option>
                      {artists.map((artist) => (
                        <option key={artist._id} value={artist._id}>
                          {artist.name || `${artist.firstName || ''} ${artist.lastName || ''}`.trim() || artist._id}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Genre + Release Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Genre</label>
                    <div className="relative">
                      <select
                        name="genre"
                        value={formData.genre}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white appearance-none cursor-pointer"
                      >
                        <option value="">Select genre</option>
                        {genres.map((genre) => (
                          <option key={genre._id} value={genre._id}>{genre.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Release Date</label>
                    <input
                      type="date"
                      name="releaseDate"
                      value={formData.releaseDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
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
                        {selectedAlbum ? 'Saving...' : 'Creating...'}
                      </>
                    ) : (
                      selectedAlbum ? 'Save Changes' : 'Create Album'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={!!albumToDelete}
        title="Delete Album"
        message="Are you sure you want to delete this album? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setAlbumToDelete(null)}
      />
    </div>
  );
};

export default AlbumManagement;
