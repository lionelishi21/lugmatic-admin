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
  Music, Calendar, User, Tag, LayoutGrid, List, ChevronDown, 
  Loader2, Filter, Image as ImageIcon, CheckCircle2, History
} from 'lucide-react';

const AlbumManagement: React.FC = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [albumsData, artistsData, genresData] = await Promise.all([
        albumService.getAllAlbums(),
        artistService.getAllArtists(),
        genreService.getAllGenres()
      ]);
      setAlbums(albumsData);
      setArtists(artistsData);
      setGenres(genresData);
    } catch (err: any) {
      toast.error('Failed to synchronize data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (album?: Album) => {
    if (album) {
      setSelectedAlbum(album);
      setFormData({
        name: album.name,
        artist: typeof album.artist === 'string' ? album.artist : album.artist._id,
        releaseDate: album.releaseDate ? new Date(album.releaseDate).toISOString().split('T')[0] : '',
        genre: typeof album.genre === 'string' ? album.genre : album.genre?._id || '',
        coverArt: album.coverArt,
        songs: album.songs || [],
      });
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
    }
    setCoverArtFile(null);
    setIsDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const loadingId = toast.loading(selectedAlbum ? 'Updating album...' : 'Creating album...');
    
    try {
      let coverArtUrl = formData.coverArt || '';

      if (coverArtFile) {
        const presign = await albumService.getPresignedUrl('cover-art', coverArtFile.name, coverArtFile.type);
        await albumService.uploadToS3(presign.uploadUrl, coverArtFile, coverArtFile.type);
        coverArtUrl = presign.publicUrl;
      }

      const finalData = { ...formData, coverArt: coverArtUrl };

      if (selectedAlbum) {
        await albumService.adminUpdateAlbum(selectedAlbum._id, finalData);
        toast.success('Album updated', { id: loadingId });
      } else {
        await albumService.createAlbum(finalData as CreateAlbumData);
        toast.success('Album created', { id: loadingId });
      }
      
      setIsDialogOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error('Operation failed', { id: loadingId });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAlbums = albums.filter((album) => {
    const searchLower = searchTerm.toLowerCase();
    const artistName = typeof album.artist === 'string' ? '' : (album.artist as any)?.name || '';
    const matchesSearch = album.name.toLowerCase().includes(searchLower) || artistName.toLowerCase().includes(searchLower);
    const albumGenreId = typeof album.genre === 'string' ? album.genre : (album.genre as any)?._id || '';
    const matchesGenre = genreFilter === 'all' || albumGenreId === genreFilter;
    return matchesSearch && matchesGenre;
  });

  const stats = {
    total: albums.length,
    tracks: albums.reduce((sum, a) => sum + (a.songs?.length || 0), 0),
    artists: new Set(albums.map(a => (typeof a.artist === 'string' ? a.artist : a.artist?._id))).size,
    avg: albums.length > 0 ? Math.round(albums.reduce((sum, a) => sum + (a.songs?.length || 0), 0) / albums.length) : 0
  };

  if (loading && albums.length === 0) return <Preloader isVisible={true} text="Connecting to catalog..." />;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Albums</h1>
          <p className="text-zinc-500">Manage full-length releases and project collections.</p>
        </div>
        <button onClick={() => handleOpenDialog()} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Add Album
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Albums', value: stats.total, icon: Disc, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
          { label: 'Total Tracks', value: stats.tracks, icon: Music, color: 'text-blue-500', bg: 'bg-blue-500/5' },
          { label: 'Contributing Artists', value: stats.artists, icon: User, color: 'text-indigo-500', bg: 'bg-indigo-500/5' },
          { label: 'Avg. Track Count', value: stats.avg, icon: Tag, color: 'text-amber-500', bg: 'bg-amber-500/5' },
        ].map(s => (
          <div key={s.label} className="premium-card">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-6 ${s.bg}`}>
              <s.icon size={20} className={s.color} />
            </div>
            <p className="text-zinc-500 text-xs font-medium mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-white tracking-tight">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row gap-4 w-full md:max-w-3xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by title or artist..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-11"
            />
          </div>
          <div className="relative w-full md:w-64">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
            <select
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
              className="input-field pl-11 pr-10 appearance-none cursor-pointer"
            >
              <option value="all">All Genres</option>
              {genres.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={16} />
          </div>
        </div>

        <div className="flex bg-[#0a0a0a] border border-white/5 rounded-2xl p-1 gap-1">
          <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <LayoutGrid size={18} />
          </button>
          <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Grid Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="min-h-[400px]"
        >
          {filteredAlbums.length === 0 ? (
            <div className="premium-card py-24 text-center">
              <Disc className="h-12 w-12 text-zinc-800 mx-auto mb-4" />
              <p className="text-zinc-500">No albums found matching your search.</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredAlbums.map((album) => (
                <div key={album._id} className="premium-card group !p-0 overflow-hidden hover:border-emerald-500/20">
                  <div className="relative aspect-square bg-zinc-950 flex items-center justify-center overflow-hidden">
                    {album.coverArt ? (
                      <img src={album.coverArt} alt={album.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                    ) : (
                      <Disc size={64} className="text-zinc-900" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-80" />
                    
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                      <div className="flex gap-2">
                        <button onClick={() => handleOpenDialog(album)} className="p-2.5 rounded-xl bg-black/40 backdrop-blur-md text-white border border-white/10 hover:bg-emerald-500 hover:text-black hover:border-emerald-500 transition-all">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => setAlbumToDelete(album._id)} className="p-2.5 rounded-xl bg-black/40 backdrop-blur-md text-rose-500 border border-white/10 hover:bg-rose-500 hover:text-white transition-all">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="absolute bottom-4 left-4 right-4 z-10">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 truncate">
                        {typeof album.artist === 'string' ? 'Unknown' : (album.artist as any)?.name}
                      </p>
                      <h3 className="text-white font-bold tracking-tight text-lg truncate group-hover:text-emerald-400 transition-colors">
                        {album.name}
                      </h3>
                    </div>
                  </div>
                  <div className="p-5 flex items-center justify-between border-t border-white/5 bg-[#0a0a0a]">
                    <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                      <Music size={14} className="text-emerald-500" />
                      <span>{album.songs?.length || 0} Tracks</span>
                    </div>
                    <span className="text-xs font-medium text-zinc-600">
                      {album.releaseDate ? new Date(album.releaseDate).getFullYear() : 'N/A'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="premium-card !p-0 overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-6 py-5 text-xs font-semibold text-zinc-500 uppercase">Album</th>
                    <th className="px-6 py-5 text-xs font-semibold text-zinc-500 uppercase">Artist</th>
                    <th className="px-6 py-5 text-xs font-semibold text-zinc-500 uppercase">Release</th>
                    <th className="px-6 py-5 text-xs font-semibold text-zinc-500 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredAlbums.map((album) => (
                    <tr key={album._id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 overflow-hidden flex items-center justify-center">
                            {album.coverArt ? <img src={album.coverArt} className="w-full h-full object-cover" /> : <Disc size={18} className="text-zinc-600" />}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">{album.name}</p>
                            <p className="text-[11px] text-zinc-500">{album.songs?.length || 0} Tracks</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-zinc-400">{typeof album.artist === 'string' ? 'Unknown' : (album.artist as any)?.name}</span>
                      </td>
                      <td className="px-6 py-4 text-xs text-zinc-500">
                        {album.releaseDate ? new Date(album.releaseDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleOpenDialog(album)} className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-all"><Edit size={18} /></button>
                          <button onClick={() => setAlbumToDelete(album._id)} className="p-2 rounded-lg text-zinc-500 hover:text-rose-500 hover:bg-rose-500/5 transition-all"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {isDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setIsDialogOpen(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="premium-card w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold">{selectedAlbum ? 'Edit Album' : 'New Album'}</h3>
                <button onClick={() => setIsDialogOpen(false)} className="p-2 rounded-full hover:bg-white/5 text-zinc-500"><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-xs font-semibold text-zinc-500 mb-2 block uppercase tracking-widest">Artwork</label>
                  <FileUpload
                    label="Drop cover art here"
                    currentFile={coverArtFile ? URL.createObjectURL(coverArtFile) : formData.coverArt || undefined}
                    onFileSelect={(f) => setCoverArtFile(f)}
                    onFileRemove={() => { setCoverArtFile(null); setFormData(p => ({ ...p, coverArt: '' })); }}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-500 mb-2 block uppercase tracking-widest">Title</label>
                  <input name="name" value={formData.name} onChange={handleInputChange as any} className="input-field" placeholder="Album title..." required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 mb-2 block uppercase tracking-widest">Artist</label>
                    <div className="relative">
                      <select name="artist" value={formData.artist} onChange={handleInputChange as any} className="input-field appearance-none pr-10" required>
                        <option value="">Select Artist</option>
                        {artists.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={16} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 mb-2 block uppercase tracking-widest">Genre</label>
                    <div className="relative">
                      <select name="genre" value={formData.genre} onChange={handleInputChange as any} className="input-field appearance-none pr-10">
                        <option value="">Select Genre</option>
                        {genres.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={16} />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-500 mb-2 block uppercase tracking-widest">Release Date</label>
                  <input type="date" name="releaseDate" value={formData.releaseDate} onChange={handleInputChange as any} className="input-field" />
                </div>
                <div className="pt-6 border-t border-white/5 flex justify-end gap-4">
                  <button type="button" onClick={() => setIsDialogOpen(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn-primary">
                    {submitting ? 'Saving...' : (selectedAlbum ? 'Save' : 'Create')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        <ConfirmDialog
          isOpen={!!albumToDelete}
          title="Delete Album?"
          message="This action will permanently remove the album project from the catalog."
          confirmLabel="Delete"
          onConfirm={async () => {
             if (!albumToDelete) return;
             try {
               await albumService.deleteAlbum(albumToDelete);
               toast.success('Album removed');
               fetchData();
             } catch { toast.error('Deletion failed'); }
             finally { setAlbumToDelete(null); }
          }}
          onCancel={() => setAlbumToDelete(null)}
        />
      </AnimatePresence>
    </div>
  );
};

export default AlbumManagement;
