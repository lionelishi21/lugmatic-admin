import React, { useState, useEffect } from 'react';
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
  Activity
} from 'lucide-react';
import { format } from 'date-fns';
import api from '../../services/api';
import { Skeleton } from '../../components/ui/skeleton';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// ── Shared primitives ─────────────────────────────────────────────
const card = 'bg-zinc-900 border border-white/[0.06] rounded-lg shadow-2xl relative overflow-hidden group';
const labelClass = 'block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 italic';

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
        <span className="text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-lg bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 animate-pulse italic">
          LIVE WAR CYCLE
        </span>
      );
    case 'ended':
      return (
        <span className="text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-lg bg-zinc-950 text-zinc-500 border border-white/[0.04] italic">
          CONCLUDED
        </span>
      );
    case 'accepted':
      return (
        <span className="text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 italic">
          UPCOMING
        </span>
      );
    default:
      return (
        <span className="text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 italic">
          {status.toUpperCase()}
        </span>
      );
  }
};

export default function Clashes() {
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
          setClashes(res.data.data);
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
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSocialShare = (clash: Clash, platform: 'twitter' | 'facebook' | 'whatsapp') => {
    const url = `https://lugmaticmusic.com/clash/${clash._id}`;
    const text = clash.status === 'active' 
      ? `Catch me live in a Lyrical War against ${clash.opponent.name} on Lugmatic!`
      : `Check out my Lyrical War against ${clash.opponent.name} on Lugmatic! Score: ${clash.challengerScore}-${clash.opponentScore}`;
    
    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`;
        break;
    }
    window.open(shareUrl, '_blank', 'width=600,height=400');
    setShowShareMenu(null);
  };

  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-8 animate-in fade-in duration-700">

      {/* ── Branded Header ── */}
      <div className={`${card} p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden group`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/[0.02] rounded-bl-full pointer-events-none" />
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-14 h-14 bg-zinc-950 border border-white/[0.06] rounded-2xl flex items-center justify-center shadow-2xl relative overflow-hidden group-hover:border-emerald-500/50 transition-colors">
            <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Swords className="w-7 h-7 text-emerald-500 relative z-10" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-2 italic">Combat Registry v1.2</p>
            <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight uppercase italic">Battle History <span className="text-zinc-600">/</span> Ledger</h1>
            <p className="text-sm text-zinc-500 mt-1 font-medium italic">Review lyrical war performance and historical combat telemetry.</p>
          </div>
        </div>
      </div>

      {/* Error Block HUD */}
      {error && (
        <div className={`${card} border-rose-500/20 bg-rose-500/[0.02] p-8 flex flex-col md:flex-row gap-8 relative overflow-hidden`}>
           <div className="w-12 h-12 bg-rose-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-xl shadow-rose-500/20 relative z-10">
              <AlertCircle className="h-6 w-6 text-white" />
           </div>
           <div className="flex-1 relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 mb-2 italic">System Alert</p>
              <h3 className="text-sm font-black text-zinc-300 uppercase italic tracking-widest">{error}</h3>
           </div>
        </div>
      )}

      {/* Content Feed HUD */}
      <div className="space-y-8">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className={`${card} p-10 space-y-10 animate-pulse bg-zinc-900/50`}>
              <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-48 bg-zinc-950 rounded-lg" />
                <Skeleton className="h-8 w-32 bg-zinc-950 rounded-lg" />
              </div>
              <div className="flex items-center justify-around py-8">
                <Skeleton className="h-32 w-32 bg-zinc-950 rounded-full" />
                <Skeleton className="h-12 w-12 bg-zinc-950 rounded-xl" />
                <Skeleton className="h-32 w-32 bg-zinc-950 rounded-full" />
              </div>
            </div>
          ))
        ) : clashes.length === 0 ? (
          <div className={`${card} py-40 text-center border-dashed border-white/[0.06] shadow-inner bg-zinc-950/20`}>
            <div className="w-24 h-24 bg-zinc-950 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 border border-white/[0.04] group shadow-2xl">
              <Swords className="h-10 w-10 text-zinc-800 group-hover:scale-110 group-hover:text-emerald-500 transition-all duration-500" />
            </div>
            <h4 className="text-xl font-black text-white uppercase tracking-tight italic">Zero Combat Records Detected</h4>
            <p className="text-sm text-zinc-500 mt-3 max-w-sm mx-auto leading-relaxed font-medium italic opacity-60">
              You haven't participated in any Lyrical Wars yet. Deploy to a live sector to build your history.
            </p>
          </div>
        ) : (
          clashes.map((clash, idx) => (
            <motion.div
              key={clash._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.5 }}
              className={`${card} overflow-hidden hover:border-emerald-500/30 transition-all duration-500 group relative`}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/[0.02] rounded-bl-full pointer-events-none" />
              
              {/* Card Body HUD */}
              <div className="p-10 relative z-10">
                {/* Meta HUD Row */}
                <div className="flex items-center justify-between mb-12">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-zinc-950 rounded-xl flex items-center justify-center border border-white/[0.04] shadow-inner">
                       <History className="h-5 w-5 text-zinc-600 group-hover:text-emerald-500 transition-colors" />
                    </div>
                    <div className="flex flex-col">
                      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] italic mb-1">
                        Deployment Cycle
                      </p>
                      <h4 className="text-sm font-black text-white uppercase italic tracking-widest">
                        {format(new Date(clash.createdAt), 'MMM dd, yyyy')}
                      </h4>
                    </div>
                  </div>
                  {statusBadge(clash.status)}
                </div>

                {/* Tactical Scoreboard HUD */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-12 max-w-4xl mx-auto">
                  {/* Challenger Entity HUD */}
                  <div className="flex flex-col items-center text-center flex-1 space-y-6">
                    <div className="relative group/avatar">
                      <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-3xl opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-700" />
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-zinc-950 relative z-10 shadow-[0_0_30px_rgba(0,0,0,0.5)] group-hover/avatar:scale-110 transition-transform duration-700">
                        <img
                          src={clash.challenger.image || 'https://via.placeholder.com/150'}
                          alt={clash.challenger.name}
                          className="w-full h-full object-cover grayscale group-hover/avatar:grayscale-0 transition-all duration-700"
                        />
                      </div>
                      {clash.winner?._id === clash.challenger._id && (
                        <div className="absolute -top-2 -right-2 bg-emerald-500 p-3 rounded-2xl shadow-2xl z-20 border-2 border-zinc-950 rotate-12 scale-110 group-hover/avatar:rotate-0 transition-transform">
                          <Trophy className="h-5 w-5 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      <p className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] italic group-hover:text-emerald-500 transition-colors">{clash.challenger.name}</p>
                      <p className="text-6xl font-black text-white italic tracking-tighter shadow-2xl">{clash.challengerScore}</p>
                    </div>
                  </div>

                  {/* VS Matrix Divider */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="px-6 py-2.5 rounded-xl bg-zinc-950 border border-white/[0.04] shadow-inner relative overflow-hidden group/vs">
                       <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover/vs:opacity-100 transition-opacity" />
                       <span className="text-[12px] font-black text-emerald-500 italic uppercase tracking-widest relative z-10">VS</span>
                    </div>
                    <div className="h-20 w-[2px] bg-gradient-to-b from-zinc-950 via-emerald-500/20 to-zinc-950" />
                  </div>

                  {/* Opponent Entity HUD */}
                  <div className="flex flex-col items-center text-center flex-1 space-y-6">
                    <div className="relative group/avatar">
                      <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-3xl opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-700" />
                      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-zinc-950 relative z-10 shadow-[0_0_30px_rgba(0,0,0,0.5)] group-hover/avatar:scale-110 transition-transform duration-700">
                        <img
                          src={clash.opponent.image || 'https://via.placeholder.com/150'}
                          alt={clash.opponent.name}
                          className="w-full h-full object-cover grayscale group-hover/avatar:grayscale-0 transition-all duration-700"
                        />
                      </div>
                      {clash.winner?._id === clash.opponent._id && (
                        <div className="absolute -top-2 -right-2 bg-emerald-500 p-3 rounded-2xl shadow-2xl z-20 border-2 border-zinc-950 -rotate-12 scale-110 group-hover/avatar:rotate-0 transition-transform">
                          <Trophy className="h-5 w-5 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      <p className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] italic group-hover:text-emerald-500 transition-colors">{clash.opponent.name}</p>
                      <p className="text-6xl font-black text-white italic tracking-tighter shadow-2xl">{clash.opponentScore}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interaction HUD Footer */}
              <div className="flex flex-col md:flex-row items-center justify-between px-10 py-6 border-t border-white/[0.04] bg-zinc-950/50 gap-6">
                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-4 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] italic">
                    {clash.status === 'ended' ? (
                      <>
                        <div className="w-10 h-10 bg-zinc-950 rounded-xl flex items-center justify-center border border-white/[0.04] shadow-inner">
                          <ShieldCheck className="h-5 w-5 text-zinc-700" />
                        </div>
                        <span>Protocol Concluded</span>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20 shadow-inner">
                          <Zap className="h-5 w-5 text-emerald-500 animate-pulse" />
                        </div>
                        <span className="text-emerald-500">Live Combat Active</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Broadcast Controller */}
                  <div className="relative">
                    <button
                      onClick={() => setShowShareMenu(showShareMenu === clash._id ? null : clash._id)}
                      className={`h-14 w-14 flex items-center justify-center rounded-xl border transition-all hover:scale-105 active:scale-95 ${
                         showShareMenu === clash._id 
                           ? 'bg-emerald-500 border-emerald-500 text-white shadow-xl shadow-emerald-500/20' 
                           : 'bg-zinc-950 border-white/[0.06] text-zinc-600 hover:text-emerald-500 hover:border-emerald-500/30'
                      }`}
                    >
                      <Share2 className="h-5 w-5" />
                    </button>
                    
                    <AnimatePresence>
                      {showShareMenu === clash._id && (
                        <>
                          <div className="fixed inset-0 z-30" onClick={() => setShowShareMenu(null)} />
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className={`${card} absolute bottom-full right-0 mb-4 w-64 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-40 overflow-hidden border-emerald-500/20 bg-zinc-900/95 backdrop-blur-xl`}
                          >
                            <div className="px-6 py-4 border-b border-white/[0.04] bg-zinc-950/50">
                              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] italic">Signal Broadcast</p>
                            </div>
                            <div className="p-2 space-y-1">
                              {[
                                { id: 'twitter', label: 'X / Twitter', icon: 'X', color: 'bg-zinc-950' },
                                { id: 'facebook', label: 'Meta Pulse', icon: 'M', color: 'bg-indigo-600' },
                                { id: 'whatsapp', label: 'Secure Link', icon: 'S', color: 'bg-emerald-600' }
                              ].map((plat) => (
                                <button
                                  key={plat.id}
                                  onClick={() => handleSocialShare(clash, plat.id as any)}
                                  className="group/item w-full px-4 py-3 text-left text-[10px] font-black text-zinc-500 hover:bg-emerald-500/10 hover:text-white rounded-xl flex items-center gap-4 uppercase tracking-[0.2em] transition-all italic"
                                >
                                  <div className={`w-8 h-8 ${plat.color} rounded-lg flex items-center justify-center shadow-2xl group-hover/item:scale-110 transition-transform`}>
                                    <span className="text-white text-[11px] font-black italic">{plat.icon}</span>
                                  </div>
                                  {plat.label}
                                </button>
                              ))}
                            </div>
                            <div className="p-2 border-t border-white/[0.04] bg-zinc-950/50">
                              <button
                                onClick={() => handleCopyLink(clash._id)}
                                className="w-full px-4 py-4 text-left text-[10px] font-black text-emerald-500 hover:bg-emerald-500/5 rounded-xl flex items-center gap-4 uppercase tracking-[0.2em] transition-all italic"
                              >
                                <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20">
                                  {copiedId === clash._id ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                                </div>
                                {copiedId === clash._id ? 'COPIED' : 'EXTRACT LINK'}
                              </button>
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>

                  <a
                    href={`https://lugmaticmusic.com/clash/${clash._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-14 flex items-center gap-4 px-10 bg-white text-zinc-950 text-[11px] font-black uppercase tracking-[0.2em] rounded-xl hover:scale-105 transition-all shadow-2xl italic group/replay"
                  >
                    WATCH REPLAY
                    <Play className="h-4 w-4 fill-current group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
