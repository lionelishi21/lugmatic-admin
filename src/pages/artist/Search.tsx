import React, { useState, useEffect, useRef } from 'react';
import {
  Search as SearchIcon, X, Music2, Mic2, BookOpen, TrendingUp,
  Clock, Play, Users, Heart, Star, ChevronRight, Loader2,
  SlidersHorizontal, Hash, Flame, Sparkles, LayoutGrid, Globe, Zap, History
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchService } from '../../services/searchService';
import genreService, { Genre } from '../../services/genreService';

const card = 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] rounded-lg';

type Tab = 'all' | 'tracks' | 'artists' | 'podcasts';
type SortBy = 'relevance' | 'popular' | 'newest';

const TRENDING_TERMS = ['Lo-fi beats', 'Afrobeats', 'Indie pop', 'R&B slow jams', 'Jazz fusion', 'Trap soul'];

const MOCK_TRENDING = [
  { id: '1', type: 'track', title: 'Midnight Dreams', artist: 'Luna Ray', plays: '2.4M', genre: 'Indie Pop' },
  { id: '2', type: 'track', title: 'Golden Hour', artist: 'Solar Keys', plays: '1.8M', genre: 'R&B' },
  { id: '3', type: 'artist', name: 'Neon Sage', followers: '340K', genre: 'Electronic' },
  { id: '4', type: 'track', title: 'Deep Waters', artist: 'Blue Tide', plays: '980K', genre: 'Lo-Fi' },
  { id: '5', type: 'podcast', title: 'The Indie Route', host: 'Maya Chen', episodes: 84 },
  { id: '6', type: 'artist', name: 'Cali Bloom', followers: '210K', genre: 'Afrobeats' },
];

const MOCK_RESULTS = {
  tracks: [
    { id: 't1', title: 'Neon Lights', artist: 'The Arcade', duration: '3:42', plays: '1.2M', genre: 'Synth Pop' },
    { id: 't2', title: 'Slow Burn', artist: 'Ember Fox', duration: '4:05', plays: '890K', genre: 'R&B' },
    { id: 't3', title: 'Rise Again', artist: 'Echo Valley', duration: '3:18', plays: '650K', genre: 'Pop Rock' },
    { id: 't4', title: 'Drift Away', artist: 'Cloud Nine', duration: '5:20', plays: '430K', genre: 'Lo-Fi' },
    { id: 't5', title: 'Midnight City', artist: 'Urban Pulse', duration: '3:55', plays: '310K', genre: 'Electronic' },
    { id: 't6', title: 'Warm Embrace', artist: 'Soul Sisters', duration: '4:12', plays: '275K', genre: 'Soul' },
  ],
  artists: [
    { id: 'a1', name: 'The Arcade', followers: '1.4M', songs: 42, genre: 'Synth Pop', verified: true },
    { id: 'a2', name: 'Ember Fox', followers: '890K', songs: 28, genre: 'R&B', verified: true },
    { id: 'a3', name: 'Echo Valley', followers: '560K', songs: 35, genre: 'Pop Rock', verified: false },
    { id: 'a4', name: 'Cloud Nine', followers: '340K', songs: 19, genre: 'Lo-Fi', verified: false },
  ],
  podcasts: [
    { id: 'p1', title: 'Sound Theory', host: 'David Miles', episodes: 120, listeners: '45K' },
    { id: 'p2', title: 'Beat Lab Radio', host: 'Kai Storm', episodes: 88, listeners: '32K' },
    { id: 'p3', title: 'Artist Stories', host: 'Priya Nair', episodes: 54, listeners: '28K' },
  ],
};

const COLOR_PAIRS = [
  'from-violet-500 to-purple-600',
  'from-blue-500 to-cyan-600',
  'from-emerald-500 to-green-600',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-600',
  'from-indigo-500 to-blue-600',
];

function getColor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) & 0xffffffff;
  return COLOR_PAIRS[Math.abs(h) % COLOR_PAIRS.length];
}

function Avatar({ name, size = 'md', rounded = 'xl' }: { name: string; size?: 'sm' | 'md'; rounded?: string }) {
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const sz = size === 'sm' ? 'w-9 h-9 text-xs' : 'w-11 h-11 text-sm';
  return (
    <div className={`flex-shrink-0 rounded-${rounded} bg-gradient-to-br ${getColor(name)} flex items-center justify-center font-bold text-white shadow-lg ${sz}`}>
      {initials}
    </div>
  );
}

export default function Search() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [tab, setTab] = useState<Tab>('all');
  const [sortBy, setSortBy] = useState<SortBy>('relevance');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('lugmatic_recent_searches') || '[]'); } catch { return []; }
  });
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    genreService.getAllGenres().then(g => setGenres(g.filter(x => x.isActive))).catch(() => {});
  }, []);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedQuery(query), 350);
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, [query]);

  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      searchService.getSearchSuggestions(debouncedQuery)
        .then(res => { const d = (res as any)?.data; setSuggestions(Array.isArray(d) ? d.slice(0, 5) : []); })
        .catch(() => setSuggestions([]));
    } else {
      setSuggestions([]);
    }
  }, [debouncedQuery]);

  useEffect(() => {
    if (!debouncedQuery.trim()) { setHasResults(false); setIsSearching(false); return; }
    setIsSearching(true);
    const filters = { ...(selectedGenre && { genre: selectedGenre }), ...(sortBy !== 'relevance' && { sortBy }) };
    searchService.globalSearch(debouncedQuery, 1, 20, filters as any)
      .then(() => setHasResults(true))
      .catch(() => setHasResults(true))
      .finally(() => setIsSearching(false));
  }, [debouncedQuery, selectedGenre, sortBy]);

  const commitSearch = (val: string) => {
    setQuery(val);
    setShowSuggestions(false);
    if (val.trim() && !recentSearches.includes(val.trim())) {
      const updated = [val.trim(), ...recentSearches].slice(0, 8);
      setRecentSearches(updated);
      localStorage.setItem('lugmatic_recent_searches', JSON.stringify(updated));
    }
  };

  const clearRecent = () => { setRecentSearches([]); localStorage.removeItem('lugmatic_recent_searches'); };
  const removeRecent = (s: string) => {
    const updated = recentSearches.filter(r => r !== s);
    setRecentSearches(updated);
    localStorage.setItem('lugmatic_recent_searches', JSON.stringify(updated));
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode; count: number }[] = [
    { key: 'all', label: 'Global Intel', icon: <Globe className="h-3.5 w-3.5" />, count: MOCK_RESULTS.tracks.length + MOCK_RESULTS.artists.length + MOCK_RESULTS.podcasts.length },
    { key: 'tracks', label: 'Audio Tracks', icon: <Music2 className="h-3.5 w-3.5" />, count: MOCK_RESULTS.tracks.length },
    { key: 'artists', label: 'Vocal Entities', icon: <Mic2 className="h-3.5 w-3.5" />, count: MOCK_RESULTS.artists.length },
    { key: 'podcasts', label: 'Spoken Signals', icon: <BookOpen className="h-3.5 w-3.5" />, count: MOCK_RESULTS.podcasts.length },
  ];

  const showTracks = tab === 'all' || tab === 'tracks';
  const showArtists = tab === 'all' || tab === 'artists';
  const showPodcasts = tab === 'all' || tab === 'podcasts';
  const activeFilterCount = (selectedGenre ? 1 : 0) + (sortBy !== 'relevance' ? 1 : 0);

  return (
    <div className="max-w-5xl mx-auto pb-16 space-y-6">

      {/* ── Header Card ── */}
      <div className={`${card} p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6`}>
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
            <Globe className="h-7 w-7 text-white" />
          </div>
          <div>
             <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1 italic">Intelligence Network</p>
             <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight uppercase italic">
               Search & Discovery
             </h1>
             <p className="text-sm text-zinc-500 mt-0.5">
               Find audio signals, entities, and broadcasts across the global node.
             </p>
          </div>
        </div>
      </div>

      {/* ── Search Bar HUD ── */}
      <div className="relative group">
        <div className={`flex items-center gap-4 bg-white dark:bg-zinc-900 shadow-xl border transition-all duration-300 px-6 py-4 rounded-2xl ${
          showSuggestions && (suggestions.length > 0 || recentSearches.length > 0)
            ? 'border-emerald-500 ring-4 ring-emerald-500/10 rounded-b-none'
            : 'border-zinc-200 dark:border-white/[0.06] focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10'
        }`}>
          {isSearching
            ? <Loader2 className="h-5 w-5 text-emerald-500 animate-spin flex-shrink-0" />
            : <SearchIcon className="h-5 w-5 text-zinc-400 flex-shrink-0 group-focus-within:text-emerald-500 transition-colors" />}
          <input
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            onKeyDown={e => { if (e.key === 'Enter' && query.trim()) commitSearch(query); }}
            placeholder="SCAN FOR ENTITIES, AUDIO, OR SIGNALS..."
            className="flex-1 bg-transparent text-zinc-900 dark:text-white placeholder:text-zinc-500 text-[11px] font-black uppercase tracking-widest focus:outline-none"
          />
          {query && (
            <button onClick={() => { setQuery(''); setHasResults(false); setSuggestions([]); }}
              className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-all">
              <X className="h-4 w-4" />
            </button>
          )}
          <div className="h-6 w-px bg-zinc-200 dark:bg-white/10 mx-1" />
          <button onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
              showFilters || activeFilterCount > 0
                ? 'bg-emerald-500 text-white border-emerald-400/20 shadow-lg shadow-emerald-500/20'
                : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-white/10 text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
            }`}>
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Parameters
            {activeFilterCount > 0 && (
              <span className="bg-white text-emerald-500 rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-black shadow-sm">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Suggestions dropdown */}
        <AnimatePresence>
          {showSuggestions && (suggestions.length > 0 || recentSearches.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 right-0 bg-white dark:bg-zinc-900 border border-emerald-500 border-t-0 rounded-b-2xl shadow-2xl z-50 overflow-hidden"
            >
              {suggestions.length > 0 && (
                <div className="p-3">
                  {suggestions.map((s, i) => (
                    <button key={i} onMouseDown={() => commitSearch(s)}
                      className="w-full flex items-center gap-4 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-emerald-500 hover:bg-emerald-500/5 rounded-xl transition-all text-left">
                      <SearchIcon className="h-4 w-4 text-zinc-400 flex-shrink-0" />
                      <span className="flex-1 truncate">{s}</span>
                    </button>
                  ))}
                </div>
              )}
              {recentSearches.length > 0 && (
                <div className={`${suggestions.length > 0 ? 'border-t border-zinc-100 dark:border-white/5' : ''} p-3`}>
                  <div className="flex items-center justify-between px-4 py-2 mb-2">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic">Mission History</span>
                    <button onMouseDown={clearRecent} className="text-[9px] font-black text-emerald-500 hover:text-emerald-400 uppercase tracking-widest">Wipe Data</button>
                  </div>
                  {recentSearches.slice(0, 5).map((s, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-white/[0.02] rounded-xl group transition-all">
                      <Clock className="h-3.5 w-3.5 text-zinc-400 flex-shrink-0" />
                      <button onMouseDown={() => commitSearch(s)} className="flex-1 text-[10px] font-black text-zinc-700 dark:text-zinc-300 text-left truncate uppercase tracking-widest">{s}</button>
                      <button onMouseDown={() => removeRecent(s)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-rose-500 transition-all">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Filters panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className={`${card} p-6 shadow-xl`}>
              <div className="flex flex-wrap gap-8 items-start">
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">Protocol Sorting</p>
                  <div className="flex gap-2">
                    {(['relevance', 'popular', 'newest'] as SortBy[]).map(s => (
                      <button key={s} onClick={() => setSortBy(s)}
                        className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                          sortBy === s ? 'bg-emerald-500 text-white border-emerald-400/20 shadow-lg shadow-emerald-500/10' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-white/10 text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                        }`}>{s}</button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3 flex-1 min-w-[280px]">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">Genre Filtering</p>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setSelectedGenre('')}
                      className={`px-5 py-2 rounded-xl text-[10px] font-black transition-all border uppercase tracking-widest ${
                        !selectedGenre ? 'bg-emerald-500 text-white border-emerald-400/20 shadow-lg shadow-emerald-500/10' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-white/10 text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                      }`}>Global</button>
                    {genres.slice(0, 10).map(g => (
                      <button key={g._id} onClick={() => setSelectedGenre(g._id === selectedGenre ? '' : g._id)}
                        className={`px-5 py-2 rounded-xl text-[10px] font-black transition-all border uppercase tracking-widest ${
                          selectedGenre === g._id ? 'bg-emerald-500 text-white border-emerald-400/20 shadow-lg shadow-emerald-500/10' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-white/10 text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                        }`}>{g.name}</button>
                    ))}
                  </div>
                </div>
                {activeFilterCount > 0 && (
                  <div className="ml-auto self-end pb-1">
                    <button onClick={() => { setSelectedGenre(''); setSortBy('relevance'); }}
                      className="text-[10px] font-black text-rose-500 hover:text-rose-400 transition-all flex items-center gap-2 uppercase tracking-widest">
                      <X className="h-3.5 w-3.5" /> Reset Parameters
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No query — discovery state */}
      {!query.trim() && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Recent Searches */}
             {recentSearches.length > 0 && (
               <div className={`${card} p-6`}>
                 <div className="flex items-center justify-between mb-5">
                   <h2 className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-widest flex items-center gap-3 italic">
                     <History className="h-4 w-4 text-emerald-500" /> Recent Inquiries
                   </h2>
                   <button onClick={clearRecent} className="text-[9px] font-black text-zinc-400 hover:text-rose-500 uppercase tracking-widest transition-colors">Wipe All</button>
                 </div>
                 <div className="flex flex-wrap gap-2.5">
                   {recentSearches.map((s, i) => (
                     <div key={i} className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/5 rounded-xl pl-4 pr-2 py-2 group hover:border-emerald-500/30 transition-all cursor-pointer shadow-sm">
                       <button onClick={() => commitSearch(s)} className="text-[10px] font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-widest">{s}</button>
                       <button onClick={() => removeRecent(s)}
                         className="p-1 text-zinc-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                         <X className="h-3.5 w-3.5" />
                       </button>
                     </div>
                   ))}
                 </div>
               </div>
             )}

             {/* Trending Terms */}
             <div className={`${card} p-6`}>
               <h2 className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-widest flex items-center gap-3 mb-5 italic">
                 <TrendingUp className="h-4 w-4 text-emerald-500" /> Hot Sectors
               </h2>
               <div className="flex flex-wrap gap-2.5">
                 {TRENDING_TERMS.map((term, i) => (
                   <button key={i} onClick={() => commitSearch(term)}
                     className="flex items-center gap-2 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 hover:bg-emerald-500/10 border border-zinc-200 dark:border-white/5 hover:border-emerald-500/30 text-zinc-600 dark:text-zinc-400 hover:text-emerald-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-sm">
                     <Hash className="h-3.5 w-3.5" />{term}
                   </button>
                 ))}
               </div>
             </div>
          </div>

          <div className={`${card} p-6`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-widest flex items-center gap-3 italic">
                <Flame className="h-4 w-4 text-rose-500" /> Live Trending Matrix
              </h2>
              <button className="text-[10px] font-black text-emerald-500 hover:text-emerald-400 uppercase tracking-widest flex items-center gap-1 transition-all">
                Full Feed <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {MOCK_TRENDING.map((item, idx) => (
                <div key={item.id}
                  onClick={() => commitSearch(item.type === 'artist' ? (item as any).name : (item as any).title)}
                  className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-white/[0.01] hover:bg-emerald-500/[0.02] border border-zinc-100 dark:border-white/[0.03] hover:border-emerald-500/20 rounded-2xl cursor-pointer transition-all duration-300 group shadow-sm"
                >
                  {item.type === 'track' && <Avatar name={(item as any).title} size="sm" rounded="lg" />}
                  {item.type === 'artist' && <Avatar name={(item as any).name} size="sm" />}
                  {item.type === 'podcast' && (
                    <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg">
                      <BookOpen className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black text-zinc-900 dark:text-white truncate uppercase tracking-tight italic">
                      {item.type === 'artist' ? (item as any).name : (item as any).title}
                    </p>
                    <p className="text-[9px] text-zinc-500 font-bold truncate uppercase tracking-widest mt-1">
                      {item.type === 'track' && `${(item as any).artist} • ${(item as any).plays} plays`}
                      {item.type === 'artist' && `${(item as any).followers} followers • ${(item as any).genre}`}
                      {item.type === 'podcast' && `${(item as any).host} • ${(item as any).episodes} eps`}
                    </p>
                  </div>
                  {item.type === 'track' && (
                    <div className="opacity-0 group-hover:opacity-100 w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 transition-all duration-300">
                      <Play className="h-4 w-4 text-white fill-current ml-0.5" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {query.trim() && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Result Tabs HUD */}
          <div className={`${card} px-6 py-4`}>
            <div className="flex items-center gap-2 flex-wrap">
              {tabs.map(t => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    tab === t.key
                      ? 'bg-emerald-500 text-white border border-emerald-400/20 shadow-lg shadow-emerald-500/20'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-white/[0.02]'
                  }`}>
                  {t.icon}{t.label}
                  {hasResults && (
                    <span className={`px-1.5 py-0.5 rounded-md text-[9px] ${
                      tab === t.key ? 'bg-white text-emerald-500 shadow-sm' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                    }`}>{t.count}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {isSearching && (
            <div className="flex items-center justify-center py-24">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                  <Loader2 className="h-6 w-6 text-emerald-500 animate-spin" />
                </div>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">Synchronizing Query: "{query}"</p>
              </div>
            </div>
          )}

          {!isSearching && hasResults && (
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }} className="space-y-6">

                {/* Tracks Result Block */}
                {showTracks && (
                  <div className={`${card} overflow-hidden shadow-xl`}>
                    <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 dark:border-white/[0.06] bg-zinc-50/30 dark:bg-white/[0.01]">
                      <h3 className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-widest flex items-center gap-3 italic">
                        <Music2 className="h-4 w-4 text-emerald-500" /> Primary Audio Syncs
                      </h3>
                      {tab === 'all' && (
                        <button onClick={() => setTab('tracks')}
                          className="text-[10px] font-black text-emerald-500 hover:text-emerald-400 uppercase tracking-widest flex items-center gap-1 transition-all">
                          Expand Sync <ChevronRight className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <div className="divide-y divide-zinc-100 dark:divide-white/[0.04]">
                      {(tab === 'all' ? MOCK_RESULTS.tracks.slice(0, 4) : MOCK_RESULTS.tracks).map((track, i) => (
                        <div key={track.id}
                          className="flex items-center gap-5 px-6 py-4 hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-all group cursor-pointer"
                        >
                          <span className="w-6 text-[10px] font-black text-zinc-400 text-center flex-shrink-0 italic">{(i + 1).toString().padStart(2, '0')}</span>
                          <Avatar name={track.title} size="sm" rounded="lg" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-tight italic truncate">{track.title}</p>
                            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1">{track.artist} • {track.genre}</p>
                          </div>
                          <div className="hidden sm:flex flex-col items-end pr-6">
                             <span className="text-[11px] font-black text-zinc-900 dark:text-white tabular-nums tracking-tighter">{track.plays}</span>
                             <span className="text-[8px] text-zinc-500 font-black uppercase tracking-widest italic">Syncs</span>
                          </div>
                          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter tabular-nums w-10 text-right">{track.duration}</span>
                          <div className="flex items-center gap-2 pl-4">
                            <button className="p-2 text-zinc-400 hover:text-rose-500 transition-all">
                              <Heart className="h-4 w-4" />
                            </button>
                            <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                              <Play className="h-4 w-4 text-white fill-current ml-0.5" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Artists Result Block */}
                {showArtists && (
                  <div className={`${card} overflow-hidden shadow-xl`}>
                    <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 dark:border-white/[0.06] bg-zinc-50/30 dark:bg-white/[0.01]">
                      <h3 className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-widest flex items-center gap-3 italic">
                        <Mic2 className="h-4 w-4 text-emerald-500" /> Active Entities
                      </h3>
                      {tab === 'all' && (
                        <button onClick={() => setTab('artists')}
                          className="text-[10px] font-black text-emerald-500 hover:text-emerald-400 uppercase tracking-widest flex items-center gap-1 transition-all">
                          Expand Entities <ChevronRight className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <div className="divide-y divide-zinc-100 dark:divide-white/[0.04]">
                      {(tab === 'all' ? MOCK_RESULTS.artists.slice(0, 3) : MOCK_RESULTS.artists).map(artist => (
                        <div key={artist.id}
                          className="flex items-center gap-6 px-6 py-5 hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-all group cursor-pointer"
                        >
                          <Avatar name={artist.name} size="md" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3">
                              <p className="text-[12px] font-black text-zinc-900 dark:text-white uppercase tracking-tight italic">{artist.name}</p>
                              {artist.verified && (
                                <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm shadow-emerald-500/20">
                                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12">
                                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1.5">{artist.followers} Units • {artist.songs} Components • {artist.genre}</p>
                          </div>
                          <button className="h-9 px-6 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-lg">
                            Track Entity
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Podcasts Result Block */}
                {showPodcasts && (
                  <div className={`${card} overflow-hidden shadow-xl`}>
                    <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 dark:border-white/[0.06] bg-zinc-50/30 dark:bg-white/[0.01]">
                      <h3 className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-widest flex items-center gap-3 italic">
                        <BookOpen className="h-4 w-4 text-emerald-500" /> Broadcast Signals
                      </h3>
                      {tab === 'all' && (
                        <button onClick={() => setTab('podcasts')}
                          className="text-[10px] font-black text-emerald-500 hover:text-emerald-400 uppercase tracking-widest flex items-center gap-1 transition-all">
                          Expand Signals <ChevronRight className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <div className="divide-y divide-zinc-100 dark:divide-white/[0.04]">
                      {MOCK_RESULTS.podcasts.map(pod => (
                        <div key={pod.id}
                          className="flex items-center gap-6 px-6 py-5 hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-all group cursor-pointer"
                        >
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
                            <BookOpen className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-black text-zinc-900 dark:text-white uppercase tracking-tight italic truncate">{pod.title}</p>
                            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-1.5">Entity: {pod.host} • {pod.episodes} Signals • {pod.listeners} Pulse Index</p>
                          </div>
                          <button className="h-9 px-6 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:text-emerald-500 border border-transparent hover:border-emerald-500/20 transition-all">
                             Subscribe Sync
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}

          {!isSearching && !hasResults && (
            <div className={`${card} py-24 flex flex-col items-center justify-center text-center px-6 border-dashed border-zinc-200 dark:border-white/10 shadow-inner`}>
              <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-800 rounded-3xl flex items-center justify-center mb-6 border border-zinc-100 dark:border-white/5">
                <SearchIcon className="h-10 w-10 text-zinc-400" />
              </div>
              <p className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight italic mb-2">Zero Signal Identity</p>
              <p className="text-xs text-zinc-500 max-w-xs font-medium leading-relaxed">System parameters for "{query}" returned zero matches in current node sectors.</p>
              <div className="flex flex-wrap justify-center gap-3 mt-8">
                {TRENDING_TERMS.slice(0, 4).map((t, i) => (
                  <button key={i} onClick={() => commitSearch(t)}
                    className="px-5 py-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 text-zinc-500 font-black text-[10px] uppercase tracking-widest rounded-xl hover:text-emerald-500 hover:border-emerald-500/30 transition-all">
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
