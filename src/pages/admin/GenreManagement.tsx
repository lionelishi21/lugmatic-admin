import React, { useState, useMemo, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import genreService, { Genre, CreateGenreData, UpdateGenreData } from '../../services/genreService';

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
      console.error('Failed to fetch genres:', error);
      toast.error('Failed to load genres. Please try again.');
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
    if (formRef.current) {
      formRef.current.reset();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;

    const formData = new FormData(formRef.current);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const color = formData.get('color') as string;
    const isActive = formData.get('status') === 'active';

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
        isActive,
      };

      if (selectedGenre) {
        await genreService.updateGenre(selectedGenre._id, data);
        toast.success('Genre updated successfully!');
      } else {
        await genreService.createGenre(data);
        toast.success('Genre created successfully!');
      }

      await fetchGenres();
      handleCloseDialog();
    } catch (error: any) {
      console.error('Failed to save genre:', error);
      toast.error(error?.response?.data?.message || 'Failed to save genre. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;

    try {
      await genreService.deleteGenre(deleteDialog._id);
      toast.success('Genre deleted successfully!');
      await fetchGenres();
      setDeleteDialog(null);
    } catch (error: any) {
      console.error('Failed to delete genre:', error);
      toast.error(error?.response?.data?.message || 'Failed to delete genre. Please try again.');
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

  const totalSongs = genres.reduce((sum, g) => sum + g.songCount, 0);
  const activeCount = genres.filter((g) => g.isActive).length;

  const colorMap: Record<string, { bg: string; text: string; ring: string; light: string }> = {
    rose: { bg: 'bg-rose-500', text: 'text-rose-600', ring: 'ring-rose-100', light: 'bg-rose-50' },
    orange: { bg: 'bg-orange-500', text: 'text-orange-600', ring: 'ring-orange-100', light: 'bg-orange-50' },
    violet: { bg: 'bg-violet-500', text: 'text-violet-600', ring: 'ring-violet-100', light: 'bg-violet-50' },
    cyan: { bg: 'bg-cyan-500', text: 'text-cyan-600', ring: 'ring-cyan-100', light: 'bg-cyan-50' },
    amber: { bg: 'bg-amber-500', text: 'text-amber-600', ring: 'ring-amber-100', light: 'bg-amber-50' },
    emerald: { bg: 'bg-emerald-500', text: 'text-emerald-600', ring: 'ring-emerald-100', light: 'bg-emerald-50' },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Genre Management</h1>
          <p className="text-sm text-gray-500 mt-1">Organize and manage music categories</p>
        </div>
        <button
          onClick={() => handleOpenDialog()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Add Genre
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            label: 'Total Genres', value: genres.length, icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" /></svg>
            ), color: 'green'
          },
          {
            label: 'Active', value: activeCount, icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            ), color: 'emerald'
          },
          {
            label: 'Total Songs', value: totalSongs, icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
            ), color: 'blue'
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${stat.color === 'green' ? 'bg-green-50 text-green-600' :
              stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                'bg-blue-50 text-blue-600'
              }`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 w-full">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              type="text"
              placeholder="Search genres..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50/80 border-0 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:bg-white transition-colors"
            />
          </div>
          {/* Status filter */}
          <div className="flex items-center gap-1 bg-gray-100/80 rounded-xl p-1">
            {(['all', 'active', 'inactive'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${statusFilter === s ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                {s}
              </button>
            ))}
          </div>
          {/* View toggle */}
          <div className="flex items-center gap-1 bg-gray-100/80 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>
        </div>

        {/* Grid View */}
        {viewMode === 'grid' ? (
          <div className="p-4 pt-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGenres.map((genre) => {
              const c = colorMap[genre.color] || colorMap.emerald;
              return (
                <div
                  key={genre.id}
                  className="group relative rounded-2xl border border-gray-100 bg-white p-5 hover:shadow-md transition-all duration-200"
                >
                  {/* Status dot */}
                  <div className={`absolute top-4 right-4 w-2 h-2 rounded-full ${genre.status === 'active' ? 'bg-green-400' : 'bg-gray-300'}`} />

                  {/* Icon + Name */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-11 h-11 rounded-xl ${c.light} flex items-center justify-center text-xl ring-4 ${c.ring}`}>
                      {genre.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{genre.name}</h3>
                      <span className={`text-xs font-medium capitalize ${genre.status === 'active' ? 'text-green-600' : 'text-gray-400'}`}>
                        {genre.status}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2">{genre.description}</p>

                  {/* Stats */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 text-center rounded-xl bg-gray-50/80 py-2">
                      <p className="text-sm font-bold text-gray-900">{genre.songCount}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Songs</p>
                    </div>
                    <div className="flex-1 text-center rounded-xl bg-gray-50/80 py-2">
                      <p className="text-sm font-bold text-gray-900">{genre.albumCount}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Albums</p>
                    </div>
                    <div className="flex-1 text-center rounded-xl bg-gray-50/80 py-2">
                      <p className="text-sm font-bold text-gray-900">{genre.artistCount}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Artists</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenDialog(genre)}
                      className="flex-1 py-1.5 text-xs font-medium text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteDialog(genre)}
                      className="flex-1 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Add genre card */}
            <button
              onClick={() => handleOpenDialog()}
              className="rounded-2xl border-2 border-dashed border-gray-200 p-5 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-green-300 hover:text-green-500 transition-colors min-h-[220px]"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
              <span className="text-sm font-medium">Add New Genre</span>
            </button>
          </div>
        ) : (
          /* List View */
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-t border-gray-100">
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Genre</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Songs</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Albums</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Artists</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Updated</th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredGenres.map((genre) => {
                  const c = colorMap[genre.color] || colorMap.emerald;
                  return (
                    <tr key={genre.id} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg ${c.light} flex items-center justify-center text-base`}>
                            {genre.icon}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{genre.name}</p>
                            <p className="text-xs text-gray-400 line-clamp-1 max-w-[200px]">{genre.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm font-medium text-gray-700">{genre.songCount}</td>
                      <td className="px-5 py-3.5 text-sm font-medium text-gray-700">{genre.albumCount}</td>
                      <td className="px-5 py-3.5 text-sm font-medium text-gray-700">{genre.artistCount}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${genre.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${genre.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                          {genre.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-400">
                        {new Date(genre.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleOpenDialog(genre)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button
                            onClick={() => setDeleteDialog(genre)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredGenres.length === 0 && (
              <div className="py-16 text-center">
                <svg className="w-12 h-12 text-gray-200 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" /></svg>
                <p className="text-sm text-gray-400">No genres found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      {openDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={handleCloseDialog}>
          <div className="w-full max-w-md mx-4 rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 pb-0">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-lg font-bold text-gray-900">{selectedGenre ? 'Edit Genre' : 'New Genre'}</h2>
                <button onClick={handleCloseDialog} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <p className="text-sm text-gray-400 mb-5">{selectedGenre ? 'Update genre details' : 'Add a new music category'}</p>
            </div>
            <form ref={formRef} onSubmit={handleSubmit} className="px-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Genre Name</label>
                <input
                  name="name"
                  defaultValue={selectedGenre?.name}
                  placeholder="e.g. Afrobeats"
                  className="w-full rounded-xl bg-gray-50/80 border-0 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea
                  name="description"
                  defaultValue={selectedGenre?.description}
                  placeholder="Brief description of this genre..."
                  rows={3}
                  className="w-full rounded-xl bg-gray-50/80 border-0 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:bg-white transition-colors resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Color Theme</label>
                <select
                  name="color"
                  defaultValue={selectedGenre?.color || 'emerald'}
                  className="w-full rounded-xl bg-gray-50/80 border-0 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:bg-white transition-colors"
                >
                  <option value="rose">Rose</option>
                  <option value="orange">Orange</option>
                  <option value="violet">Violet</option>
                  <option value="cyan">Cyan</option>
                  <option value="amber">Amber</option>
                  <option value="emerald">Emerald</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                <select
                  name="status"
                  defaultValue={selectedGenre?.isActive ? 'active' : 'inactive'}
                  className="w-full rounded-xl bg-gray-50/80 border-0 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:bg-white transition-colors"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseDialog}
                  className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 text-sm font-medium bg-green-600 text-white hover:bg-green-700 rounded-xl transition-colors shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : (selectedGenre ? 'Save Changes' : 'Create Genre')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setDeleteDialog(null)}>
          <div className="w-full max-w-sm mx-4 rounded-2xl bg-white shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-1">Delete "{deleteDialog.name}"?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              This will remove the genre and unlink {deleteDialog.songCount} songs. This action cannot be undone.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeleteDialog(null)}
                className="flex-1 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 text-sm font-medium bg-red-600 text-white hover:bg-red-700 rounded-xl transition-colors shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenreManagement;
