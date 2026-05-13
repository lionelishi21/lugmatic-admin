import React, { useState, useEffect, useRef } from 'react';
import {
  Search as SearchIcon, X, Music2, Mic2, BookOpen, TrendingUp,
  Clock, Play, Users, Heart, Star, ChevronRight, Loader2,
  SlidersHorizontal, Hash, Flame, Sparkles, LayoutGrid, Globe, Zap, History,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { searchService } from '../../services/searchService';
import genreService, { Genre } from '../../services/genreService';

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
  const sz = size === 'sm' ? 'w-10 h-10 text-xs' : 'w-12 h-12 text-sm';
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
    { key: 'all', label: 'Top Results', icon: <Globe size={16} />, count: MOCK_RESULTS.tracks.length + MOCK_RESULTS.artists.length + MOCK_RESULTS.podcasts.length },
    { key: 'tracks', label: 'Tracks', icon: <Music2 size={16} />, count: MOCK_RESULTS.tracks.length },
    { key: 'artists', label: 'Artists', icon: <Mic2 size={16} />, count: MOCK_RESULTS.artists.length },
    { key: 'podcasts', label: 'Podcasts', icon: <BookOpen size={16} />, count: MOCK_RESULTS.podcasts.length },
  ];

  const showTracks = tab === 'all' || tab === 'tracks';
  const showArtists = tab === 'all' || tab === 'artists';
  const showPodcasts = tab === 'all' || tab === 'podcasts';
  const activeFilterCount = (selectedGenre ? 1 : 0) + (sortBy !== 'relevance' ? 1 : 0);

  return (
    <div className="max-w-7xl mx-auto pb-24 space-y-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold tracking-tight text-white leading-none uppercase">Search</h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Active</span>
            </div>
          </div>
          <p className="text-zinc-500 font-medium">Discover new tracks, artists, and podcasts across the platform.</p>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative z-20">
        <div className={`premium-card !p-0 overflow-hidden border-white/5 shadow-2xl transition-all duration-300 ${showSuggestions && (suggestions.length > 0 || recentSearches.length > 0) ? 'rounded-b-none border-emerald-500/30 ring-4 ring-emerald-500/5' : ''}`}>
           <div className="flex items-center h-20 px-8 gap-6">
              {isSearching ? <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" /> : <SearchIcon className="w-6 h-6 text-zinc-600" />}
              <input
                type="text"
                value={query}
                onChange={e => { setQuery(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                onKeyDown={e => { if (e.key === 'Enter' && query.trim()) commitSearch(query); }}
                placeholder="Find music, people, or podcasts..."
                className="flex-1 bg-transparent text-white placeholder:text-zinc-700 text-base font-medium focus:outline-none"
              />
              {query && (
                <button onClick={() => { setQuery(''); setHasResults(false); setSuggestions([]); }} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/5 text-zinc-500 transition-all">
                  <X size={18} />
                </button>
              )}
              <div className="w-px h-8 bg-white/5" />
              <button onClick={() => setShowFilters(!showFilters)} className={`h-12 px-6 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 transition-all ${showFilters || activeFilterCount > 0 ? 'bg-white text-black shadow-xl' : 'bg-zinc-950 text-zinc-500 border border-white/5 hover:text-white'}`}>
                <SlidersHorizontal size={14} />
                Filters
                {activeFilterCount > 0 && <span className="w-4 h-4 rounded-full bg-emerald-500 text-black flex items-center justify-center text-[9px] font-bold">{activeFilterCount}</span>}
              </button>
           </div>
        </div>

        {/* Suggestions */}
        <AnimatePresence>
          {showSuggestions && (suggestions.length > 0 || recentSearches.length > 0) && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} className="absolute top-full left-0 right-0 premium-card !p-0 rounded-t-none border-t-0 border-white/5 shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden">
               {suggestions.length > 0 && (
                 <div className="p-4">
                   {suggestions.map((s, i) => (
                     <button key={i} onMouseDown={() => commitSearch(s)} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl hover:bg-white/5 transition-all text-left">
                       <SearchIcon size={16} className="text-zinc-600" />
                       <span className="text-sm font-bold text-white truncate">{s}</span>
                     </button>
                   ))}
                 </div>
               )}
               {recentSearches.length > 0 && (
                 <div className={`${suggestions.length > 0 ? 'border-t border-white/5' : ''} p-4 bg-zinc-950/20`}>
                    <div className="flex items-center justify-between px-5 py-3 mb-1">
                       <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Recent Searches</p>
                       <button onMouseDown={clearRecent} className="text-[9px] font-bold text-emerald-500 hover:text-emerald-400 uppercase tracking-widest">Clear All</button>
                    </div>
                    {recentSearches.slice(0, 5).map((s, i) => (
                      <div key={i} className="group flex items-center gap-4 px-5 py-3.5 rounded-2xl hover:bg-white/5 transition-all">
                        <History size={16} className="text-zinc-700" />
                        <button onMouseDown={() => commitSearch(s)} className="flex-1 text-sm font-bold text-zinc-400 text-left truncate">{s}</button>
                        <button onMouseDown={() => removeRecent(s)} className="opacity-0 group-hover:opacity-100 p-1 text-zinc-600 hover:text-rose-500 transition-all"><X size={14} /></button>
                      </div>
                    ))}
                 </div>
               )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Filter Options */}
      <AnimatePresence>
        {showFilters && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="premium-card border-white/5 shadow-2xl p-8 space-y-8">
             <div className="flex flex-wrap gap-12">
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Sort By</p>
                  <div className="flex gap-2">
                    {(['relevance', 'popular', 'newest'] as SortBy[]).map(s => (
                      <button key={s} onClick={() => setSortBy(s)} className={`h-11 px-6 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${sortBy === s ? 'bg-white text-black shadow-lg' : 'bg-zinc-950 text-zinc-500 border border-white/5 hover:text-white'}`}>{s}</button>
                    ))}
                  </div>
                </div>
                <div className="flex-1 space-y-4 min-w-[300px]">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Genres</p>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setSelectedGenre('')} className={`h-11 px-6 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${!selectedGenre ? 'bg-emerald-500 text-black shadow-lg' : 'bg-zinc-950 text-zinc-500 border border-white/5 hover:text-white'}`}>All Genres</button>
                    {genres.slice(0, 8).map(g => (
                      <button key={g._id} onClick={() => setSelectedGenre(g._id === selectedGenre ? '' : g._id)} className={`h-11 px-6 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${selectedGenre === g._id ? 'bg-emerald-500 text-black shadow-lg' : 'bg-zinc-950 text-zinc-500 border border-white/5 hover:text-white'}`}>{g.name}</button>
                    ))}
                  </div>
                </div>
             </div>
             {activeFilterCount > 0 && (
                <div className="pt-6 border-t border-white/5 flex justify-end">
                   <button onClick={() => { setSelectedGenre(''); setSortBy('relevance'); }} className="flex items-center gap-2 text-[10px] font-bold text-rose-500 uppercase tracking-widest hover:text-rose-400 transition-all"><X size={14} /> Reset Filters</button>
                </div>
             )}
          </motion.div>
        )}
      </AnimatePresence>

      {!query.trim() ? (
        /* Discovery Home */
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {recentSearches.length > 0 && (
                <div className="premium-card p-8 border-white/5 shadow-xl">
                   <h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-3 mb-6"><History size={16} className="text-zinc-600" /> Previous Searches</h2>
                   <div className="flex flex-wrap gap-3">
                     {recentSearches.map((s, i) => (
                       <button key={i} onClick={() => commitSearch(s)} className="px-5 py-2.5 bg-zinc-950 border border-white/5 rounded-2xl text-xs font-bold text-zinc-400 hover:text-white transition-all">{s}</button>
                     ))}
                   </div>
                </div>
              )}
              <div className="premium-card p-8 border-white/5 shadow-xl">
                 <h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-3 mb-6"><TrendingUp size={16} className="text-emerald-500" /> Popular Categories</h2>
                 <div className="flex flex-wrap gap-3">
                   {TRENDING_TERMS.map((term, i) => (
                     <button key={i} onClick={() => commitSearch(term)} className="px-5 py-2.5 bg-zinc-950 border border-white/5 rounded-2xl text-xs font-bold text-zinc-400 hover:text-emerald-500 transition-all flex items-center gap-2">
                       <Hash size={12} className="text-zinc-600" /> {term}
                     </button>
                   ))}
                 </div>
              </div>
           </div>

           <div className="premium-card p-10 border-white/5 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-bold text-white uppercase tracking-tight flex items-center gap-3"><Flame size={20} className="text-rose-500" /> Trending Now</h2>
                <button className="text-[10px] font-bold text-emerald-500 hover:text-emerald-400 uppercase tracking-widest flex items-center gap-2">View Full Chart <ChevronRight size={14} /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOCK_TRENDING.map(item => (
                  <div key={item.id} onClick={() => commitSearch(item.type === 'artist' ? (item as any).name : (item as any).title)} className="p-5 bg-zinc-950/40 rounded-[2rem] border border-white/5 hover:border-white/10 transition-all cursor-pointer group flex items-center gap-5">
                    {item.type === 'track' && <Avatar name={(item as any).title} size="sm" rounded="2xl" />}
                    {item.type === 'artist' && <Avatar name={(item as any).name} size="sm" rounded="full" />}
                    {item.type === 'podcast' && <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500"><BookOpen size={18} /></div>}
                    <div className="flex-1 min-w-0">
                       <p className="text-sm font-bold text-white truncate">{item.type === 'artist' ? (item as any).name : (item as any).title}</p>
                       <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-1">
                        {item.type === 'track' && `${(item as any).artist} • ${(item as any).plays} plays`}
                        {item.type === 'artist' && `${(item as any).followers} followers`}
                        {item.type === 'podcast' && `${(item as any).host}`}
                       </p>
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </div>
      ) : (
        /* Results View */
        <div className="space-y-10 animate-in fade-in duration-300">
           <div className="premium-card !p-0 overflow-hidden border-white/5 shadow-xl">
              <div className="flex items-center gap-2 p-4 bg-zinc-950/40 overflow-x-auto custom-scrollbar no-scrollbar">
                {tabs.map(t => (
                  <button key={t.key} onClick={() => setTab(t.key)} className={`h-12 px-6 rounded-2xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 transition-all shrink-0 ${tab === t.key ? 'bg-white text-black shadow-xl' : 'text-zinc-500 hover:text-white'}`}>
                    {t.icon} {t.label}
                    {hasResults && <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold ${tab === t.key ? 'bg-black text-white' : 'bg-zinc-900 text-zinc-600'}`}>{t.count}</span>}
                  </button>
                ))}
              </div>
           </div>

           {isSearching ? (
             <div className="flex flex-col items-center justify-center py-32 gap-6">
                <Loader2 size={40} className="text-emerald-500 animate-spin" />
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Searching for "{query}"</p>
             </div>
           ) : hasResults ? (
             <AnimatePresence mode="wait">
                <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-10">
                   
                   {/* Tracks */}
                   {showTracks && (
                     <div className="premium-card !p-0 overflow-hidden border-white/5 shadow-2xl">
                        <div className="px-10 py-6 border-b border-white/5 bg-zinc-950/20 flex items-center justify-between">
                           <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-3"><Music2 size={18} className="text-emerald-500" /> Tracks</h3>
                           {tab === 'all' && <button onClick={() => setTab('tracks')} className="text-[10px] font-bold text-zinc-500 hover:text-white uppercase tracking-widest transition-all">See All Results</button>}
                        </div>
                        <div className="divide-y divide-white/5">
                           {(tab === 'all' ? MOCK_RESULTS.tracks.slice(0, 4) : MOCK_RESULTS.tracks).map((track, i) => (
                             <div key={track.id} className="flex items-center gap-6 px-10 py-5 hover:bg-white/[0.02] transition-all group cursor-pointer">
                                <span className="w-6 text-[10px] font-bold text-zinc-700 text-center">{i + 1}</span>
                                <Avatar name={track.title} size="sm" rounded="2xl" />
                                <div className="flex-1 min-w-0">
                                   <p className="text-sm font-bold text-white truncate">{track.title}</p>
                                   <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-1">{track.artist} • {track.genre}</p>
                                </div>
                                <div className="hidden sm:flex flex-col items-end px-6">
                                   <p className="text-sm font-bold text-white tabular-nums">{track.plays}</p>
                                   <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Plays</p>
                                </div>
                                <p className="text-[10px] font-bold text-zinc-500 tabular-nums w-12 text-right">{track.duration}</p>
                                <div className="flex items-center gap-3 pl-4">
                                   <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-950 border border-white/5 text-zinc-600 hover:text-rose-500 transition-all"><Heart size={16} /></button>
                                   <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-black shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform"><Play size={18} className="fill-current" /></div>
                                </div>
                             </div>
                           ))}
                        </div>
                     </div>
                   )}

                   {/* Artists */}
                   {showArtists && (
                     <div className="premium-card !p-0 overflow-hidden border-white/5 shadow-2xl">
                        <div className="px-10 py-6 border-b border-white/5 bg-zinc-950/20 flex items-center justify-between">
                           <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-3"><Mic2 size={18} className="text-emerald-500" /> Artists</h3>
                           {tab === 'all' && <button onClick={() => setTab('artists')} className="text-[10px] font-bold text-zinc-500 hover:text-white uppercase tracking-widest transition-all">See All Artists</button>}
                        </div>
                        <div className="divide-y divide-white/5">
                           {(tab === 'all' ? MOCK_RESULTS.artists.slice(0, 3) : MOCK_RESULTS.artists).map(artist => (
                             <div key={artist.id} className="flex items-center gap-8 px-10 py-6 hover:bg-white/[0.02] transition-all group cursor-pointer">
                                <Avatar name={artist.name} size="md" rounded="full" />
                                <div className="flex-1 min-w-0">
                                   <div className="flex items-center gap-3">
                                      <p className="text-base font-bold text-white">{artist.name}</p>
                                      {artist.verified && <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-black"><Check size={10} strokeWidth={4} /></div>}
                                   </div>
                                   <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-2">{artist.followers} Followers • {artist.songs} Tracks • {artist.genre}</p>
                                </div>
                                <button className="h-12 px-8 bg-zinc-900 border border-white/5 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all">Profile</button>
                             </div>
                           ))}
                        </div>
                     </div>
                   )}

                   {/* Podcasts */}
                   {showPodcasts && (
                     <div className="premium-card !p-0 overflow-hidden border-white/5 shadow-2xl">
                        <div className="px-10 py-6 border-b border-white/5 bg-zinc-950/20 flex items-center justify-between">
                           <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-3"><BookOpen size={18} className="text-emerald-500" /> Podcasts</h3>
                           {tab === 'all' && <button onClick={() => setTab('podcasts')} className="text-[10px] font-bold text-zinc-500 hover:text-white uppercase tracking-widest transition-all">See All Results</button>}
                        </div>
                        <div className="divide-y divide-white/5">
                           {MOCK_RESULTS.podcasts.map(pod => (
                             <div key={pod.id} className="flex items-center gap-8 px-10 py-6 hover:bg-white/[0.02] transition-all group cursor-pointer">
                                <div className="w-14 h-14 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-xl"><BookOpen size={24} /></div>
                                <div className="flex-1 min-w-0">
                                   <p className="text-base font-bold text-white">{pod.title}</p>
                                   <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-2">Host: {pod.host} • {pod.episodes} Episodes • {pod.listeners} Weekly Listeners</p>
                                </div>
                                <button className="h-12 px-8 bg-zinc-950 border border-white/5 text-zinc-500 rounded-2xl text-xs font-bold uppercase tracking-widest hover:text-white hover:border-white/20 transition-all">Subscribe</button>
                             </div>
                           ))}
                        </div>
                     </div>
                   )}
                </motion.div>
             </AnimatePresence>
           ) : (
             <div className="premium-card py-32 text-center border-dashed border-white/5 bg-zinc-950/20 rounded-[3rem]">
                <div className="w-24 h-24 bg-zinc-900 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-white/5">
                   <SearchIcon size={40} className="text-zinc-800" />
                </div>
                <h4 className="text-xl font-bold text-white uppercase tracking-tight">No results found</h4>
                <p className="text-sm text-zinc-500 mt-3 max-w-sm mx-auto font-medium">We couldn't find anything matching "{query}". Try checking your spelling or using different keywords.</p>
                <div className="flex flex-wrap justify-center gap-3 mt-10">
                   {TRENDING_TERMS.slice(0, 4).map(t => (
                     <button key={t} onClick={() => commitSearch(t)} className="px-6 py-3 bg-zinc-950 border border-white/5 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-emerald-500 transition-all">{t}</button>
                   ))}
                </div>
             </div>
           )}
        </div>
      )}
    </div>
  );
}
