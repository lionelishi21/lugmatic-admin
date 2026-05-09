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

const card = 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] rounded-lg';

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
      let coverArtUrl = formData.coverArt || '';

      if (coverArtFile) {
        toast.loading('Uploading cover art to S3...', { id: 'album-upload' });
        const presign = await albumService.getPresignedUrl('cover-art', coverArtFile.name, coverArtFile.type);
        await albumService.uploadToS3(presign.uploadUrl, coverArtFile, coverArtFile.type);
        coverArtUrl = presign.publicUrl;
        toast.loading('Saving album details...', { id: 'album-upload' });
      }

      if (selectedAlbum) {
        await albumService.adminUpdateAlbum(selectedAlbum._id, { 
          ...formData, 
          coverArt: coverArtUrl,
        });
        toast.success('Album updated successfully', { id: 'album-upload' });
      } else {
        await albumService.createAlbum({ 
          ...formData as CreateAlbumData, 
          coverArt: coverArtUrl 
        });
        toast.success('Album created successfully', { id: 'album-upload' });
      }
      handleCloseDialog();
      fetchAlbums();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save album';
      toast.error(errorMessage, { id: 'album-upload' });
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
    <div className="max-w-5xl mx-auto pb-16 space-y-6">

      {/* Header */}
      <div className={`${card} p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Disc className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">Album Management</h1>
            <p className="text-sm text-zinc-500 mt-0.5">Manage all albums in your platform</p>
          </div>
        </div>
        <button
          onClick={() => handleOpenDialog()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Album
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Albums', value: albums.length, icon: Disc, color: 'text-emerald-500', bgColor: 'bg-emerald-50 dark:bg-emerald-500/10' },
          { label: 'Total Tracks', value: totalTracks, icon: Music, color: 'text-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-500/10' },
          { label: 'Artists', value: uniqueArtists, icon: User, color: 'text-purple-500', bgColor: 'bg-purple-50 dark:bg-purple-500/10' },
          { label: 'Avg Tracks', value: avgTracks, icon: Tag, color: 'text-amber-500', bgColor: 'bg-amber-50 dark:bg-amber-500/10' },
        ].map(({ label, value, icon: Icon, color, bgColor }) => (
          <div key={label} className={`${card} p-5`}>
            <div className={`w-9 h-9 rounded ${bgColor} flex items-center justify-center mb-4`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">{label}</p>
            <p className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">{value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className={`${card} p-4`}>
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search albums or artists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded focus:outline-none focus:border-emerald-500 transition-all text-zinc-900 dark:text-white"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Genre Filter */}
            <div className="relative">
              <select
                value={genreFilter}
                onChange={(e) => setGenreFilter(e.target.value)}
                className="pl-3 pr-8 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer text-zinc-900 dark:text-white font-medium"
              >
                <option value="all">All Genres</option>
                {genres.map((g) => (
                  <option key={g._id} value={g._id}>{g.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
            </div>
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{filteredAlbums.length} albums</span>
            <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-zinc-700 text-emerald-500 shadow-sm' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded transition-all ${viewMode === 'list' ? 'bg-white dark:bg-zinc-700 text-emerald-500 shadow-sm' : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 px-4 py-3 rounded-lg text-sm font-medium animate-in fade-in slide-in-from-top-2">
          <XCircle className="w-4 h-4 flex-shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto opacity-50 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Albums Content */}
      {filteredAlbums.length === 0 ? (
        <div className={`${card} py-20 flex flex-col items-center justify-center text-center`}>
          <div className="w-14 h-14 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
            <Disc className="w-7 h-7 text-zinc-400" />
          </div>
          <p className="text-zinc-900 dark:text-white font-bold uppercase tracking-tight">No albums found</p>
          <p className="text-sm text-zinc-500 mt-1">
            {searchTerm || genreFilter !== 'all' ? 'Try adjusting your search or filters.' : 'Create your first album to get started.'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredAlbums.map((album) => {
            const artistName = getArtistDisplayName(album.artist);
            const genreName = getGenreDisplayName(album.genre);
            const trackCount = album.songs?.length || 0;
            const releaseYear = album.releaseDate ? new Date(album.releaseDate).getFullYear() : null;

            return (
              <motion.div
                key={album._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${card} group overflow-hidden hover:border-emerald-500/30 transition-all`}
              >
                <div className="relative aspect-square bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  {album.coverArt ? (
                    <img
                      src={album.coverArt}
                      alt={album.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Disc className="w-10 h-10 text-zinc-300 dark:text-zinc-700" />
                    </div>
                  )}

                  {genreName && (
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-0.5 bg-black/40 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-wider rounded">
                        {genreName}
                      </span>
                    </div>
                  )}

                  <div className="absolute top-2 left-2" ref={openMenuId === album._id ? menuRef : undefined}>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === album._id ? null : album._id); }}
                      className="w-7 h-7 rounded bg-black/40 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-black/60"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    <AnimatePresence>
                      {openMenuId === album._id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -4 }}
                          className="absolute left-0 top-9 w-32 bg-white dark:bg-zinc-800 rounded shadow-xl border border-zinc-100 dark:border-white/10 overflow-hidden z-20"
                        >
                          <button
                            type="button"
                            onClick={() => handleOpenDialog(album)}
                            className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => { setAlbumToDelete(album._id); setOpenMenuId(null); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white truncate uppercase tracking-tight">{album.name}</h3>
                  <p className="text-[11px] font-medium text-zinc-500 truncate mt-0.5">{artistName}</p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-100 dark:border-white/10">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wide">
                      <Music className="w-3 h-3" />
                      <span>{trackCount} tracks</span>
                    </div>
                    {releaseYear && (
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">{releaseYear}</span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className={card}>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-white/[0.04] bg-zinc-50/50 dark:bg-zinc-800/20">
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-zinc-500">Album</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-zinc-500">Artist</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-zinc-500">Genre</th>
                  <th className="px-6 py-4 text-center text-[11px] font-bold uppercase tracking-widest text-zinc-500">Tracks</th>
                  <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-widest text-zinc-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-white/[0.04]">
                {filteredAlbums.map((album) => {
                  const artistName = getArtistDisplayName(album.artist);
                  const genreName = getGenreDisplayName(album.genre);
                  const trackCount = album.songs?.length || 0;

                  return (
                    <tr key={album._id} className="hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 overflow-hidden flex-shrink-0">
                            {album.coverArt ? (
                              <img src={album.coverArt} alt={album.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                <Disc className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-zinc-900 dark:text-white truncate uppercase tracking-tight">{album.name}</p>
                            <p className="text-[10px] font-medium text-zinc-400">
                              {album.releaseDate ? new Date(album.releaseDate).toLocaleDateString() : 'No date'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-zinc-900 dark:text-white truncate max-w-[200px]">{artistName}</td>
                      <td className="px-6 py-4">
                        {genreName ? (
                          <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wide border border-emerald-200 dark:border-emerald-500/20 rounded">
                            {genreName}
                          </span>
                        ) : (
                          <span className="text-zinc-300 dark:text-zinc-700 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center text-sm font-bold text-zinc-900 dark:text-white tabular-nums">{trackCount}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenDialog(album)}
                            className="p-2 text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded transition-all"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setAlbumToDelete(album._id)}
                            className="p-2 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dialog */}
      <AnimatePresence>
        {isDialogOpen && (
          <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 12 }}
              className="bg-white dark:bg-zinc-900 rounded-lg shadow-2xl w-full max-w-lg overflow-hidden border border-zinc-200 dark:border-white/10"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 dark:border-white/[0.06]">
                <div>
                  <h2 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-tight">
                    {selectedAlbum ? 'Edit Album' : 'Create Album'}
                  </h2>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">Album Details</p>
                </div>
                <button onClick={handleCloseDialog} className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Cover Art</label>
                  <FileUpload
                    label="Upload Artwork"
                    currentFile={coverPreviewSrc}
                    onFileSelect={handleCoverArtSelect}
                    onFileRemove={() => { setCoverArtFile(null); setFormData(p => ({ ...p, coverArt: '' })); }}
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">Album Name</label>
                    <input
                      type="text" name="name" value={formData.name} onChange={handleInputChange} required
                      className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded focus:outline-none focus:border-emerald-500 text-zinc-900 dark:text-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">Artist</label>
                    <div className="relative">
                      <select
                        name="artist" value={formData.artist} onChange={handleInputChange} required
                        className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded focus:outline-none focus:border-emerald-500 appearance-none text-zinc-900 dark:text-white font-medium"
                      >
                        <option value="">Select artist</option>
                        {artists.map(a => (
                          <option key={a._id} value={a._id}>{a.name || `${a.firstName || ''} ${a.lastName || ''}`.trim()}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">Genre</label>
                      <div className="relative">
                        <select
                          name="genre" value={formData.genre} onChange={handleInputChange}
                          className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded focus:outline-none focus:border-emerald-500 appearance-none text-zinc-900 dark:text-white font-medium"
                        >
                          <option value="">No genre</option>
                          {genres.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1.5">Release Date</label>
                      <input
                        type="date" name="releaseDate" value={formData.releaseDate} onChange={handleInputChange}
                        className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded focus:outline-none focus:border-emerald-500 text-zinc-900 dark:text-white font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button" onClick={handleCloseDialog}
                    className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit" disabled={submitting}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest rounded hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-lg shadow-emerald-500/20"
                  >
                    {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {selectedAlbum ? 'Save Album' : 'Create Album'}
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
        message="This will permanently delete the album. Tracks will not be deleted but will become unassigned."
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setAlbumToDelete(null)}
      />
    </div>
  );
};

export default AlbumManagement;

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
