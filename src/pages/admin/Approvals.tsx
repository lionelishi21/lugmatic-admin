import { useState, useEffect } from 'react';
import { 
  Music2, Search, Filter, Play, Pause, CheckCircle, XCircle, Clock, Tag,
  ShieldCheck, Activity, Zap, Sparkles, ChevronRight, Headphones,
  BarChart2, AlertCircle, CheckCircle2, User, ArrowLeft
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { adminService } from '@/services/adminService';
import { motion, AnimatePresence } from 'framer-motion';

interface Track {
  id: string;
  title: string;
  description: string;
  genre: string;
  cover_url: string;
  audio_url: string;
  created_at: string;
  artist: {
    id: string;
    name: string;
    profile_image: string;
  };
}

export default function Approvals() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState('all');
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [audioElements] = useState<{ [key: string]: HTMLAudioElement }>({});

  useEffect(() => {
    fetchPendingTracks();
  }, []);

  useEffect(() => {
    return () => {
      Object.values(audioElements).forEach(audio => {
        audio.pause();
        audio.src = '';
      });
    };
  }, [audioElements]);

  const fetchPendingTracks = async () => {
    try {
      setIsLoading(true);
      const response = await adminService.getContentForModeration('songs');
      const mappedTracks: Track[] = (response.data.data as any[]).map((song: any) => ({
        id: song._id,
        title: song.name,
        description: song.lyrics ? song.lyrics.substring(0, 100) + '...' : 'No description provided',
        genre: song.genre?.name || 'Unknown',
        cover_url: song.coverArtUrl || '',
        audio_url: song.audioFileUrl || '',
        created_at: song.createdAt,
        artist: {
          id: song.artist?._id || '',
          name: song.artist?.name || 'Unknown Artist',
          profile_image: song.artist?.image || ''
        }
      }));
      setTracks(mappedTracks);
    } catch (error) {
      console.error('Error fetching tracks:', error);
      toast.error('Failed to load pending tracks');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayPause = (trackId: string, audioUrl: string) => {
    if (!audioUrl) {
      toast.error('Audio URL not available');
      return;
    }

    if (!audioElements[trackId]) {
      audioElements[trackId] = new Audio(audioUrl);
      audioElements[trackId].addEventListener('ended', () => setCurrentlyPlaying(null));
    }

    if (currentlyPlaying === trackId) {
      audioElements[trackId].pause();
      setCurrentlyPlaying(null);
    } else {
      if (currentlyPlaying && audioElements[currentlyPlaying]) {
        audioElements[currentlyPlaying].pause();
      }
      audioElements[trackId].play().catch(() => toast.error('Could not play audio'));
      setCurrentlyPlaying(trackId);
    }
  };

  const handleApproval = async (trackId: string, approved: boolean) => {
    const loadingToast = toast.loading(approved ? 'Approving track...' : 'Rejecting track...');
    try {
      await adminService.moderateContent('songs', trackId, approved ? 'approve' : 'reject');
      setTracks(prev => prev.filter(t => t.id !== trackId));
      if (currentlyPlaying === trackId) {
        audioElements[trackId].pause();
        setCurrentlyPlaying(null);
      }
      toast.success(`Track ${approved ? 'approved' : 'rejected'} and indexed`, { id: loadingToast });
    } catch (error) {
      toast.error(`Failed to execute moderation protocol`, { id: loadingToast });
    }
  };

  const filteredTracks = tracks.filter(track => {
    const matchesSearch = track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          track.artist.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = genreFilter === 'all' || track.genre === genreFilter;
    return matchesSearch && matchesGenre;
  });

  const uniqueGenres = ['all', ...new Set(tracks.map(track => track.genre))];

  return (
    <div className="space-y-12 pb-20">
      {/* Cinematic Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold tracking-tight text-white leading-none italic uppercase">Content Moderation</h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/5 border border-amber-500/10 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b] animate-pulse" />
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest italic">{tracks.length} PENDING_SIGNALS</span>
            </div>
          </div>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.3em] ml-1 italic">Reviewing incoming media transmissions for quality and compliance.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder="SEARCH REGISTRY..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-12 md:w-72 !py-3 !text-[10px] font-bold tracking-widest uppercase"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
            <select
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
              className="input-field appearance-none pl-12 pr-12 cursor-pointer !py-3 !text-[10px] font-bold tracking-widest uppercase"
            >
              {uniqueGenres.map(genre => (
                <option key={genre} value={genre} className="bg-[#0a0a0a] text-white">
                  {genre === 'all' ? 'ALL CATEGORIES' : genre.toUpperCase()}
                </option>
              ))}
            </select>
            <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-zinc-600 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Moderation Queue */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="premium-card py-32 flex flex-col items-center justify-center text-center">
            <Activity className="h-10 w-10 text-emerald-500 animate-pulse mb-6" />
            <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-[10px]">Scanning high-frequency signal registry...</p>
          </div>
        ) : filteredTracks.length === 0 ? (
          <div className="premium-card py-32 flex flex-col items-center justify-center text-center max-w-3xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-500/5 flex items-center justify-center mb-6 border border-emerald-500/10">
              <ShieldCheck className="h-8 w-8 text-emerald-500" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Protocol Integrity Maintained</h3>
            <p className="text-zinc-600 font-bold uppercase tracking-widest text-[10px]">No pending transmissions requiring administrative oversight.</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 gap-6">
              {filteredTracks.map((track, index) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ delay: index * 0.03, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                  className="premium-card group !p-0 overflow-hidden hover:border-emerald-500/20 transition-all border-white/5"
                >
                  <div className="flex flex-col xl:flex-row">
                    {/* Visual & Playback Control */}
                    <div className="relative w-full xl:w-80 h-64 xl:h-auto bg-zinc-950 overflow-hidden flex-shrink-0">
                      <img
                        src={track.cover_url || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&h=600&fit=crop'}
                        alt={track.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent opacity-60" />
                      
                      <button
                        onClick={() => handlePlayPause(track.id, track.audio_url)}
                        className="absolute inset-0 flex items-center justify-center group/play"
                      >
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 transition-all duration-500 ${
                          currentlyPlaying === track.id ? 'bg-emerald-500 text-black border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.4)]' : 'bg-white/10 text-white group-hover/play:scale-110 group-hover/play:bg-white/20'
                        }`}>
                          {currentlyPlaying === track.id ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                        </div>
                      </button>

                      {currentlyPlaying === track.id && (
                        <div className="absolute bottom-6 left-6 right-6 flex items-end gap-[3px] h-8">
                          {[...Array(24)].map((_, i) => (
                            <motion.div
                              key={i}
                              animate={{ height: [4, Math.random() * 24 + 4, 4] }}
                              transition={{ repeat: Infinity, duration: 0.5 + Math.random() * 0.5 }}
                              className="flex-1 bg-emerald-500/60 rounded-full"
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Content Intelligence */}
                    <div className="flex-1 p-8 flex flex-col justify-between bg-[#080808]/50">
                      <div className="space-y-6">
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <h3 className="text-2xl font-bold text-white tracking-tight leading-none">{track.title}</h3>
                              <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-bold rounded uppercase tracking-widest">Hi-Fi Audio</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <img
                                  src={track.artist.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(track.artist.name)}&background=10b981&color=fff`}
                                  alt={track.artist.name}
                                  className="h-6 w-6 rounded-lg border border-white/10 object-cover"
                                />
                                <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-black rounded-full border border-white/10 flex items-center justify-center">
                                  <CheckCircle2 size={8} className="text-emerald-500" />
                                </div>
                              </div>
                              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest group-hover:text-emerald-400 transition-colors cursor-pointer">{track.artist.name}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleApproval(track.id, true)}
                              className="flex items-center gap-2 px-8 py-3 bg-emerald-500 text-black text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/10"
                            >
                              <ShieldCheck size={16} />
                              Confirm Asset
                            </button>
                            <button
                              onClick={() => handleApproval(track.id, false)}
                              className="flex items-center gap-2 px-8 py-3 bg-white/5 border border-white/10 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30 transition-all"
                            >
                              <XCircle size={16} />
                              Purge
                            </button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Lyric Transcription Intelligence</p>
                          <p className="text-sm text-zinc-400 max-w-3xl leading-relaxed italic border-l-2 border-emerald-500/20 pl-4">{track.description}</p>
                        </div>
                      </div>

                      <div className="mt-10 pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/5">
                            <Tag size={12} className="text-emerald-500" />
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{track.genre}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                            <Clock size={14} />
                            <span>DEPLOYED {formatDistanceToNow(new Date(track.created_at), { addSuffix: true }).toUpperCase()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <div className="flex -space-x-2">
                              {[1, 2, 3].map(i => (
                                <div key={i} className="w-6 h-6 rounded-lg bg-zinc-900 border border-[#080808] flex items-center justify-center text-[8px] font-bold text-zinc-600 uppercase">
                                  AI
                                </div>
                              ))}
                           </div>
                           <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest">Automated Scan Complete</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}