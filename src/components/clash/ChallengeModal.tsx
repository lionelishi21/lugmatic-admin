import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Swords, Loader2, Users, RefreshCw } from 'lucide-react';
import { getActiveStreams, type LiveStream } from '../../services/liveStreamService';
import clashService from '../../services/clashService';
import toast from 'react-hot-toast';

interface ChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStreamId: string;
}

export default function ChallengeModal({ isOpen, onClose, currentStreamId }: ChallengeModalProps) {
  const [streams, setStreams] = useState<LiveStream[]>([]);
  const [loading, setLoading] = useState(true);
  const [invitingId, setInvitingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchLiveStreams();
    }
  }, [isOpen]);

  const fetchLiveStreams = async () => {
    setLoading(true);
    try {
      const res = await getActiveStreams();
      const otherStreams = (res.data as LiveStream[]).filter(s => s._id !== currentStreamId);
      setStreams(otherStreams);
    } catch (error) {
      console.error('Error fetching live streams:', error);
      toast.error('Failed to load active streams');
    } finally {
      setLoading(false);
    }
  };

  const handleChallenge = async (artistId: string) => {
    setInvitingId(artistId);
    try {
      await clashService.inviteToClash(artistId);
      toast.success('Challenge sent! Waiting for response...');
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send challenge');
    } finally {
      setInvitingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="absolute inset-0 bg-black/80 backdrop-blur-md" 
        onClick={onClose} 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-zinc-950 border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-10 py-8 border-b border-white/5 bg-zinc-950/40 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center">
              <Swords className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white uppercase tracking-tight">Challenge Artist</h3>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Select a live artist to clash</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-8 space-y-4 no-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-6">
              <Loader2 className="h-10 w-10 text-purple-500 animate-spin" />
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest animate-pulse">Scanning live signals...</p>
            </div>
          ) : streams.length === 0 ? (
            <div className="text-center py-20 space-y-8">
              <div className="bg-white/5 w-24 h-24 rounded-[2.5rem] flex items-center justify-center mx-auto border border-white/5">
                <Search className="h-10 w-10 text-zinc-800" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-bold text-white uppercase tracking-tight">No artists live</p>
                <p className="text-sm text-zinc-500 max-w-[240px] mx-auto leading-relaxed">
                  Wait for other artists to join or share your stream to invite them.
                </p>
              </div>
              <button 
                onClick={fetchLiveStreams}
                className="text-[10px] font-bold text-purple-500 uppercase tracking-widest hover:text-purple-400 flex items-center justify-center gap-2 mx-auto"
              >
                <RefreshCw size={14} /> Refresh Radar
              </button>
            </div>
          ) : (
            streams.map((stream) => (
              <div key={stream._id} className="flex items-center gap-5 p-5 rounded-[2rem] bg-zinc-900 border border-white/5 hover:border-purple-500/30 transition-all group">
                <div className="relative">
                  <img 
                    src={stream.host?.image || '/default-artist.jpg'} 
                    alt={stream.host?.name}
                    className="w-16 h-16 rounded-2xl object-cover border border-white/10 shadow-xl"
                  />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-zinc-900 rounded-full animate-pulse" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-bold text-white group-hover:text-purple-400 transition-colors truncate">@{stream.host?.name}</h4>
                  <div className="flex items-center gap-4 mt-1.5">
                    <p className="text-xs text-zinc-500 font-medium truncate flex-1">{stream.title}</p>
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/5 tabular-nums">
                      <Users className="h-3 w-3" />
                      {stream.currentViewers.toLocaleString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleChallenge(stream.host?._id)}
                  disabled={!!invitingId}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest shadow-xl shadow-purple-900/20 disabled:opacity-50 transition-all"
                >
                  {invitingId === stream.host?._id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Swords className="h-4 w-4" />
                  )}
                  Clash
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-10 py-6 bg-zinc-950/60 border-t border-white/5 text-center shrink-0">
            <p className="text-[10px] text-zinc-600 uppercase tracking-[0.3em] font-bold">
              Lyrical War • High Stakes
            </p>
        </div>
      </motion.div>
    </div>
  );
}
