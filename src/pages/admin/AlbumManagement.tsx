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

  const cardClass = "bg-zinc-900 border border-white/[0.06] rounded-lg p-6 shadow-2xl relative overflow-hidden group";
  const labelClass = "text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1 italic";
  const valueClass = "text-sm font-black text-white italic uppercase tracking-tight";
  const inputClass = "w-full bg-zinc-950 border border-white/10 rounded px-4 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-emerald-500/50 transition-all font-bold italic uppercase tracking-tight";

  if (loading && albums.length === 0) {
    return <Preloader isVisible={true} text="Synchronizing repositories..." />;
  }

  return (
    <div className="max-w-7xl mx-auto pb-24 space-y-8 px-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-1.5 italic">Sonic Repository Protocol</p>
           <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
             Album Management
           </h1>
           <p className="text-xs text-zinc-500 mt-1 uppercase font-bold tracking-widest">
             Manage and categorize full-length sonic deployments across the network.
           </p>
        </div>
        <button
          onClick={() => handleOpenDialog()}
          className="px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded hover:bg-emerald-400 transition-all shadow-xl italic flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Initialize New Album
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Deployments', value: albums.length, icon: Disc, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Signal Units', value: totalTracks, icon: Music, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Active Artists', value: uniqueArtists, icon: User, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { label: 'Density Ratio', value: avgTracks, icon: Tag, color: 'text-amber-500', bg: 'bg-amber-500/10' },
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
          <div className="flex flex-col md:flex-row gap-4 flex-1 w-full md:w-auto">
            {/* Search */}
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

            {/* Genre Filter */}
            <div className="relative">
              <select
                value={genreFilter}
                onChange={(e) => setGenreFilter(e.target.value)}
                className={`${inputClass} py-2.5 pr-10 min-w-[160px] appearance-none cursor-pointer`}
              >
                <option value="all">ALL FREQUENCIES</option>
                {genres.map((g) => (
                  <option key={g._id} value={g._id}>{g.name.toUpperCase()}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic">{filteredAlbums.length} NODES DETECTED</span>
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

      {/* Albums Content */}
      <div className="min-h-[400px]">
        {filteredAlbums.length === 0 ? (
          <div className={`${cardClass} flex flex-col items-center justify-center py-24 text-center border-dashed`}>
            <div className="w-16 h-16 rounded bg-zinc-950 border border-white/10 flex items-center justify-center mb-6">
              <Disc className="w-8 h-8 text-zinc-800" />
            </div>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">NO ALBUM DATA MATCHES CURRENT FILTERS</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                  className={`${cardClass} p-0 flex flex-col hover:border-emerald-500/30 transition-all cursor-pointer overflow-hidden`}
                >
                  {/* Cover / Icon */}
                  <div className="relative aspect-square bg-zinc-950 overflow-hidden">
                    {album.coverArt ? (
                      <img
                        src={album.coverArt}
                        alt={album.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Disc className="w-16 h-16 text-zinc-900 group-hover:text-emerald-500/20 transition-colors" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80" />

                    {/* Badges */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                      {genreName && (
                        <span className="px-2 py-1 bg-zinc-900/80 backdrop-blur-md text-emerald-500 text-[9px] font-black uppercase tracking-widest rounded border border-white/10 italic">
                          {genreName}
                        </span>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="absolute bottom-4 right-4 flex gap-2 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleOpenDialog(album); }}
                        className="w-10 h-10 bg-white text-black rounded flex items-center justify-center hover:bg-emerald-400 transition-all shadow-xl"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setAlbumToDelete(album._id); }}
                        className="w-10 h-10 bg-zinc-900/80 backdrop-blur-md text-rose-500 border border-white/10 rounded flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-xl"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-5">
                    <h3 className="text-sm font-black text-white uppercase italic tracking-tight truncate group-hover:text-emerald-500 transition-colors">{album.name}</h3>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest truncate mt-1.5">{artistName}</p>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2 text-zinc-500 italic">
                         <Music className="w-3 h-3 text-emerald-500" />
                         <span className="text-[10px] font-black uppercase tracking-widest">{trackCount} UNITS</span>
                      </div>
                      <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.2em] italic">{releaseYear}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* List view */
          <div className={`${cardClass} p-0 overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-zinc-800/50 border-b border-white/[0.06]">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] italic">Album Identity</th>
                    <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] italic">Artist Origin</th>
                    <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] italic">Frequency</th>
                    <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] italic text-center">Density</th>
                    <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] italic text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {filteredAlbums.map((album) => {
                    const artistName = getArtistDisplayName(album.artist);
                    const genreName = getGenreDisplayName(album.genre);
                    const trackCount = album.songs?.length || 0;

                    return (
                      <tr key={album._id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded bg-zinc-950 border border-white/10 flex-shrink-0 overflow-hidden flex items-center justify-center">
                              {album.coverArt ? (
                                <img src={album.coverArt} alt={album.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100" />
                              ) : (
                                <Disc className="w-6 h-6 text-zinc-800" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-black text-white uppercase italic tracking-tight">{album.name}</p>
                              <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-0.5">
                                {album.releaseDate ? new Date(album.releaseDate).toLocaleDateString() : 'NO DATE'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                           <p className="text-xs font-black text-zinc-500 uppercase italic truncate max-w-[200px]">{artistName}</p>
                        </td>
                        <td className="px-6 py-5">
                          {genreName ? (
                            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest rounded border border-emerald-500/20 italic">
                              {genreName.toUpperCase()}
                            </span>
                          ) : (
                            <span className="text-[9px] font-black text-zinc-800 uppercase tracking-widest italic">—</span>
                          )}
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="text-xs font-black text-white uppercase italic tabular-nums">{trackCount} UNITS</span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => handleOpenDialog(album)}
                              className="w-9 h-9 bg-zinc-800 text-white rounded border border-white/5 flex items-center justify-center hover:bg-emerald-500 hover:text-black transition-all"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setAlbumToDelete(album._id)}
                              className="w-9 h-9 bg-zinc-800 text-rose-500 rounded border border-white/5 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all"
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
      </div>

      {/* Dialog */}
      <AnimatePresence>
        {isDialogOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-zinc-900 border border-white/10 rounded-lg shadow-2xl w-full max-w-lg overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[60px] rounded-full" />
              
              {/* Modal Header */}
              <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 relative bg-zinc-800/30">
                <div>
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-1 italic">Deployment Protocol</p>
                   <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">
                     {selectedAlbum ? 'Modify Repository' : 'Initialize Repository'}
                   </h2>
                </div>
                <button
                  onClick={handleCloseDialog}
                  className="w-10 h-10 bg-zinc-950 border border-white/10 rounded flex items-center justify-center text-zinc-500 hover:text-emerald-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6 relative">
                <div>
                  <label className={labelClass}>Deployment Cover Artwork</label>
                  <div className="bg-zinc-950 border border-white/10 rounded-lg p-1">
                    <FileUpload
                      label="UPLOAD ARTWORK"
                      currentFile={coverPreviewSrc}
                      onFileSelect={handleCoverArtSelect}
                      onFileRemove={() => { setCoverArtFile(null); setFormData(p => ({ ...p, coverArt: '' })); }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className={labelClass}>Deployment Designation <span className="text-emerald-500">*</span></label>
                    <input
                      type="text" name="name" value={formData.name} onChange={handleInputChange} required
                      placeholder="ENTER DESIGNATION..."
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Artist Origin <span className="text-emerald-500">*</span></label>
                    <div className="relative">
                      <select
                        name="artist" value={formData.artist} onChange={handleInputChange} required
                        className={`${inputClass} appearance-none cursor-pointer`}
                      >
                        <option value="">SELECT ORIGIN...</option>
                        {artists.map(a => (
                          <option key={a._id} value={a._id}>{ (a.name || `${a.firstName || ''} ${a.lastName || ''}`.trim()).toUpperCase() }</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className={labelClass}>Frequency</label>
                      <div className="relative">
                        <select
                          name="genre" value={formData.genre} onChange={handleInputChange}
                          className={`${inputClass} appearance-none cursor-pointer`}
                        >
                          <option value="">UNCATEGORIZED</option>
                          {genres.map(g => <option key={g._id} value={g._id}>{g.name.toUpperCase()}</option>)}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Release Cycle</label>
                      <input
                        type="date" name="releaseDate" value={formData.releaseDate} onChange={handleInputChange}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-white/5">
                  <button
                    type="button" onClick={handleCloseDialog}
                    className="px-6 py-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest italic hover:text-white transition-colors"
                  >
                    Abort
                  </button>
                  <button
                    type="submit" disabled={submitting}
                    className="px-8 py-3 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest rounded hover:bg-emerald-400 transition-all shadow-xl italic flex items-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (selectedAlbum ? 'SYNC REPOSITORY' : 'INITIALIZE DEPLOYMENT')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={!!albumToDelete}
        title="Purge Repository"
        message="Are you sure you want to purge this album from the network? Signal units will remain but become unassigned nodes."
        confirmLabel="PURGE_SEQUENCE"
        cancelLabel="ABORT"
        onConfirm={confirmDelete}
        onCancel={() => setAlbumToDelete(null)}
      />
    </div>
  );
};

export default AlbumManagement;
