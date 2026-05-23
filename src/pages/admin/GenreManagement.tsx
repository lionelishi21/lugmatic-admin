import React, { useState, useMemo, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { 
  Plus, Tag, Music, Disc, Users, Search, Filter, 
  Grid, List, MoreVertical, Pencil, Trash2, X,
  CheckCircle2, AlertTriangle, Loader2, ChevronDown,
  Sparkles, ImageIcon, Target, Activity, Globe,
  Cpu, ArrowUpRight, ShieldCheck, SlidersHorizontal,
  Layers, Database, Save, LayoutGrid, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import genreService, { Genre, CreateGenreData, UpdateGenreData } from '../../services/genreService';

const colorMap: Record<string, { color: string; bg: string; border: string; glow: string }> = {
  rose: { color: 'text-rose-500', bg: 'bg-rose-500/5', border: 'border-rose-500/10', glow: 'shadow-[0_0_15px_rgba(244,63,94,0.2)]' },
  orange: { color: 'text-orange-500', bg: 'bg-orange-500/5', border: 'border-orange-500/10', glow: 'shadow-[0_0_15px_rgba(249,115,22,0.2)]' },
  violet: { color: 'text-violet-500', bg: 'bg-violet-500/5', border: 'border-violet-500/10', glow: 'shadow-[0_0_15px_rgba(139,92,246,0.2)]' },
  cyan: { color: 'text-cyan-500', bg: 'bg-cyan-500/5', border: 'border-cyan-500/10', glow: 'shadow-[0_0_15px_rgba(6,182,212,0.2)]' },
  amber: { color: 'text-amber-500', bg: 'bg-amber-500/5', border: 'border-amber-500/10', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.2)]' },
  emerald: { color: 'text-emerald-500', bg: 'bg-emerald-500/5', border: 'border-emerald-500/10', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.2)]' },
  blue: { color: 'text-blue-500', bg: 'bg-blue-500/5', border: 'border-blue-500/10', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.2)]' },
  indigo: { color: 'text-indigo-500', bg: 'bg-indigo-500/5', border: 'border-indigo-500/10', glow: 'shadow-[0_0_15px_rgba(99,102,241,0.2)]' },
};

const GenreManagement: React.FC = () => {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<Genre | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [submitting, setSubmitting] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchGenres = async () => {
    try {
      setLoading(true);
      const data = await genreService.getAllGenres();
      setGenres(data);
    } catch (error) {
      toast.error('Failed to load genres');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (genre?: Genre) => {
    setSelectedGenre(genre || null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedGenre(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;

    const formData = new FormData(formRef.current);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const color = formData.get('color') as string;
    const isActive = formData.get('status') === 'active';
    const image = formData.get('image') as string;

    if (!name.trim()) {
      toast.error('Please enter a genre name');
      return;
    }

    try {
      setSubmitting(true);
      const data: CreateGenreData | UpdateGenreData = {
        name: name.trim(),
        description: description?.trim() || '',
        color: color || 'emerald',
        image: image?.trim() || '',
        isActive,
      };

      if (selectedGenre) {
        await genreService.updateGenre(selectedGenre._id, data);
        toast.success('Genre updated successfully');
      } else {
        await genreService.createGenre(data);
        toast.success('Genre created successfully');
      }

      await fetchGenres();
      handleCloseDialog();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save genre');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;
    try {
      await genreService.deleteGenre(deleteDialog._id);
      toast.success('Genre deleted successfully');
      await fetchGenres();
      setDeleteDialog(null);
    } catch (error: any) {
      toast.error('Failed to delete genre');
    }
  };

  const filteredGenres = useMemo(() => {
    return genres.filter((g) => {
      const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase()) ||
        g.description.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && g.isActive) ||
        (statusFilter === 'inactive' && !g.isActive);
      return matchesSearch && matchesStatus;
    });
  }, [genres, search, statusFilter]);

  const stats = {
    total: genres.length,
    active: genres.filter(g => g.isActive).length,
    songs: genres.reduce((sum, g) => sum + g.songCount, 0),
  };

  return (
    <div className="space-y-12 pb-24">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold tracking-tight text-white leading-none">Genre Catalog</h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">System: Online</span>
            </div>
          </div>
          <p className="text-zinc-500 text-xs font-semibold ml-1">Categorize and manage all music genres, classifications, and system tags.</p>
        </div>
        <button
          onClick={() => handleOpenDialog()}
          className="h-16 px-10 bg-white text-black rounded-2xl text-[10px] font-bold hover:scale-105 transition-all shadow-2xl flex items-center justify-center gap-4 group border border-white/10"
        >
          <Plus size={18} />
          Add New Genre
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          { label: 'Total Genres', value: stats.total, icon: Tag, color: 'text-indigo-500', bg: 'bg-indigo-500/5' },
          { label: 'Active Genres', value: stats.active, icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
          { label: 'Song Count', value: stats.songs.toLocaleString(), icon: Music, color: 'text-blue-500', bg: 'bg-blue-500/5' },
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
            <p className="text-3xl font-bold text-white tracking-tighter">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="relative w-full lg:max-w-md group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 h-5 w-5 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            placeholder="Search genres..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-14 pr-12 h-14 bg-zinc-950/40 border border-white/5 rounded-2xl text-white text-[10px] font-bold focus:outline-none focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 transition-all shadow-inner placeholder:text-zinc-800"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-8">
          <div className="flex bg-zinc-950/40 border border-white/5 rounded-2xl p-1.5 gap-1.5 shadow-inner">
            {['all', 'active', 'inactive'].map(filter => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter as any)}
                className={`px-6 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all duration-300 ${
                  statusFilter === filter ? 'bg-white/10 text-white shadow-xl border border-white/5' : 'text-zinc-600 hover:text-zinc-300'
                }`}
              >
                {filter}
              </button>
            ))}
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
      </div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="premium-card py-40 text-center border-white/5 shadow-2xl"
          >
            <div className="relative inline-block mb-8">
              <div className="w-20 h-20 border-2 border-emerald-500/10 border-t-emerald-500 rounded-full animate-spin" />
              <Cpu className="absolute inset-0 m-auto text-emerald-500 animate-pulse" size={24} />
            </div>
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Loading Genres...</p>
          </motion.div>
        ) : filteredGenres.length === 0 ? (
          <motion.div 
            key="empty"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="premium-card py-40 text-center border-white/5 shadow-2xl group"
          >
            <div className="w-24 h-24 bg-zinc-950 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 border border-white/5 shadow-2xl group-hover:border-emerald-500/20 transition-all">
              <AlertTriangle size={36} className="text-zinc-800 group-hover:text-amber-500 transition-colors" />
            </div>
            <h3 className="text-[10px] font-bold text-white uppercase tracking-widest mb-3">No Genres Found</h3>
            <p className="text-[10px] text-zinc-600 font-bold max-w-sm mx-auto opacity-60">Adjust your search parameters or register a new genre classification.</p>
          </motion.div>
        ) : viewMode === 'grid' ? (
          <motion.div 
            key="grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10"
          >
            {filteredGenres.map((genre, i) => {
              const config = colorMap[genre.color] || colorMap.emerald;
              return (
                <motion.div
                  key={genre._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="premium-card group relative hover:border-emerald-500/30 transition-all duration-700 bg-zinc-950/40 border-white/5 overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.01] rounded-bl-full pointer-events-none group-hover:bg-white/[0.03] transition-all" />
                  
                  <div className="flex items-start justify-between mb-10 relative z-10">
                    <div className={`w-16 h-16 rounded-2xl ${config.bg} ${config.border} border flex items-center justify-center text-2xl shadow-inner relative overflow-hidden group-hover:scale-110 transition-transform duration-700 ${config.glow}`}>
                       <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                       <span className="relative z-10">{genre.icon || genre.name[0].toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-3 bg-zinc-950/80 px-3 py-1.5 rounded-xl border border-white/5 shadow-inner">
                       <div className={`w-1.5 h-1.5 rounded-full ${genre.isActive ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-zinc-700'}`} />
                       <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">{genre.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 uppercase tracking-tight group-hover:text-emerald-400 transition-colors leading-none">{genre.name}</h3>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.1em] line-clamp-2 leading-relaxed mb-10 h-10 opacity-60 group-hover:opacity-100 transition-opacity">
                    {genre.description || 'No description provided for this genre.'}
                  </p>

                  <div className="grid grid-cols-3 gap-4 mb-10 relative z-10">
                    <div className="bg-zinc-950 border border-white/5 rounded-2xl p-4 text-center shadow-inner group-hover:border-emerald-500/20 transition-all">
                      <p className="text-lg font-bold text-white tabular-nums leading-none mb-1.5">{genre.songCount}</p>
                      <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">Songs</p>
                    </div>
                    <div className="bg-zinc-950 border border-white/5 rounded-2xl p-4 text-center shadow-inner group-hover:border-emerald-500/20 transition-all">
                      <p className="text-lg font-bold text-white tabular-nums leading-none mb-1.5">{genre.albumCount}</p>
                      <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">Albums</p>
                    </div>
                    <div className="bg-zinc-950 border border-white/5 rounded-2xl p-4 text-center shadow-inner group-hover:border-emerald-500/20 transition-all">
                      <p className="text-lg font-bold text-white tabular-nums leading-none mb-1.5">{genre.artistCount}</p>
                      <p className="text-[8px] text-zinc-600 font-black uppercase tracking-widest">Artists</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-6 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                    <button onClick={() => handleOpenDialog(genre)} className="flex-1 h-12 bg-white/5 text-zinc-400 hover:text-white hover:bg-emerald-500/20 hover:border-emerald-500/30 border border-white/5 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all">Edit</button>
                    <button onClick={() => setDeleteDialog(genre)} className="flex-1 h-12 bg-zinc-950 text-rose-500/60 hover:text-rose-500 hover:bg-rose-500/10 border border-white/5 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all">Delete</button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div 
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="premium-card !p-0 overflow-hidden border-white/5 shadow-2xl"
          >
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-zinc-950/50">
                  <th className="px-10 py-8 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Genre Details</th>
                  <th className="px-10 py-8 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Item Counts</th>
                  <th className="px-10 py-8 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Status</th>
                  <th className="px-10 py-8 text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredGenres.map((genre, i) => {
                  const config = colorMap[genre.color] || colorMap.emerald;
                  return (
                    <motion.tr 
                      key={genre._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-emerald-500/[0.01] transition-all group"
                    >
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-6">
                          <div className={`w-14 h-14 rounded-2xl ${config.bg} border ${config.border} flex items-center justify-center text-xl font-bold shadow-inner group-hover:scale-110 transition-all duration-500 relative overflow-hidden`}>
                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span className="relative z-10">{genre.name[0].toUpperCase()}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-white uppercase tracking-tight group-hover:text-emerald-400 transition-colors leading-none mb-2">{genre.name}</p>
                            <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest line-clamp-1">{genre.description || 'No description'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2.5">
                             <Music size={14} className="text-zinc-700" />
                             <span className="text-[10px] font-bold text-zinc-400 tabular-nums uppercase tracking-widest">{genre.songCount} <span className="opacity-40 ml-1">Songs</span></span>
                          </div>
                          <div className="flex items-center gap-2.5">
                             <Disc size={14} className="text-zinc-700" />
                             <span className="text-[10px] font-bold text-zinc-400 tabular-nums uppercase tracking-widest">{genre.albumCount} <span className="opacity-40 ml-1">Albums</span></span>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-1.5 h-1.5 rounded-full ${genre.isActive ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-zinc-800'}`} />
                          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{genre.isActive ? 'Active' : 'Inactive'}</span>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                          <button onClick={() => handleOpenDialog(genre)} className="w-12 h-12 rounded-2xl flex items-center justify-center bg-zinc-950 border border-white/5 text-zinc-600 hover:text-white hover:bg-emerald-500/20 transition-all shadow-inner"><Pencil size={20} /></button>
                          <button onClick={() => setDeleteDialog(genre)} className="w-12 h-12 rounded-2xl flex items-center justify-center bg-zinc-950 border border-white/5 text-zinc-600 hover:text-rose-500 hover:bg-rose-500/10 transition-all shadow-inner"><Trash2 size={20} /></button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Genre Modals */}
      <AnimatePresence>
        {openDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl" onClick={handleCloseDialog}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="premium-card w-full max-w-xl shadow-[0_30px_100px_rgba(0,0,0,1)] border-emerald-500/10 p-12" onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-10 border-b border-white/5 pb-10">
                <div className="flex items-center gap-5">
                   <div className="w-14 h-14 bg-zinc-950 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner">
                      {selectedGenre ? <Pencil className="text-emerald-500" size={28} /> : <Plus className="text-emerald-500" size={28} />}
                   </div>
                   <div>
                      <h3 className="text-2xl font-bold text-white uppercase tracking-tighter italic leading-none mb-1.5">{selectedGenre ? 'Edit Genre' : 'Add New Genre'}</h3>
                      <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Genre Configuration</p>
                   </div>
                </div>
                <button onClick={handleCloseDialog} className="w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-white/5 text-zinc-500 transition-all border border-white/5 shadow-inner"><X size={24} /></button>
              </div>
              
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Genre Name <span className="text-emerald-500">*</span></label>
                  <input name="name" defaultValue={selectedGenre?.name} className="w-full h-16 px-8 bg-zinc-950 border border-white/5 rounded-2xl text-white text-[11px] font-bold tracking-widest uppercase focus:outline-none focus:border-emerald-500/30 transition-all shadow-inner placeholder:text-zinc-800" placeholder="e.g. Afrobeat" required />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Description</label>
                  <textarea name="description" defaultValue={selectedGenre?.description} className="w-full p-8 bg-zinc-950 border border-white/5 rounded-3xl text-zinc-300 text-[11px] font-bold tracking-wide focus:outline-none focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 transition-all shadow-inner resize-none h-32 leading-relaxed placeholder:text-zinc-800" placeholder="Provide background description for this genre..." />
                </div>
                
                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Theme Color</label>
                    <div className="relative group/sel">
                      <select name="color" defaultValue={selectedGenre?.color || 'emerald'} className="w-full h-16 px-8 bg-zinc-950 border border-white/5 rounded-2xl text-white text-[11px] font-bold tracking-widest uppercase focus:outline-none focus:border-emerald-500/30 appearance-none shadow-inner transition-all cursor-pointer">
                        {Object.keys(colorMap).map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                      </select>
                      <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-800 pointer-events-none group-focus-within/sel:rotate-180 duration-500 transition-all group-focus-within/sel:text-emerald-500" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Visibility</label>
                    <div className="relative group/sel">
                      <select name="status" defaultValue={selectedGenre?.isActive ? 'active' : 'inactive'} className="w-full h-16 px-8 bg-zinc-950 border border-white/5 rounded-2xl text-white text-[11px] font-bold tracking-widest uppercase focus:outline-none focus:border-emerald-500/30 appearance-none shadow-inner transition-all cursor-pointer">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                      <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-800 pointer-events-none group-focus-within/sel:rotate-180 duration-500 transition-all group-focus-within/sel:text-emerald-500" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Background Image URL</label>
                  <div className="flex gap-4">
                    <input name="image" defaultValue={selectedGenre?.image} className="flex-1 h-16 px-8 bg-zinc-950 border border-white/5 rounded-2xl text-white text-[11px] font-bold tracking-wide focus:outline-none focus:border-emerald-500/30 transition-all shadow-inner placeholder:text-zinc-800" placeholder="https://example.com/genre.jpg" />
                    <button type="button" onClick={() => toast.success('Image generation coming soon')} className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-emerald-400 hover:text-white hover:bg-emerald-500/20 border border-white/5 shadow-inner transition-all group/spark">
                       <Sparkles size={24} className="group-hover/spark:rotate-180 transition-transform duration-700" />
                    </button>
                  </div>
                </div>

                <div className="pt-12 border-t border-white/5 flex justify-end gap-6">
                  <button type="button" onClick={handleCloseDialog} className="h-16 px-10 bg-zinc-950 text-zinc-600 rounded-2xl text-[10px] font-bold uppercase tracking-widest border border-white/5 hover:bg-white/5 transition-all">Cancel</button>
                  <button type="submit" disabled={submitting} className="h-16 px-12 bg-white text-black rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-2xl hover:bg-emerald-400 transition-all flex items-center gap-4 group">
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={20} className="group-hover:translate-y-1 transition-transform" />}
                    Save Genre
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {deleteDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl" onClick={() => setDeleteDialog(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="premium-card w-full max-w-md text-center p-12 border-rose-500/10" onClick={e => e.stopPropagation()}
            >
              <div className="w-20 h-20 rounded-[2.5rem] bg-rose-500/10 flex items-center justify-center mx-auto mb-8 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-rose-500/10 animate-pulse" />
                <AlertTriangle className="text-rose-500 relative z-10" size={36} />
              </div>
              <h3 className="text-2xl font-bold text-white uppercase tracking-tighter italic mb-3">Delete Genre?</h3>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-10 leading-relaxed px-6">
                Are you sure you want to permanently delete <span className="text-white">{deleteDialog.name.toUpperCase()}</span>? This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button onClick={() => setDeleteDialog(null)} className="h-16 flex-1 bg-zinc-950 text-zinc-600 rounded-2xl text-[10px] font-bold uppercase tracking-widest border border-white/5 hover:bg-white/5 transition-all">Cancel</button>
                <button onClick={handleDelete} className="h-16 flex-1 bg-rose-600 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-2xl shadow-rose-900/20 hover:bg-rose-500 transition-all">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GenreManagement;
