import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Swords,
  Trophy,
  Calendar,
  Clock,
  ExternalLink,
  TrendingUp,
  AlertCircle,
  Share2,
  Copy,
  Check,
  Zap,
  Target,
  History,
  Play,
  ShieldCheck,
  Smartphone,
  ChevronRight,
  Activity,
  User,
  ArrowUpRight
} from 'lucide-react';
import { format } from 'date-fns';
import api from '../../services/api';
import { Skeleton } from '../../components/ui/skeleton';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface Artist {
  _id: string;
  name: string;
  image: string;
}

interface Clash {
  _id: string;
  challenger: Artist;
  opponent: Artist;
  status: 'pending' | 'accepted' | 'active' | 'ended' | 'cancelled' | 'rejected';
  challengerScore: number;
  opponentScore: number;
  winner?: Artist;
  startTime?: string;
  createdAt: string;
}

const statusBadge = (status: string) => {
  switch (status) {
    case 'active':
      return (
        <span className="flex items-center gap-2 px-3 py-1 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest">
          <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          Live
        </span>
      );
    case 'ended':
      return (
        <span className="px-3 py-1 bg-zinc-950 text-zinc-500 border border-white/5 rounded-full text-[10px] font-bold uppercase tracking-widest">
          Finished
        </span>
      );
    case 'accepted':
      return (
        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest">
          Upcoming
        </span>
      );
    default:
      return (
        <span className="px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest">
          {status}
        </span>
      );
  }
};

export default function Clashes() {
  const navigate = useNavigate();
  const [clashes, setClashes] = useState<Clash[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShareMenu, setShowShareMenu] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchClashes = async () => {
      try {
        const res = await api.get('/clash/history');
        if (res.data && res.data.success) {
          setClashes(res.data.data as Clash[]);
        } else {
          setError('Failed to load clash history');
        }
      } catch (err: any) {
        console.error('Error fetching clashes:', err);
        setError(err.response?.data?.message || err.message || 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchClashes();
  }, []);

  const handleCopyLink = (clashId: string) => {
    const url = `https://lugmaticmusic.com/clash/${clashId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(clashId);
    toast.success('Link copied');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSocialShare = (clash: Clash, platform: 'twitter' | 'facebook' | 'whatsapp') => {
    const url = `https://lugmaticmusic.com/clash/${clash._id}`;
    const text = clash.status === 'active' 
      ? `Watch me live in a clash against ${clash.opponent.name} on Lugmatic!`
      : `Check out my clash against ${clash.opponent.name} on Lugmatic! Score: ${clash.challengerScore}-${clash.opponentScore}`;
    
    let shareUrl = '';
    if (platform === 'twitter') shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    else if (platform === 'facebook') shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    else if (platform === 'whatsapp') shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`;
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
    setShowShareMenu(null);
  };

  return (
    <div className="space-y-10 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold tracking-tight text-white leading-none uppercase">Clash History</h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Active System</span>
            </div>
          </div>
          <p className="text-zinc-500 font-medium">Manage your competition records and share past performances.</p>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="premium-card border-rose-500/20 bg-rose-500/5 p-8 flex items-center gap-6">
           <div className="w-12 h-12 bg-rose-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-rose-900/20">
              <AlertCircle className="h-6 w-6 text-white" />
           </div>
           <div>
              <p className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-1">Notice</p>
              <p className="text-sm font-bold text-white">{error}</p>
           </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-8">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="premium-card p-10 h-64 animate-pulse bg-zinc-900/50 rounded-[2.5rem]" />
          ))
        ) : clashes.length === 0 ? (
          <div className="premium-card py-32 text-center border-dashed border-white/5 bg-zinc-950/20 rounded-[3rem]">
            <div className="w-20 h-20 bg-zinc-900 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-white/5">
              <Swords className="h-10 w-10 text-zinc-700" />
            </div>
            <h4 className="text-xl font-bold text-white uppercase tracking-tight">No records found</h4>
            <p className="text-sm text-zinc-500 mt-3 font-medium">You haven't participated in any clashes yet.</p>
          </div>
        ) : (
          clashes.map((clash, idx) => (
            <motion.div
              key={clash._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="premium-card overflow-hidden hover:border-emerald-500/20 transition-all group relative border-white/5 shadow-2xl !p-0"
            >
              {/* Card Header */}
              <div className="px-10 py-6 border-b border-white/5 bg-zinc-950/20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center border border-white/5">
                      <Calendar size={18} className="text-zinc-600" />
                   </div>
                   <div>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Match Date</p>
                      <p className="text-sm font-bold text-white">{format(new Date(clash.createdAt), 'MMMM dd, yyyy')}</p>
                   </div>
                </div>
                {statusBadge(clash.status)}
              </div>

              {/* Card Body */}
              <div className="p-10 relative">
                <div className="flex flex-col md:flex-row items-center justify-between gap-12 max-w-4xl mx-auto">
                  {/* Challenger */}
                  <div className="flex flex-col items-center text-center flex-1 space-y-4">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-zinc-900 shadow-2xl">
                        <img
                          src={clash.challenger.image || 'https://via.placeholder.com/150'}
                          alt={clash.challenger.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {clash.winner?._id === clash.challenger._id && (
                        <div className="absolute -top-2 -right-2 bg-emerald-500 p-2.5 rounded-xl shadow-xl border-2 border-zinc-900">
                          <Trophy className="h-5 w-5 text-black" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-bold text-white uppercase tracking-tight">{clash.challenger.name}</p>
                      <p className="text-6xl font-bold text-white tabular-nums tracking-tighter">{clash.challengerScore}</p>
                    </div>
                  </div>

                  {/* VS Divider */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="px-5 py-2 rounded-xl bg-zinc-950 border border-white/5">
                       <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">VS</span>
                    </div>
                    <div className="h-16 w-px bg-white/5" />
                  </div>

                  {/* Opponent */}
                  <div className="flex flex-col items-center text-center flex-1 space-y-4">
                    <div className="relative">
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-zinc-900 shadow-2xl">
                        <img
                          src={clash.opponent.image || 'https://via.placeholder.com/150'}
                          alt={clash.opponent.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {clash.winner?._id === clash.opponent._id && (
                        <div className="absolute -top-2 -right-2 bg-emerald-500 p-2.5 rounded-xl shadow-xl border-2 border-zinc-900">
                          <Trophy className="h-5 w-5 text-black" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-bold text-white uppercase tracking-tight">{clash.opponent.name}</p>
                      <p className="text-6xl font-bold text-white tabular-nums tracking-tighter">{clash.opponentScore}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-10 py-6 border-t border-white/5 bg-zinc-950/40 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                   <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border border-white/5 bg-black ${clash.status === 'active' ? 'text-emerald-500' : 'text-zinc-600'}`}>
                         {clash.status === 'active' ? <Zap size={18} /> : <ShieldCheck size={18} />}
                      </div>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        {clash.status === 'active' ? 'Currently Live' : 'Match Concluded'}
                      </p>
                   </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="relative">
                    <button
                      onClick={() => setShowShareMenu(showShareMenu === clash._id ? null : clash._id)}
                      className={`w-14 h-14 flex items-center justify-center rounded-2xl border transition-all ${
                         showShareMenu === clash._id ? 'bg-white text-black border-white' : 'bg-zinc-950 border-white/5 text-zinc-500 hover:text-white'
                      }`}
                    >
                      <Share2 size={20} />
                    </button>
                    
                    <AnimatePresence>
                      {showShareMenu === clash._id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                          className="absolute bottom-full right-0 mb-4 w-56 bg-zinc-900 border border-white/10 rounded-3xl p-3 shadow-2xl z-50"
                        >
                          <p className="px-4 py-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-white/5 mb-2">Share Results</p>
                          {['twitter', 'facebook', 'whatsapp'].map(p => (
                            <button key={p} onClick={() => handleSocialShare(clash, p as any)} className="w-full text-left px-4 py-3 text-xs font-bold text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl capitalize">
                              {p}
                            </button>
                          ))}
                          <button onClick={() => handleCopyLink(clash._id)} className="w-full text-left px-4 py-3 text-xs font-bold text-emerald-500 hover:bg-emerald-500/5 rounded-xl mt-1 border-t border-white/5 pt-3">
                            {copiedId === clash._id ? 'Copied' : 'Copy Link'}
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {clash.status === 'active' ? (
                    <button
                      onClick={() => navigate(`/artist/clashes/live/${clash._id}`)}
                      className="h-14 px-8 bg-rose-500 text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-rose-400 transition-all flex items-center gap-3 shadow-lg shadow-rose-900/30"
                    >
                      <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      Join Live
                    </button>
                  ) : (
                    <a
                      href={`https://lugmaticmusic.com/clash/${clash._id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-14 px-8 bg-zinc-950 text-white border border-white/5 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all flex items-center gap-3"
                    >
                      View Replay
                      <Play size={16} className="fill-current" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
