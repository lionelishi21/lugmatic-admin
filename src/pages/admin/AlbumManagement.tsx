import React, { useState, useEffect } from 'react';
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
  ChevronRight, Music2, Target, Globe, Cpu, ArrowUpRight,
  Layers, Database, Save, HardDrive, Info, ArrowUpDown, ArrowUp, ArrowDown
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
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

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
        className="flex items-center gap-1.5 hover:text-white transition-colors group/btn text-[10px] font-bold text-zinc-500 uppercase tracking-widest"
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
      toast.error('Failed to load album catalog');
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
    const loadingId = toast.loading(selectedAlbum ? 'Saving album details...' : 'Creating new album...');
    
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
        toast.success('Album updated successfully', { id: loadingId });
      } else {
        await albumService.createAlbum(finalData as CreateAlbumData);
        toast.success('Album created successfully', { id: loadingId });
      }
      
      setIsDialogOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error('Upload failed', { id: loadingId });
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

  const sortedAlbums = React.useMemo(() => {
    const list = [...filteredAlbums];
    list.sort((a, b) => {
      let valA: any = '';
      let valB: any = '';

      if (sortField === 'name') {
        valA = a.name || '';
        valB = b.name || '';
      } else if (sortField === 'artist') {
        valA = typeof a.artist === 'string' ? '' : (a.artist as any)?.name || '';
        valB = typeof b.artist === 'string' ? '' : (b.artist as any)?.name || '';
      } else if (sortField === 'releaseDate') {
        valA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
        valB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
      } else if (sortField === 'tracks') {
        valA = a.songs?.length || 0;
        valB = b.songs?.length || 0;
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
  }, [filteredAlbums, sortField, sortDirection]);

  const stats = {
    total: albums.length,
    tracks: albums.reduce((sum, a) => sum + (a.songs?.length || 0), 0),
    artists: new Set(albums.map(a => (typeof a.artist === 'string' ? a.artist : a.artist?._id))).size,
    avg: albums.length > 0 ? Math.round(albums.reduce((sum, a) => sum + (a.songs?.length || 0), 0) / albums.length) : 0
  };

  if (loading && albums.length === 0) return <Preloader isVisible={true} text="Loading album catalog..." />;

  return (
    <div className="space-y-12 pb-24">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold tracking-tight text-white leading-none">Album Management</h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500 tracking-wide">System: Online</span>
            </div>
          </div>
          <p className="text-zinc-500 text-xs font-semibold tracking-wide ml-1">Manage music albums, EPs, and release classifications.</p>
        </div>
        <button
          onClick={() => handleOpenDialog()}
          className="h-16 px-10 bg-white text-black rounded-2xl text-[10px] font-bold hover:scale-105 transition-all shadow-2xl flex items-center justify-center gap-4 group border border-white/10"
        >
          <Plus size={18} />
          Create Album
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Total Albums', value: stats.total, icon: Disc, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
          { label: 'Total Tracks', value: stats.tracks, icon: Music, color: 'text-blue-500', bg: 'bg-blue-500/5' },
          { label: 'Artists', value: stats.artists, icon: User, color: 'text-indigo-500', bg: 'bg-indigo-500/5' },
          { label: 'Average Tracks', value: `${stats.avg} / Album`, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/5' },
        ].map((s, i) => (
          <motion.div 
            key={s.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="premium-card group border-white/5 hover:border-emerald-500/20 transition-all cursor-default relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] rounded-bl-full pointer-events-none" />
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 ${s.bg} border border-white/5 shadow-inner relative overflow-hidden group-hover:scale-110 transition-transform duration-500`}>
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <s.icon size={24} className={s.color} />
            </div>
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-2">{s.label}</p>
            <p className="text-3xl font-bold text-white tracking-tighter tabular-nums">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="flex flex-col md:flex-row gap-6 w-full lg:max-w-4xl">
          <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 h-5 w-5 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder="Search albums..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-12 h-14 bg-zinc-950/40 border border-white/5 rounded-2xl text-white text-[10px] font-bold focus:outline-none focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 transition-all shadow-inner placeholder:text-zinc-800"
            />
          </div>
          <div className="relative w-full md:w-80 group">
            <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 h-5 w-5 group-focus-within:text-emerald-500 transition-colors" />
            <select
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
              className="w-full h-14 pl-14 pr-12 bg-zinc-950/40 border border-white/5 rounded-2xl text-white text-[10px] font-bold uppercase focus:outline-none focus:border-emerald-500/30 appearance-none shadow-inner transition-all cursor-pointer"
            >
              <option value="all">All Genres</option>
              {genres.map(g => <option key={g._id} value={g._id}>{g.name.toUpperCase()}</option>)}
            </select>
            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-800 pointer-events-none group-focus-within:rotate-180 duration-500 transition-all group-focus-within:text-emerald-500" size={18} />
          </div>
        </div>

        <div className="flex bg-zinc-950/40 border border-white/5 rounded-2xl p-1.5 gap-1.5 shadow-inner">
          <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white shadow-xl border border-white/5' : 'text-zinc-600 hover:text-zinc-300'}`}>
            <LayoutGrid size={18} />
          </button>
          <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white/10 text-white shadow-xl border border-white/5' : 'text-zinc-600 hover:text-zinc-300'}`}>
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Albums Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          className="min-h-[400px]"
        >
          {sortedAlbums.length === 0 ? (
            <div className="premium-card py-40 text-center border-white/5 shadow-2xl group">
              <div className="w-24 h-24 bg-zinc-950 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 border border-white/5 shadow-2xl group-hover:border-emerald-500/20 transition-all">
                <Disc size={36} className="text-zinc-800 group-hover:text-emerald-500 transition-colors" />
              </div>
              <h3 className="text-[10px] font-bold text-white uppercase tracking-widest mb-3">No Albums Found</h3>
              <p className="text-[10px] text-zinc-600 font-bold max-w-sm mx-auto opacity-60">Try adjusting your search filters or create a new album.</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
              {sortedAlbums.map((album, i) => (
                <motion.div 
                  key={album._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="premium-card group !p-0 overflow-hidden hover:border-emerald-500/30 transition-all duration-700 bg-zinc-950/40 border-white/5 shadow-2xl relative"
                >
                  <div className="relative aspect-square bg-zinc-950 flex items-center justify-center overflow-hidden">
                    {album.coverArt ? (
                      <img 
                        src={getFullImageUrl(album.coverArt)} 
                        alt={album.name} 
                        className="h-full w-full object-cover group-hover:scale-125 transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] opacity-70 group-hover:opacity-100" 
                      />
                    ) : (
                      <Disc size={64} className="text-zinc-900 group-hover:text-zinc-800 transition-colors" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80 z-10" />
                    
                    <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all z-30 translate-x-4 group-hover:translate-x-0">
                      <div className="flex gap-3">
                        <button 
                          onClick={() => handleOpenDialog(album)} 
                          className="w-12 h-12 rounded-2xl bg-black/80 backdrop-blur-xl text-white border border-white/10 hover:bg-emerald-500/20 hover:border-emerald-500/30 transition-all shadow-2xl flex items-center justify-center"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => setAlbumToDelete(album._id)} 
                          className="w-12 h-12 rounded-2xl bg-black/80 backdrop-blur-xl text-rose-500/60 hover:text-rose-500 border border-white/10 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all shadow-2xl flex items-center justify-center"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="absolute bottom-8 left-8 right-8 z-20">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="px-2 py-0.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                           <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Active</p>
                        </div>
                      </div>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-2 truncate">
                        {typeof album.artist === 'string' ? 'Unknown Artist' : (album.artist as any)?.name.toUpperCase()}
                      </p>
                      <h3 className="text-white font-bold tracking-tighter text-2xl truncate group-hover:text-emerald-400 transition-colors leading-none uppercase">
                        {album.name}
                      </h3>
                    </div>
                  </div>
                  <div className="p-8 flex items-center justify-between border-t border-white/5 bg-[#0a0a0a] relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-zinc-950 rounded-xl flex items-center justify-center border border-white/5 shadow-inner">
                         <Music2 size={14} className="text-emerald-500" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 tabular-nums">{album.songs?.length || 0} Tracks</span>
                    </div>
                    <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest font-mono">
                      {album.releaseDate ? new Date(album.releaseDate).getFullYear() : 'XXXX'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="premium-card !p-0 overflow-hidden border-white/5 shadow-2xl"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5 bg-zinc-950/50">
                      <th className="px-10 py-8 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em]">{renderSortHeader('Album Name', 'name')}</th>
                      <th className="px-10 py-8 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em]">{renderSortHeader('Artist', 'artist')}</th>
                      <th className="px-10 py-8 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em]">{renderSortHeader('Release Date', 'releaseDate')}</th>
                      <th className="px-10 py-8 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em]">{renderSortHeader('Tracks', 'tracks')}</th>
                      <th className="px-10 py-8 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {sortedAlbums.map((album, i) => (
                      <motion.tr 
                        key={album._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="hover:bg-emerald-500/[0.01] transition-all group"
                      >
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-zinc-950 border border-white/5 overflow-hidden flex items-center justify-center shadow-inner relative group-hover:scale-110 transition-all duration-500">
                              {album.coverArt ? (
                                <img src={getFullImageUrl(album.coverArt)} className="w-full h-full object-cover" />
                              ) : (
                                <Disc size={24} className="text-zinc-800" />
                              )}
                              <div className="absolute inset-0 bg-black/20" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white uppercase tracking-tight group-hover:text-emerald-400 transition-colors leading-none mb-2">{album.name}</p>
                              <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{album.songs?.length || 0} Tracks</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-3">
                             <User size={14} className="text-zinc-700" />
                             <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{typeof album.artist === 'string' ? 'Unknown' : (album.artist as any)?.name.toUpperCase()}</span>
                          </div>
                        </td>
                        <td className="px-10 py-6 text-[10px] font-bold text-zinc-600 uppercase tracking-widest font-mono">
                          {album.releaseDate ? new Date(album.releaseDate).toLocaleDateString() : 'XX/XX/XXXX'}
                        </td>
                        <td className="px-10 py-6 text-right">
                          <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                            <button onClick={() => handleOpenDialog(album)} className="w-12 h-12 rounded-2xl flex items-center justify-center bg-zinc-950 border border-white/5 text-zinc-600 hover:text-white hover:bg-emerald-500/20 transition-all shadow-inner"><Edit size={20} /></button>
                            <button onClick={() => setAlbumToDelete(album._id)} className="w-12 h-12 rounded-2xl flex items-center justify-center bg-zinc-950 border border-white/5 text-zinc-600 hover:text-rose-500 hover:bg-rose-500/10 transition-all shadow-inner"><Trash2 size={20} /></button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Album Form Modal */}
      <AnimatePresence>
        {isDialogOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl" onClick={() => !submitting && setIsDialogOpen(false)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="premium-card w-full max-w-xl shadow-[0_30px_100px_rgba(0,0,0,1)] border-emerald-500/10 p-12 bg-[#0a0a0a]" onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-10">
                <div className="flex items-center gap-5">
                   <div className="w-14 h-14 bg-zinc-950 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner">
                      {selectedAlbum ? <Edit className="text-emerald-500" size={28} /> : <Plus className="text-emerald-500" size={28} />}
                   </div>
                   <div>
                      <h3 className="text-2xl font-bold text-white uppercase tracking-tighter leading-none mb-1.5">{selectedAlbum ? 'Modify Album' : 'Create Album'}</h3>
                      <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Album Configuration</p>
                   </div>
                </div>
                <button onClick={() => !submitting && setIsDialogOpen(false)} className="w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-white/5 text-zinc-500 transition-all border border-white/5 shadow-inner"><X size={24} /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Album Cover Image</label>
                  <div className="bg-zinc-950 rounded-[2.5rem] border border-white/5 p-8 shadow-inner group/upload">
                    <FileUpload
                      label="Upload Cover Artwork"
                      currentFile={coverArtFile ? URL.createObjectURL(coverArtFile) : (formData.coverArt ? getFullImageUrl(formData.coverArt) : undefined)}
                      onFileSelect={(f) => setCoverArtFile(f)}
                      onFileRemove={() => { setCoverArtFile(null); setFormData(p => ({ ...p, coverArt: '' })); }}
                    />
                  </div>
                </div>

                <div className="space-y-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Album Title <span className="text-emerald-500">*</span></label>
                    <input name="name" value={formData.name} onChange={handleInputChange as any} className="w-full h-16 px-8 bg-zinc-950 border border-white/5 rounded-2xl text-white text-[11px] font-bold tracking-wider uppercase focus:outline-none focus:border-emerald-500/30 transition-all shadow-inner placeholder:text-zinc-800" placeholder="e.g. Midnight Memories" required />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Artist</label>
                      <div className="relative group/sel">
                        <select name="artist" value={formData.artist} onChange={handleInputChange as any} className="w-full h-16 px-8 bg-zinc-950 border border-white/5 rounded-2xl text-white text-[11px] font-bold tracking-wider uppercase focus:outline-none focus:border-emerald-500/30 appearance-none shadow-inner transition-all cursor-pointer" required>
                          <option value="">Select Artist</option>
                          {artists.map(a => <option key={a._id} value={a._id}>{a.name.toUpperCase()}</option>)}
                        </select>
                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-800 pointer-events-none group-focus-within/sel:rotate-180 duration-500 transition-all group-focus-within/sel:text-emerald-500" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Genre</label>
                      <div className="relative group/sel">
                        <select name="genre" value={formData.genre} onChange={handleInputChange as any} className="w-full h-16 px-8 bg-zinc-950 border border-white/5 rounded-2xl text-white text-[11px] font-bold tracking-wider uppercase focus:outline-none focus:border-emerald-500/30 appearance-none shadow-inner transition-all cursor-pointer">
                          <option value="">Select Genre</option>
                          {genres.map(g => <option key={g._id} value={g._id}>{g.name.toUpperCase()}</option>)}
                        </select>
                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-800 pointer-events-none group-focus-within/sel:rotate-180 duration-500 transition-all group-focus-within/sel:text-emerald-500" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Release Date</label>
                    <div className="relative group">
                      <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-800 group-focus-within:text-emerald-500 transition-all" size={20} />
                      <input type="date" name="releaseDate" value={formData.releaseDate} onChange={handleInputChange as any} className="w-full h-16 pl-16 pr-8 bg-zinc-950 border border-white/5 rounded-2xl text-white text-[11px] font-bold tracking-wider focus:outline-none focus:border-emerald-500/30 shadow-inner" />
                    </div>
                  </div>
                </div>

                <div className="pt-12 border-t border-white/5 flex justify-end gap-6">
                  <button type="button" onClick={() => setIsDialogOpen(false)} className="h-16 px-10 bg-zinc-950 text-zinc-600 rounded-2xl text-[10px] font-bold uppercase tracking-widest border border-white/5 hover:bg-white/5 transition-all">Cancel</button>
                  <button type="submit" disabled={submitting} className="h-16 px-12 bg-white text-black rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-2xl hover:bg-emerald-400 transition-all flex items-center gap-4 group">
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={20} className="group-hover:translate-y-1 transition-transform" />}
                    {selectedAlbum ? 'Save Changes' : 'Create Album'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        <ConfirmDialog
          isOpen={!!albumToDelete}
          title="Delete Album?"
          message="Are you sure you want to permanently delete this album? This action cannot be undone."
          confirmLabel="Delete"
          onConfirm={async () => {
             if (!albumToDelete) return;
             const loadingId = toast.loading('Deleting album...');
             try {
               await albumService.deleteAlbum(albumToDelete);
               toast.success('Album deleted successfully', { id: loadingId });
               fetchData();
             } catch { toast.error('Delete failed', { id: loadingId }); }
             finally { setAlbumToDelete(null); }
          }}
          onCancel={() => setAlbumToDelete(null)}
        />
      </AnimatePresence>
    </div>
  );
};

export default AlbumManagement;
