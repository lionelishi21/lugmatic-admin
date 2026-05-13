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
  Loader2, Filter, Image as ImageIcon, CheckCircle2, History,
  Activity, ShieldCheck, Share2, Zap, BarChart3, 
  ChevronRight, Music2
} from 'lucide-react';
import { getFullImageUrl } from '../../services/api';

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
      toast.error('Failed to synchronize catalog registry');
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
    const loadingId = toast.loading(selectedAlbum ? 'Synchronizing album metadata...' : 'Registering new album project...');
    
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
        toast.success('Album registry updated', { id: loadingId });
      } else {
        await albumService.createAlbum(finalData as CreateAlbumData);
        toast.success('Album project deployed', { id: loadingId });
      }
      
      setIsDialogOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error('Transmission protocol failure', { id: loadingId });
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

  if (loading && albums.length === 0) return <Preloader isVisible={true} text="Initializing catalog environment..." />;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
            <Disc className="text-emerald-500" size={32} />
            Albums
          </h1>
          <p className="text-zinc-500">Manage full-length cinematic releases and project collections.</p>
        </div>
        <button onClick={() => handleOpenDialog()} className="btn-primary flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)] !px-8">
          <Plus size={18} />
          Register Album
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Projects', value: stats.total, icon: Disc, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
          { label: 'Cumulative Tracks', value: stats.tracks, icon: Music, color: 'text-blue-500', bg: 'bg-blue-500/5' },
          { label: 'Talent Network', value: stats.artists, icon: User, color: 'text-indigo-500', bg: 'bg-indigo-500/5' },
          { label: 'Project Density', value: `${stats.avg} T/A`, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/5' },
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
              placeholder="Search by project title or artist..."
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
              <option value="all">All Classifications</option>
              {genres.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" size={16} />
          </div>
        </div>

        <div className="flex bg-[#0a0a0a] border border-white/5 rounded-3xl p-1 gap-1">
          <button onClick={() => setViewMode('grid')} className={`p-2 rounded-2xl transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>
            <LayoutGrid size={18} />
          </button>
          <button onClick={() => setViewMode('list')} className={`p-2 rounded-2xl transition-all ${viewMode === 'list' ? 'bg-white/10 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>
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
              <Disc className="h-12 w-12 text-zinc-900 mx-auto mb-4" />
              <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">No cinematic projects detected in this sector.</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredAlbums.map((album) => (
                <div key={album._id} className="premium-card group !p-0 overflow-hidden hover:border-emerald-500/20 transition-all">
                  <div className="relative aspect-square bg-zinc-950 flex items-center justify-center overflow-hidden">
                    {album.coverArt ? (
                      <img src={getFullImageUrl(album.coverArt)} alt={album.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                    ) : (
                      <Disc size={64} className="text-zinc-900" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-80" />
                    
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                      <div className="flex gap-2">
                        <button onClick={() => handleOpenDialog(album)} className="p-2.5 rounded-xl bg-black/60 backdrop-blur-md text-white border border-white/10 hover:bg-emerald-500 hover:text-black hover:border-emerald-500 transition-all">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => setAlbumToDelete(album._id)} className="p-2.5 rounded-xl bg-black/60 backdrop-blur-md text-rose-500 border border-white/10 hover:bg-rose-500 hover:text-white transition-all">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="absolute bottom-6 left-6 right-6 z-10">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-1 truncate">
                        {typeof album.artist === 'string' ? 'Unknown' : (album.artist as any)?.name}
                      </p>
                      <h3 className="text-white font-bold tracking-tight text-xl truncate group-hover:text-emerald-400 transition-colors">
                        {album.name}
                      </h3>
                    </div>
                  </div>
                  <div className="p-6 flex items-center justify-between border-t border-white/5 bg-white/[0.02]">
                    <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                      <Music2 size={14} className="text-emerald-500" />
                      <span>{album.songs?.length || 0} Tracks</span>
                    </div>
                    <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">
                      {album.releaseDate ? new Date(album.releaseDate).getFullYear() : 'N/A'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="premium-card !p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="px-6 py-5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Project</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Entity</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Registration</th>
                      <th className="px-6 py-5 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredAlbums.map((album) => (
                      <tr key={album._id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-[1rem] bg-zinc-900 border border-white/5 overflow-hidden flex items-center justify-center">
                              {album.coverArt ? <img src={getFullImageUrl(album.coverArt)} className="w-full h-full object-cover" /> : <Disc size={18} className="text-zinc-600" />}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">{album.name}</p>
                              <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{album.songs?.length || 0} Tracks</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-medium text-zinc-400 uppercase tracking-widest">{typeof album.artist === 'string' ? 'Unknown' : (album.artist as any)?.name}</span>
                        </td>
                        <td className="px-6 py-4 text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-mono">
                          {album.releaseDate ? new Date(album.releaseDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleOpenDialog(album)} className="p-2.5 rounded-xl text-zinc-500 hover:text-white hover:bg-white/5 transition-all"><Edit size={18} /></button>
                            <button onClick={() => setAlbumToDelete(album._id)} className="p-2.5 rounded-xl text-zinc-500 hover:text-rose-500 hover:bg-rose-500/5 transition-all"><Trash2 size={18} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {isDialogOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md" onClick={() => !submitting && setIsDialogOpen(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="premium-card w-full max-w-xl shadow-2xl overflow-hidden relative" onClick={e => e.stopPropagation()}
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-10">
                  <div>
                    <h3 className="text-2xl font-bold text-white">{selectedAlbum ? 'Modify Project' : 'Register New Album'}</h3>
                    <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-bold">Configure cinematic release parameters.</p>
                  </div>
                  <button onClick={() => !submitting && setIsDialogOpen(false)} className="p-2.5 rounded-full hover:bg-white/5 text-zinc-600 hover:text-white transition-all"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] ml-1">Visual Index (Artwork)</label>
                    <FileUpload
                      label="Drop project artwork here"
                      currentFile={coverArtFile ? URL.createObjectURL(coverArtFile) : (formData.coverArt ? getFullImageUrl(formData.coverArt) : undefined)}
                      onFileSelect={(f) => setCoverArtFile(f)}
                      onFileRemove={() => { setCoverArtFile(null); setFormData(p => ({ ...p, coverArt: '' })); }}
                    />
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] ml-1">Project Title</label>
                      <input name="name" value={formData.name} onChange={handleInputChange as any} className="input-field" placeholder="e.g. Midnight City" required />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] ml-1">Artist Entity</label>
                        <div className="relative">
                          <select name="artist" value={formData.artist} onChange={handleInputChange as any} className="input-field appearance-none pr-10" required>
                            <option value="">Select Artist</option>
                            {artists.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" size={16} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] ml-1">Classification</label>
                        <div className="relative">
                          <select name="genre" value={formData.genre} onChange={handleInputChange as any} className="input-field appearance-none pr-10">
                            <option value="">Select Genre</option>
                            {genres.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" size={16} />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] ml-1">Release Protocol</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                        <input type="date" name="releaseDate" value={formData.releaseDate} onChange={handleInputChange as any} className="input-field pl-12" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-10 border-t border-white/5 flex justify-end gap-4">
                    <button type="button" onClick={() => setIsDialogOpen(false)} className="btn-secondary !px-10">Cancel</button>
                    <button type="submit" disabled={submitting} className="btn-primary !px-12 flex items-center gap-3">
                      {submitting && <Loader2 size={16} className="animate-spin" />}
                      {selectedAlbum ? 'Save Updates' : 'Deploy Project'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}

        <ConfirmDialog
          isOpen={!!albumToDelete}
          title="Purge Album Project?"
          message="This action will permanently remove the album project from the catalog registry."
          confirmLabel="Purge Media"
          onConfirm={async () => {
             if (!albumToDelete) return;
             const loadingId = toast.loading('Purging catalog...');
             try {
               await albumService.deleteAlbum(albumToDelete);
               toast.success('Project purged', { id: loadingId });
               fetchData();
             } catch { toast.error('Purge failure', { id: loadingId }); }
             finally { setAlbumToDelete(null); }
          }}
          onCancel={() => setAlbumToDelete(null)}
        />
      </AnimatePresence>
    </div>
  );
};

export default AlbumManagement;
