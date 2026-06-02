import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Clock, Users, X, Search, ChevronLeft } from 'lucide-react';
import { createPool, REALMS } from '../../services/regularClashService';
import { searchService } from '../../services/searchService';
import type { Artist } from '../../types';

export default function CreateRegularClashPool() {
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    season: 1,
    realm: 'dancehall',
    challengeDeadline: '',
    submissionDeadline: '',
    votingDeadline: '',
  });

  // Artist restrictions state
  const [isInviteOnly, setIsInviteOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Artist[]>([]);
  const [selectedArtists, setSelectedArtists] = useState<Artist[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  async function handleSearch(query: string) {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await searchService.searchArtists(query);
      setSearchResults(res.data?.data || []);
    } catch (err) {
      console.error(err);
    }
    setIsSearching(false);
  }

  function addArtist(artist: Artist) {
    if (!selectedArtists.find(a => a._id === artist._id)) {
      setSelectedArtists(prev => [...prev, artist]);
    }
    setSearchQuery('');
    setSearchResults([]);
  }

  function removeArtist(artistId: string) {
    setSelectedArtists(prev => prev.filter(a => a._id !== artistId));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCreateError(null);

    const cd = new Date(form.challengeDeadline);
    const sd = new Date(form.submissionDeadline);
    const vd = new Date(form.votingDeadline);

    if (cd >= sd) {
      setCreateError('Challenge deadline must be before submission deadline.');
      return;
    }
    if (sd >= vd) {
      setCreateError('Submission deadline must be before voting deadline.');
      return;
    }

    setCreating(true);
    try {
      await createPool({
        ...form,
        isInviteOnly,
        allowedArtists: isInviteOnly ? selectedArtists.map(a => {
          if (typeof a.user === 'string') return a.user;
          return (a.user as any)?._id || a._id;
        }) : [],
      });
      navigate('/admin/regular-clash-management');
    } catch (err: any) {
      setCreateError(err?.response?.data?.message || err?.message || 'Failed to create pool. Check your dates.');
    }
    setCreating(false);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button 
        onClick={() => navigate('/admin/regular-clash-management')}
        className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white mb-6 text-sm font-semibold"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Clash Management
      </button>

      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
          <Zap className="h-6 w-6 text-yellow-400" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white">Create New Clash Pool</h1>
          <p className="text-zinc-600 dark:text-zinc-400">Set up a new regular clash tournament bracket</p>
        </div>
      </div>

      {createError && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-medium">
          {createError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Details */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-5">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">1. Pool Details</h2>
          <div>
            <label className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold uppercase tracking-wider block mb-1.5">Title *</label>
            <input
              required
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:border-yellow-500/50 transition-colors"
              placeholder="e.g. Summer Dancehall Showdown"
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold uppercase tracking-wider block mb-1.5">Season</label>
              <input
                type="number"
                min={1}
                value={form.season}
                onChange={e => setForm(f => ({ ...f, season: Number(e.target.value) }))}
                className="w-full bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:border-yellow-500/50 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold uppercase tracking-wider block mb-1.5">Realm</label>
              <select
                value={form.realm}
                onChange={e => setForm(f => ({ ...f, realm: e.target.value }))}
                className="w-full bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:border-yellow-500/50 transition-colors appearance-none"
              >
                {REALMS.map(r => <option key={r} value={r} className="capitalize">{r}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Phase Deadlines */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">2. Phase Deadlines</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
            A regular clash runs in three phases. Set the deadline for when each phase strictly ends.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-black/30 p-5 rounded-xl border border-black/5 dark:border-white/5">
              <div className="flex items-center gap-2 text-yellow-400 mb-2">
                <Clock className="h-4 w-4" />
                <h3 className="font-bold text-sm">Challenge Deadline</h3>
              </div>
              <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
                The final date and time artists can challenge each other and accept invites to pair up.
              </p>
              <input 
                type="datetime-local" 
                required 
                value={form.challengeDeadline}
                onChange={e => setForm(f => ({ ...f, challengeDeadline: e.target.value }))}
                className="w-full bg-black/50 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-yellow-500/50"
              />
            </div>

            <div className="bg-black/30 p-5 rounded-xl border border-black/5 dark:border-white/5">
              <div className="flex items-center gap-2 text-emerald-400 mb-2">
                <Clock className="h-4 w-4" />
                <h3 className="font-bold text-sm">Submission Deadline</h3>
              </div>
              <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
                The final date and time paired artists have to record and submit their 6-second Shell It video.
              </p>
              <input 
                type="datetime-local" 
                required 
                value={form.submissionDeadline}
                onChange={e => setForm(f => ({ ...f, submissionDeadline: e.target.value }))}
                className="w-full bg-black/50 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div className="bg-black/30 p-5 rounded-xl border border-black/5 dark:border-white/5">
              <div className="flex items-center gap-2 text-purple-400 mb-2">
                <Clock className="h-4 w-4" />
                <h3 className="font-bold text-sm">Voting Deadline</h3>
              </div>
              <p className="text-xs text-zinc-500 mb-4 leading-relaxed">
                The final date and time fans can watch the battles and cast their votes for the winners.
              </p>
              <input 
                type="datetime-local" 
                required 
                value={form.votingDeadline}
                onChange={e => setForm(f => ({ ...f, votingDeadline: e.target.value }))}
                className="w-full bg-black/50 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-zinc-900 dark:text-white text-sm focus:outline-none focus:border-purple-500/50"
              />
            </div>
          </div>
        </div>

        {/* Artist Eligibility */}
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">3. Eligibility</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
            Determine who is allowed to participate in this clash pool.
          </p>

          <div className="flex bg-black/50 p-1 rounded-xl w-fit mb-6 border border-black/5 dark:border-white/5">
            <button
              type="button"
              onClick={() => setIsInviteOnly(false)}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${!isInviteOnly ? 'bg-yellow-500 text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
            >
              Open to Everyone
            </button>
            <button
              type="button"
              onClick={() => setIsInviteOnly(true)}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${isInviteOnly ? 'bg-yellow-500 text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
            >
              Invite Only
            </button>
          </div>

          {isInviteOnly && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search and select artists..."
                  value={searchQuery}
                  onChange={e => handleSearch(e.target.value)}
                  className="w-full bg-black/50 border border-black/10 dark:border-white/10 rounded-xl pl-11 pr-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:border-yellow-500/50"
                />
                
                {/* Search Dropdown */}
                {searchQuery && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-800 border border-black/10 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden z-20 max-h-60 overflow-y-auto">
                    {isSearching ? (
                      <div className="p-4 text-center text-sm text-zinc-500">Searching...</div>
                    ) : searchResults.length === 0 ? (
                      <div className="p-4 text-center text-sm text-zinc-500">No artists found.</div>
                    ) : (
                      searchResults.map(artist => (
                        <button
                          key={artist._id}
                          type="button"
                          onClick={() => addArtist(artist)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-black/5 dark:bg-white/5 transition-colors text-left"
                        >
                          {artist.image ? (
                            <img src={artist.image} alt="" className="w-8 h-8 rounded-full object-cover bg-zinc-900" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center">
                              <Users className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                            </div>
                          )}
                          <span className="text-sm font-bold text-zinc-900 dark:text-white">{artist.name}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Selected Artists Pills */}
              {selectedArtists.length > 0 && (
                <div className="bg-black/30 rounded-xl p-4 border border-black/5 dark:border-white/5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">
                    Allowed Artists ({selectedArtists.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedArtists.map(artist => (
                      <div key={artist._id} className="flex items-center gap-2 bg-zinc-800 border border-black/10 dark:border-white/10 rounded-full pl-1 pr-3 py-1">
                        {artist.image ? (
                          <img src={artist.image} alt="" className="w-5 h-5 rounded-full object-cover bg-zinc-900" />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-zinc-700 flex items-center justify-center">
                            <Users className="h-3 w-3 text-zinc-600 dark:text-zinc-400" />
                          </div>
                        )}
                        <span className="text-xs font-bold text-zinc-900 dark:text-white">{artist.name}</span>
                        <button 
                          type="button" 
                          onClick={() => removeArtist(artist._id)}
                          className="ml-1 text-zinc-500 hover:text-red-400"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedArtists.length === 0 && (
                <p className="text-sm text-yellow-500/80 italic">
                  No artists selected yet. If you save now, the pool will effectively be locked for everyone.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t border-black/10 dark:border-white/10">
          <button 
            type="button" 
            onClick={() => navigate('/admin/regular-clash-management')}
            className="px-6 py-3 rounded-xl font-bold text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={creating}
            className="px-8 py-3 rounded-xl font-black text-sm text-black bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 transition-colors shadow-lg shadow-yellow-500/20"
          >
            {creating ? 'Creating Pool...' : 'Launch Clash Pool'}
          </button>
        </div>
      </form>
    </div>
  );
}
