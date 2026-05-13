import { useState, useEffect } from 'react';
import { Music2, Search, Filter, Play, Pause, CheckCircle, XCircle, Clock, Tag } from 'lucide-react';
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
    try {
      await adminService.moderateContent('songs', trackId, approved ? 'approve' : 'reject');
      setTracks(prev => prev.filter(t => t.id !== trackId));
      if (currentlyPlaying === trackId) {
        audioElements[trackId].pause();
        setCurrentlyPlaying(null);
      }
      toast.success(`Track ${approved ? 'approved' : 'rejected'}`);
    } catch (error) {
      toast.error(`Failed to ${approved ? 'approve' : 'reject'}`);
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
    <div className="space-y-8">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Content Approvals</h1>
          <p className="text-zinc-500">Review and moderate pending tracks from artists.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder="Search submissions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10 md:w-64"
            />
          </div>
          <div className="relative">
            <select
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
              className="input-field appearance-none pr-10 cursor-pointer"
            >
              {uniqueGenres.map(genre => (
                <option key={genre} value={genre} className="bg-[#0a0a0a] text-white">
                  {genre === 'all' ? 'All Genres' : genre}
                </option>
              ))}
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Track List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="premium-card py-24 flex flex-col items-center justify-center text-center">
            <Music2 className="h-10 w-10 text-emerald-500 animate-pulse mb-4" />
            <p className="text-zinc-500 font-medium">Scanning for pending tracks...</p>
          </div>
        ) : filteredTracks.length === 0 ? (
          <div className="premium-card py-24 flex flex-col items-center justify-center text-center">
            <CheckCircle className="h-10 w-10 text-zinc-800 mb-4" />
            <p className="text-zinc-500 font-medium">Registry clear. No pending submissions.</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredTracks.map((track, index) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className="premium-card premium-card-hover p-4 md:p-5"
              >
                <div className="flex flex-col md:flex-row items-center gap-6">
                  {/* Visual & Playback */}
                  <div className="relative group w-32 h-32 md:w-36 md:h-36 flex-shrink-0">
                    <img
                      src={track.cover_url || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop'}
                      alt={track.title}
                      className="w-full h-full object-cover rounded-xl border border-white/5"
                    />
                    <button
                      onClick={() => handlePlayPause(track.id, track.audio_url)}
                      className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 rounded-xl flex items-center justify-center transition-all duration-200"
                    >
                      {currentlyPlaying === track.id ? (
                        <Pause className="h-10 w-10 text-white fill-white" />
                      ) : (
                        <Play className="h-10 w-10 text-white fill-white" />
                      )}
                    </button>
                    {currentlyPlaying === track.id && (
                      <div className="absolute top-2 right-2 flex gap-1">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-0.5 h-3 bg-emerald-500 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-white tracking-tight mb-1">{track.title}</h3>
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                          <img
                            src={track.artist.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(track.artist.name)}&background=10b981&color=fff`}
                            alt={track.artist.name}
                            className="h-5 w-5 rounded-full border border-white/10"
                          />
                          <span className="text-sm font-medium text-emerald-400">{track.artist.name}</span>
                        </div>
                        <p className="text-sm text-zinc-500 max-w-2xl line-clamp-2">{track.description}</p>
                      </div>

                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => handleApproval(track.id, true)}
                          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/10"
                        >
                          <CheckCircle size={18} />
                          Approve
                        </button>
                        <button
                          onClick={() => handleApproval(track.id, false)}
                          className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/30 transition-all"
                        >
                          <XCircle size={18} />
                          Reject
                        </button>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-4">
                      <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full text-xs font-medium text-zinc-400">
                        <Tag size={12} className="text-emerald-500" />
                        {track.genre}
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium text-zinc-600">
                        <Clock size={12} />
                        Submitted {formatDistanceToNow(new Date(track.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}