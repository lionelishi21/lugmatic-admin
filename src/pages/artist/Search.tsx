import React, { useState, useEffect, useRef } from 'react';
import {
  Search as SearchIcon, X, Music2, Mic2, BookOpen, TrendingUp,
  Clock, Play, Users, Heart, Star, ChevronRight, Loader2,
  SlidersHorizontal, Hash, Flame, Sparkles
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
  const sz = size === 'sm' ? 'w-9 h-9 text-xs' : 'w-11 h-11 text-sm';
  return (
    <div className={`flex-shrink-0 rounded-${rounded} bg-gradient-to-br ${getColor(name)} flex items-center justify-center font-bold text-white ${sz}`}>
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

  // Debounce query
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedQuery(query), 350);
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, [query]);

  // Fetch suggestions
  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      searchService.getSearchSuggestions(debouncedQuery)
        .then(res => { const d = (res as any)?.data; setSuggestions(Array.isArray(d) ? d.slice(0, 5) : []); })
        .catch(() => setSuggestions([]));
    } else {
      setSuggestions([]);
    }
  }, [debouncedQuery]);

  // Trigger search
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
    { key: 'all', label: 'All', icon: <Sparkles className="h-3.5 w-3.5" />, count: MOCK_RESULTS.tracks.length + MOCK_RESULTS.artists.length + MOCK_RESULTS.podcasts.length },
    { key: 'tracks', label: 'Tracks', icon: <Music2 className="h-3.5 w-3.5" />, count: MOCK_RESULTS.tracks.length },
    { key: 'artists', label: 'Artists', icon: <Mic2 className="h-3.5 w-3.5" />, count: MOCK_RESULTS.artists.length },
    { key: 'podcasts', label: 'Podcasts', icon: <BookOpen className="h-3.5 w-3.5" />, count: MOCK_RESULTS.podcasts.length },
  ];

  const showTracks = tab === 'all' || tab === 'tracks';
  const showArtists = tab === 'all' || tab === 'artists';
  const showPodcasts = tab === 'all' || tab === 'podcasts';
  const activeFilterCount = (selectedGenre ? 1 : 0) + (sortBy !== 'relevance' ? 1 : 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg shadow-green-500/20">
          <SearchIcon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Search & Discovery</h1>
          <p className="text-gray-500 text-sm">Find tracks, artists, and podcasts</p>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative">
        <div className={`flex items-center gap-3 bg-white shadow-sm border transition-all duration-200 px-4 py-3 ${
          showSuggestions && (suggestions.length > 0 || recentSearches.length > 0)
            ? 'border-green-400 ring-2 ring-green-400/20 rounded-t-2xl rounded-b-none'
            : 'rounded-2xl border-gray-200 focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-400/20'
        }`}>
          {isSearching
            ? <Loader2 className="h-5 w-5 text-green-500 animate-spin flex-shrink-0" />
            : <SearchIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />}
          <input
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            onKeyDown={e => { if (e.key === 'Enter' && query.trim()) commitSearch(query); }}
            placeholder="Search tracks, artists, podcasts..."
            className="flex-1 bg-transparent text-gray-900 placeholder-gray-400 text-sm focus:outline-none"
          />
          {query && (
            <button onClick={() => { setQuery(''); setHasResults(false); setSuggestions([]); }}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-lg transition-colors">
              <X className="h-4 w-4" />
            </button>
          )}
          <button onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 border ${
              showFilters || activeFilterCount > 0
                ? 'bg-green-50 border-green-300 text-green-700'
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
            }`}>
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-green-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Suggestions dropdown */}
        <AnimatePresence>
          {showSuggestions && (suggestions.length > 0 || recentSearches.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 bg-white border border-green-400 border-t-0 rounded-b-2xl shadow-lg z-30 overflow-hidden"
            >
              {suggestions.length > 0 && (
                <div className="p-2">
                  {suggestions.map((s, i) => (
                    <button key={i} onMouseDown={() => commitSearch(s)}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-green-50 rounded-xl transition-colors text-left">
                      <SearchIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="flex-1 truncate">{s}</span>
                    </button>
                  ))}
                </div>
              )}
              {recentSearches.length > 0 && (
                <div className={`${suggestions.length > 0 ? 'border-t border-gray-100' : ''} p-2`}>
                  <div className="flex items-center justify-between px-3 py-1 mb-1">
                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Recent</span>
                    <button onMouseDown={clearRecent} className="text-[11px] text-green-600 hover:text-green-700 font-medium">Clear all</button>
                  </div>
                  {recentSearches.slice(0, 5).map((s, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-xl group">
                      <Clock className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                      <button onMouseDown={() => commitSearch(s)} className="flex-1 text-sm text-gray-700 text-left truncate">{s}</button>
                      <button onMouseDown={() => removeRecent(s)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-gray-600 transition-all">
                        <X className="h-3 w-3" />
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
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
              <div className="flex flex-wrap gap-5 items-start">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Sort by</p>
                  <div className="flex gap-1.5">
                    {(['relevance', 'popular', 'newest'] as SortBy[]).map(s => (
                      <button key={s} onClick={() => setSortBy(s)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all duration-200 border ${
                          sortBy === s ? 'bg-green-50 border-green-300 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}>{s}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Genre</p>
                  <div className="flex flex-wrap gap-1.5 max-w-xl">
                    <button onClick={() => setSelectedGenre('')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 border ${
                        !selectedGenre ? 'bg-green-50 border-green-300 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}>All</button>
                    {genres.slice(0, 10).map(g => (
                      <button key={g._id} onClick={() => setSelectedGenre(g._id === selectedGenre ? '' : g._id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 border ${
                          selectedGenre === g._id ? 'bg-green-50 border-green-300 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}>{g.name}</button>
                    ))}
                  </div>
                </div>
                {activeFilterCount > 0 && (
                  <div className="ml-auto flex items-end pb-0.5">
                    <button onClick={() => { setSelectedGenre(''); setSortBy('relevance'); }}
                      className="text-xs text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1">
                      <X className="h-3 w-3" /> Clear filters
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
        <div className="space-y-5">
          {recentSearches.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" /> Recent Searches
                </h2>
                <button onClick={clearRecent} className="text-xs text-gray-400 hover:text-red-500 transition-colors">Clear all</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((s, i) => (
                  <div key={i} className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl pl-3 pr-1.5 py-1.5 group">
                    <button onClick={() => commitSearch(s)} className="text-sm text-gray-700">{s}</button>
                    <button onClick={() => removeRecent(s)}
                      className="p-0.5 text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-green-500" /> Trending Searches
            </h2>
            <div className="flex flex-wrap gap-2">
              {TRENDING_TERMS.map((term, i) => (
                <button key={i} onClick={() => commitSearch(term)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-300 text-gray-700 hover:text-green-700 rounded-xl text-sm transition-all duration-200">
                  <Hash className="h-3 w-3" />{term}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" /> Trending Now
              </h2>
              <button className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-0.5 transition-colors">
                See all <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {MOCK_TRENDING.map(item => (
                <div key={item.id}
                  className="flex items-center gap-3 p-3 bg-gray-50/60 hover:bg-green-50/40 border border-gray-100 hover:border-green-200 rounded-xl cursor-pointer transition-all duration-200 group">
                  {item.type === 'track' && <Avatar name={(item as any).title} size="sm" rounded="lg" />}
                  {item.type === 'artist' && <Avatar name={(item as any).name} size="sm" />}
                  {item.type === 'podcast' && (
                    <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {item.type === 'artist' ? (item as any).name : (item as any).title}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {item.type === 'track' && `${(item as any).artist} · ${(item as any).plays} plays`}
                      {item.type === 'artist' && `${(item as any).followers} followers · ${(item as any).genre}`}
                      {item.type === 'podcast' && `${(item as any).host} · ${(item as any).episodes} eps`}
                    </p>
                  </div>
                  {item.type === 'track' && (
                    <div className="opacity-0 group-hover:opacity-100 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center shadow-md transition-all duration-200">
                      <Play className="h-3 w-3 text-white fill-white ml-0.5" />
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
        <div className="space-y-5">
          {/* Tabs */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-3">
            <div className="flex items-center gap-1 flex-wrap">
              {tabs.map(t => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    tab === t.key
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}>
                  {t.icon}{t.label}
                  {hasResults && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                      tab === t.key ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>{t.count}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {isSearching && (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Loader2 className="h-5 w-5 text-green-600 animate-spin" />
                </div>
                <p className="text-sm text-gray-500">Searching for "{query}"...</p>
              </div>
            </div>
          )}

          {!isSearching && hasResults && (
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }} className="space-y-5">

                {/* Tracks */}
                {showTracks && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                        <Music2 className="h-4 w-4 text-green-500" /> Tracks
                      </h3>
                      {tab === 'all' && (
                        <button onClick={() => setTab('tracks')}
                          className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-0.5">
                          See all <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="divide-y divide-gray-50">
                      {(tab === 'all' ? MOCK_RESULTS.tracks.slice(0, 4) : MOCK_RESULTS.tracks).map((track, i) => (
                        <div key={track.id}
                          className="flex items-center gap-3 px-5 py-3 hover:bg-green-50/40 transition-colors group cursor-pointer">
                          <span className="w-4 text-xs text-gray-400 text-right flex-shrink-0">{i + 1}</span>
                          <Avatar name={track.title} size="sm" rounded="lg" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{track.title}</p>
                            <p className="text-xs text-gray-500 truncate">{track.artist} · {track.genre}</p>
                          </div>
                          <span className="text-xs text-gray-400 hidden sm:block">{track.plays}</span>
                          <span className="text-xs text-gray-400 font-mono w-9 text-right">{track.duration}</span>
                          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all duration-200">
                            <button className="p-1.5 text-gray-400 hover:text-rose-500 transition-colors">
                              <Heart className="h-3.5 w-3.5" />
                            </button>
                            <button className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center shadow-md hover:bg-green-600 transition-colors">
                              <Play className="h-3 w-3 text-white fill-white ml-0.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Artists */}
                {showArtists && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                        <Mic2 className="h-4 w-4 text-green-500" /> Artists
                      </h3>
                      {tab === 'all' && (
                        <button onClick={() => setTab('artists')}
                          className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-0.5">
                          See all <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="divide-y divide-gray-50">
                      {(tab === 'all' ? MOCK_RESULTS.artists.slice(0, 3) : MOCK_RESULTS.artists).map(artist => (
                        <div key={artist.id}
                          className="flex items-center gap-3 px-5 py-4 hover:bg-green-50/40 transition-colors group cursor-pointer">
                          <Avatar name={artist.name} size="md" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-semibold text-gray-800 truncate">{artist.name}</p>
                              {artist.verified && (
                                <div className="w-3.5 h-3.5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                  <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 12 12">
                                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">{artist.followers} followers · {artist.songs} songs · {artist.genre}</p>
                          </div>
                          <button className="opacity-0 group-hover:opacity-100 px-3 py-1.5 bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 text-xs font-medium rounded-xl transition-all duration-200 flex items-center gap-1">
                            <Users className="h-3 w-3" /> Follow
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Podcasts */}
                {showPodcasts && (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-green-500" /> Podcasts
                      </h3>
                      {tab === 'all' && (
                        <button onClick={() => setTab('podcasts')}
                          className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-0.5">
                          See all <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="divide-y divide-gray-50">
                      {MOCK_RESULTS.podcasts.map(pod => (
                        <div key={pod.id}
                          className="flex items-center gap-3 px-5 py-4 hover:bg-green-50/40 transition-colors group cursor-pointer">
                          <div className="w-11 h-11 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                            <BookOpen className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">{pod.title}</p>
                            <p className="text-xs text-gray-500">{pod.host} · {pod.episodes} episodes · {pod.listeners} listeners</p>
                          </div>
                          <button className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 px-3 py-1.5 bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 text-xs font-medium rounded-xl transition-all duration-200">
                            <Star className="h-3 w-3" /> Subscribe
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
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 flex flex-col items-center justify-center text-center px-4">
              <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <SearchIcon className="h-7 w-7 text-gray-400" />
              </div>
              <p className="text-gray-700 font-semibold mb-1">No results for "{query}"</p>
              <p className="text-gray-400 text-sm max-w-xs">Try different keywords or check your spelling.</p>
              <div className="flex flex-wrap justify-center gap-2 mt-5">
                {TRENDING_TERMS.slice(0, 4).map((t, i) => (
                  <button key={i} onClick={() => commitSearch(t)}
                    className="px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-600 rounded-xl text-sm hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-all duration-200">
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
