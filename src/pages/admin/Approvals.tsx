import { useState, useEffect } from 'react';
import { 
  Music2, Search, Filter, Play, Pause, CheckCircle, XCircle, Clock, Tag,
  ShieldCheck, Activity, ChevronRight, CheckCircle2,
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
      toast.success(`Track ${approved ? 'approved' : 'rejected'} successfully`, { id: loadingToast });
    } catch (error: any) {
      // If the API returns success but with an unexpected status code or format
      if (error?.response?.status === 200 || error?.response?.status === 201) {
        setTracks(prev => prev.filter(t => t.id !== trackId));
        toast.success(`Track ${approved ? 'approved' : 'rejected'} successfully`, { id: loadingToast });
      } else {
        const msg = error?.response?.data?.message || 'Failed to moderate track';
        toast.error(msg, { id: loadingToast });
      }
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
    <div className="space-y-8 pb-24">
      {/* Premium Welcome Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="premium-card !p-12 relative overflow-hidden group shadow-2xl border-white/5"
      >
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/[0.03] blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-12 z-10">
          <div className="flex items-center gap-8">
             <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center flex-shrink-0 border border-emerald-500/20 shadow-2xl relative overflow-hidden">
                <ShieldCheck className="w-10 h-10 text-emerald-500" />
             </div>
             <div>
                <h2 className="text-4xl font-bold text-white tracking-tight mb-2">
                  Content Approvals
                </h2>
                <p className="text-zinc-500 font-medium max-w-md leading-relaxed">
                   Review and moderate incoming content submissions from artists before they go live on the platform.
                </p>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex flex-col items-end mr-4">
               <span className="text-3xl font-bold text-white tabular-nums leading-none">{tracks.length}</span>
               <span className="text-xs text-zinc-500 font-medium mt-1">Pending Review</span>
             </div>
          </div>
        </div>
      </motion.div>

      {/* Control HUD */}
      <div className="premium-card !p-4 flex flex-col lg:flex-row items-center gap-6 border-white/5 shadow-md">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 h-5 w-5 group-focus-within:text-emerald-500 transition-colors" />
          <input
            type="text"
            placeholder="Search pending tracks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-12 h-14 bg-zinc-900/50 border border-white/5 rounded-2xl text-white text-sm focus:outline-none focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 transition-all placeholder:text-zinc-600"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-8 px-4">
          <div className="relative group w-full md:w-auto">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
            <select
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
              className="w-full md:w-48 h-14 pl-12 pr-10 bg-zinc-900/50 border border-white/5 rounded-2xl text-white text-sm focus:outline-none focus:border-emerald-500/30 appearance-none transition-all cursor-pointer"
            >
              {uniqueGenres.map(genre => (
                <option key={genre} value={genre} className="bg-zinc-900 text-white">
                  {genre === 'all' ? 'All Genres' : genre}
                </option>
              ))}
            </select>
            <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-zinc-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Moderation Queue */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="premium-card py-32 flex flex-col items-center justify-center text-center border-white/5 shadow-xl">
            <Activity className="h-10 w-10 text-emerald-500 animate-spin mb-6" />
            <p className="text-zinc-500 font-medium text-sm">Loading pending content...</p>
          </div>
        ) : filteredTracks.length === 0 ? (
          <div className="premium-card py-32 flex flex-col items-center justify-center text-center max-w-3xl mx-auto border-white/5 shadow-xl">
            <div className="w-20 h-20 bg-zinc-900/50 rounded-full flex items-center justify-center mb-6 border border-white/5">
              <CheckCircle className="h-8 w-8 text-emerald-500" />
            </div>
            <h3 className="text-white font-bold text-xl mb-2">All caught up!</h3>
            <p className="text-zinc-500 font-medium text-sm">There are no pending tracks requiring moderation.</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 gap-6">
              {filteredTracks.map((track, index) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="premium-card group !p-0 overflow-hidden hover:border-emerald-500/20 transition-all border-white/5 shadow-xl flex flex-col xl:flex-row"
                >
                  {/* Visual & Playback Control */}
                  <div className="relative w-full xl:w-80 h-64 xl:h-auto bg-zinc-950 overflow-hidden flex-shrink-0">
                    <img
                      src={track.cover_url || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&h=600&fit=crop'}
                      alt={track.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                    
                    <button
                      onClick={() => handlePlayPause(track.id, track.audio_url)}
                      className="absolute inset-0 flex items-center justify-center group/play"
                    >
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-500 ${
                        currentlyPlaying === track.id 
                          ? 'bg-emerald-500/90 text-white border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.3)]' 
                          : 'bg-black/50 text-white border-white/20 group-hover/play:scale-110 group-hover/play:bg-emerald-500/80 group-hover/play:border-emerald-500/50'
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
                            className="flex-1 bg-emerald-500 rounded-full"
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Content Info */}
                  <div className="flex-1 p-8 flex flex-col justify-between bg-zinc-900/50">
                    <div className="space-y-6">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                        <div className="space-y-3">
                          <h3 className="text-2xl font-bold text-white tracking-tight leading-tight">{track.title}</h3>
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <img
                                src={track.artist.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(track.artist.name)}&background=10b981&color=fff`}
                                alt={track.artist.name}
                                className="h-6 w-6 rounded-full object-cover"
                              />
                              <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-black rounded-full border border-white/10 flex items-center justify-center">
                                <CheckCircle2 size={8} className="text-emerald-500" />
                              </div>
                            </div>
                            <span className="text-sm font-semibold text-zinc-400 group-hover:text-white transition-colors">{track.artist.name}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleApproval(track.id, false)}
                            className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white text-sm font-semibold rounded-xl hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30 transition-all"
                          >
                            <XCircle size={18} />
                            Reject
                          </button>
                          <button
                            onClick={() => handleApproval(track.id, true)}
                            className="flex items-center gap-2 px-6 py-3 bg-white text-black text-sm font-bold rounded-xl hover:bg-zinc-200 transition-all shadow-xl"
                          >
                            <CheckCircle size={18} />
                            Approve
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-2 bg-black/20 p-4 rounded-xl border border-white/5">
                        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Lyrics / Description</p>
                        <p className="text-sm text-zinc-300 max-w-3xl leading-relaxed">{track.description}</p>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5">
                          <Tag size={14} className="text-zinc-400" />
                          <span className="text-xs font-semibold text-zinc-300">{track.genre}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                          <Clock size={14} />
                          <span>Submitted {formatDistanceToNow(new Date(track.created_at), { addSuffix: true })}</span>
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