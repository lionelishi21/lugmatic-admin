import React, { useState, useMemo, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { 
  Plus, Tag, Music, Disc, Users, Search, Filter, 
  Grid, List, MoreVertical, Pencil, Trash2, X,
  CheckCircle2, AlertTriangle, Loader2, ChevronDown,
  Sparkles, ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import genreService, { Genre, CreateGenreData, UpdateGenreData } from '../../services/genreService';

const colorMap: Record<string, { color: string; bg: string; border: string }> = {
  rose: { color: 'text-rose-500', bg: 'bg-rose-500/5', border: 'border-rose-500/10' },
  orange: { color: 'text-orange-500', bg: 'bg-orange-500/5', border: 'border-orange-500/10' },
  violet: { color: 'text-violet-500', bg: 'bg-violet-500/5', border: 'border-violet-500/10' },
  cyan: { color: 'text-cyan-500', bg: 'bg-cyan-500/5', border: 'border-cyan-500/10' },
  amber: { color: 'text-amber-500', bg: 'bg-amber-500/5', border: 'border-amber-500/10' },
  emerald: { color: 'text-emerald-500', bg: 'bg-emerald-500/5', border: 'border-emerald-500/10' },
  blue: { color: 'text-blue-500', bg: 'bg-blue-500/5', border: 'border-blue-500/10' },
  indigo: { color: 'text-indigo-500', bg: 'bg-indigo-500/5', border: 'border-indigo-500/10' },
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
        toast.success('Genre updated');
      } else {
        await genreService.createGenre(data);
        toast.success('Genre created');
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
      toast.success('Genre removed');
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Genres</h1>
          <p className="text-zinc-500">Categorize and organize the global catalog.</p>
        </div>
        <button onClick={() => handleOpenDialog()} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          Add Genre
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { label: 'Total Categories', value: stats.total, icon: Tag, color: 'text-indigo-500', bg: 'bg-indigo-500/5' },
          { label: 'Active Status', value: stats.active, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
          { label: 'Assigned Songs', value: stats.songs.toLocaleString(), icon: Music, color: 'text-blue-500', bg: 'bg-blue-500/5' },
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
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search genres..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-11"
          />
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex bg-[#0a0a0a] border border-white/5 rounded-2xl p-1 gap-1">
            {['all', 'active', 'inactive'].map(filter => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter as any)}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                  statusFilter === filter ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
          
          <div className="flex bg-[#0a0a0a] border border-white/5 rounded-2xl p-1 gap-1">
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
              <Grid size={18} />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="premium-card py-24 text-center">
          <Loader2 className="h-8 w-8 text-emerald-500 animate-spin mx-auto mb-4" />
          <p className="text-zinc-500">Fetching categories...</p>
        </div>
      ) : filteredGenres.length === 0 ? (
        <div className="premium-card py-24 text-center">
          <Tag className="h-12 w-12 text-zinc-800 mx-auto mb-4" />
          <p className="text-zinc-500">No genres found matching your search.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredGenres.map((genre) => {
            const config = colorMap[genre.color] || colorMap.emerald;
            return (
              <motion.div
                key={genre._id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="premium-card group relative hover:border-emerald-500/20"
              >
                <div className="flex items-start justify-between mb-8">
                  <div className={`w-12 h-12 rounded-2xl ${config.bg} ${config.border} border flex items-center justify-center text-xl`}>
                    {genre.icon || <Tag size={24} className={config.color} />}
                  </div>
                  <div className={`w-2 h-2 rounded-full ${genre.isActive ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-zinc-600'}`} />
                </div>

                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">{genre.name}</h3>
                <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed mb-8">{genre.description || 'No description provided.'}</p>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-3 text-center">
                    <p className="text-sm font-bold text-white">{genre.songCount}</p>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase">Songs</p>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-3 text-center">
                    <p className="text-sm font-bold text-white">{genre.albumCount}</p>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase">Albums</p>
                  </div>
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-3 text-center">
                    <p className="text-sm font-bold text-white">{genre.artistCount}</p>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase">Artists</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleOpenDialog(genre)} className="flex-1 btn-secondary !py-2 !text-xs">Edit</button>
                  <button onClick={() => setDeleteDialog(genre)} className="flex-1 btn-secondary !py-2 !text-xs !text-rose-500 hover:!bg-rose-500/5">Delete</button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="premium-card !p-0 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-6 py-5 text-xs font-semibold text-zinc-500 uppercase">Genre</th>
                <th className="px-6 py-5 text-xs font-semibold text-zinc-500 uppercase">Stats</th>
                <th className="px-6 py-5 text-xs font-semibold text-zinc-500 uppercase">Status</th>
                <th className="px-6 py-5 text-xs font-semibold text-zinc-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredGenres.map((genre) => {
                const config = colorMap[genre.color] || colorMap.emerald;
                return (
                  <tr key={genre._id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-9 h-9 rounded-xl ${config.bg} flex items-center justify-center text-sm font-bold ${config.color}`}>
                          {genre.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">{genre.name}</p>
                          <p className="text-[11px] text-zinc-500 truncate max-w-[200px]">{genre.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4 text-xs font-medium text-zinc-400">
                        <span className="flex items-center gap-1.5"><Music size={14} /> {genre.songCount}</span>
                        <span className="flex items-center gap-1.5"><Disc size={14} /> {genre.albumCount}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${genre.isActive ? 'bg-emerald-500' : 'bg-zinc-600'}`} />
                        <span className="text-xs font-medium text-zinc-400">{genre.isActive ? 'Active' : 'Hidden'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenDialog(genre)} className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5"><Pencil size={18} /></button>
                        <button onClick={() => setDeleteDialog(genre)} className="p-2 rounded-lg text-zinc-500 hover:text-rose-500 hover:bg-rose-500/5"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {openDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={handleCloseDialog}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="premium-card w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold">{selectedGenre ? 'Edit Genre' : 'New Genre'}</h3>
                <button onClick={handleCloseDialog} className="p-2 rounded-full hover:bg-white/5 text-zinc-500"><X size={20} /></button>
              </div>
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="text-xs font-semibold text-zinc-500 mb-2 block uppercase tracking-widest">Name</label>
                  <input name="name" defaultValue={selectedGenre?.name} className="input-field" placeholder="e.g. Afrobeats" required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-500 mb-2 block uppercase tracking-widest">Description</label>
                  <textarea name="description" defaultValue={selectedGenre?.description} className="input-field h-24 resize-none" placeholder="Category definition..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 mb-2 block uppercase tracking-widest">Color Theme</label>
                    <div className="relative">
                      <select name="color" defaultValue={selectedGenre?.color || 'emerald'} className="input-field appearance-none pr-10">
                        {Object.keys(colorMap).map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={16} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-500 mb-2 block uppercase tracking-widest">Visibility</label>
                    <div className="relative">
                      <select name="status" defaultValue={selectedGenre?.isActive ? 'active' : 'inactive'} className="input-field appearance-none pr-10">
                        <option value="active">Visible</option>
                        <option value="inactive">Hidden</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={16} />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-500 mb-2 block uppercase tracking-widest">Asset URL</label>
                  <div className="flex gap-2">
                    <input name="image" defaultValue={selectedGenre?.image} className="input-field flex-1" placeholder="Background URL..." />
                    <button type="button" onClick={() => toast.success('Smart asset generation active')} className="p-3 bg-white/5 rounded-xl text-emerald-400 hover:bg-emerald-500/10 transition-colors"><Sparkles size={20} /></button>
                  </div>
                </div>
                <div className="pt-6 border-t border-white/5 flex justify-end gap-4">
                  <button type="button" onClick={handleCloseDialog} className="btn-secondary">Cancel</button>
                  <button type="submit" disabled={submitting} className="btn-primary">
                    {submitting ? 'Saving...' : (selectedGenre ? 'Save' : 'Create')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {deleteDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setDeleteDialog(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="premium-card w-full max-w-sm text-center" onClick={e => e.stopPropagation()}
            >
              <div className="w-16 h-16 rounded-3xl bg-rose-500/10 flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="text-rose-500" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">Delete Category?</h3>
              <p className="text-sm text-zinc-500 mb-8 px-4">This will unlink all songs from <span className="text-white font-semibold">{deleteDialog.name}</span>. This action is permanent.</p>
              <div className="flex gap-4">
                <button onClick={() => setDeleteDialog(null)} className="flex-1 btn-secondary">Keep</button>
                <button onClick={handleDelete} className="flex-1 btn-primary !bg-rose-600 hover:!bg-rose-500">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GenreManagement;
