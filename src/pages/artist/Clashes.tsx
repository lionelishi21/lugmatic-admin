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
  Play
} from 'lucide-react';
import { format } from 'date-fns';
import api from '../../services/api';
import { Skeleton } from '../../components/ui/skeleton';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const card = 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] rounded-lg';

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
        <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-md bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 animate-pulse">
          LIVE WAR
        </span>
      );
    case 'ended':
      return (
        <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-md bg-zinc-800 text-zinc-400 border border-white/5">
          CONCLUDED
        </span>
      );
    case 'accepted':
      return (
        <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
          UPCOMING
        </span>
      );
    default:
      return (
        <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-md bg-amber-500 text-white shadow-lg shadow-amber-500/20">
          {status}
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
    <div className="max-w-5xl mx-auto pb-16 space-y-8">

      {/* ── Header Card ── */}
      <div className={`${card} p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6`}>
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
            <Swords className="h-7 w-7 text-white" />
          </div>
          <div>
             <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1 italic">Combat Registry</p>
             <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight uppercase italic">
               Battle History
             </h1>
             <p className="text-sm text-zinc-500 mt-0.5">
               Review lyrical war performance and historical combat data.
             </p>
          </div>
        </div>
      </div>

      {/* Error Block */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-5 rounded-xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4">
          <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest italic">{error}</p>
        </div>
      )}

      {/* Content Feed */}
      <div className="space-y-6">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className={`${card} p-8 space-y-8 animate-pulse border-white/5 bg-white/[0.01]`}>
              <div className="flex justify-between items-center">
                <div className="h-4 w-32 bg-zinc-800 rounded-md" />
                <div className="h-6 w-24 bg-zinc-800 rounded-md" />
              </div>
              <div className="flex items-center justify-around py-4">
                <div className="h-24 w-24 bg-zinc-800 rounded-full" />
                <div className="h-10 w-10 bg-zinc-800 rounded-xl" />
                <div className="h-24 w-24 bg-zinc-800 rounded-full" />
              </div>
            </div>
          ))
        ) : clashes.length === 0 ? (
          <div className={`${card} py-32 text-center border-dashed border-zinc-200 dark:border-white/10 shadow-inner bg-zinc-50/30 dark:bg-white/[0.01]`}>
            <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-zinc-200 dark:border-white/5 group">
              <Swords className="h-10 w-10 text-zinc-400 group-hover:scale-110 transition-transform" />
            </div>
            <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight italic">Zero Combat Records</h4>
            <p className="text-xs text-zinc-500 mt-2 max-w-xs mx-auto leading-relaxed font-medium">
              You haven't participated in any Lyrical Wars yet. Go live to challenge other artists and build your history.
            </p>
          </div>
        ) : (
          clashes.map((clash, idx) => (
            <motion.div
              key={clash._id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`${card} overflow-hidden hover:border-emerald-500/30 transition-all group relative`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.01] rounded-bl-full pointer-events-none" />
              
              {/* Card Body HUD */}
              <div className="p-8">
                {/* Meta Row */}
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center border border-zinc-200 dark:border-white/5">
                       <History className="h-4 w-4 text-zinc-400" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-widest italic">
                        {format(new Date(clash.createdAt), 'MMM dd, yyyy')}
                      </span>
                      <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mt-0.5">Deployment Sequence</span>
                    </div>
                  </div>
                  {statusBadge(clash.status)}
                </div>

                {/* Scoreboard HUD */}
                <div className="flex items-center justify-between gap-8 max-w-2xl mx-auto">
                  {/* Challenger Entity */}
                  <div className="flex flex-col items-center text-center flex-1 space-y-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-zinc-100 dark:border-white/10 relative z-10 shadow-2xl group-hover:scale-105 transition-transform duration-500">
                        <img
                          src={clash.challenger.image || 'https://via.placeholder.com/150'}
                          alt={clash.challenger.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {clash.winner?._id === clash.challenger._id && (
                        <div className="absolute -top-1 -right-1 bg-emerald-500 p-2 rounded-full shadow-2xl z-20 border-2 border-white dark:border-zinc-900">
                          <Trophy className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-zinc-900 dark:text-white truncate w-full uppercase tracking-tight italic">{clash.challenger.name}</p>
                      <p className="text-4xl font-black text-zinc-900 dark:text-white tabular-nums mt-2 italic tracking-tighter shadow-sm">{clash.challengerScore}</p>
                    </div>
                  </div>

                  {/* VS Divider */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-white/5">
                       <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 italic uppercase">VS</span>
                    </div>
                    <div className="h-12 w-px bg-zinc-100 dark:bg-white/[0.04]" />
                  </div>

                  {/* Opponent Entity */}
                  <div className="flex flex-col items-center text-center flex-1 space-y-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-zinc-100 dark:border-white/10 relative z-10 shadow-2xl group-hover:scale-105 transition-transform duration-500">
                        <img
                          src={clash.opponent.image || 'https://via.placeholder.com/150'}
                          alt={clash.opponent.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {clash.winner?._id === clash.opponent._id && (
                        <div className="absolute -top-1 -right-1 bg-emerald-500 p-2 rounded-full shadow-2xl z-20 border-2 border-white dark:border-zinc-900">
                          <Trophy className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-[11px] font-black text-zinc-900 dark:text-white truncate w-full uppercase tracking-tight italic">{clash.opponent.name}</p>
                      <p className="text-4xl font-black text-zinc-900 dark:text-white tabular-nums mt-2 italic tracking-tighter shadow-sm">{clash.opponentScore}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Functional Footer HUD */}
              <div className="flex items-center justify-between px-8 py-5 border-t border-zinc-100 dark:border-white/[0.06] bg-zinc-50/30 dark:bg-white/[0.01]">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest italic">
                    {clash.status === 'ended' ? (
                      <>
                        <div className="w-7 h-7 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center">
                          <Target className="h-3.5 w-3.5 text-zinc-500" />
                        </div>
                        <span>Signal Concluded</span>
                      </>
                    ) : (
                      <>
                        <div className="w-7 h-7 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                          <Zap className="h-3.5 w-3.5 text-emerald-500" />
                        </div>
                        <span className="text-emerald-500">Active Session</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Share Controller */}
                  <div className="relative">
                    <button
                      onClick={() => setShowShareMenu(showShareMenu === clash._id ? null : clash._id)}
                      className="h-10 w-10 flex items-center justify-center rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 text-zinc-500 hover:text-emerald-500 transition-all hover:scale-105 active:scale-95"
                      title="Broadast Sync"
                    >
                      <Share2 className="h-4.5 w-4.5" />
                    </button>
                    
                    <AnimatePresence>
                      {showShareMenu === clash._id && (
                        <>
                          <div className="fixed inset-0 z-30" onClick={() => setShowShareMenu(null)} />
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 12 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 12 }}
                            className={`${card} absolute bottom-full right-0 mb-3 w-56 shadow-2xl z-40 overflow-hidden border-emerald-500/20`}
                          >
                            <div className="px-5 py-3 border-b border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-zinc-900/50">
                              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic">Signal Broadast</p>
                            </div>
                            <div className="p-2 space-y-1">
                              {[
                                { id: 'twitter', label: 'X / Twitter', icon: 'X', color: 'bg-zinc-950' },
                                { id: 'facebook', label: 'Meta Pulse', icon: 'M', color: 'bg-blue-600' },
                                { id: 'whatsapp', label: 'Secure Link', icon: 'S', color: 'bg-emerald-600' }
                              ].map((plat) => (
                                <button
                                  key={plat.id}
                                  onClick={() => handleSocialShare(clash, plat.id as any)}
                                  className="w-full px-4 py-2.5 text-left text-[11px] font-black text-zinc-700 dark:text-zinc-300 hover:bg-emerald-500/10 hover:text-emerald-500 rounded-xl flex items-center gap-4 uppercase tracking-widest transition-all"
                                >
                                  <div className={`w-6 h-6 ${plat.color} rounded-lg flex items-center justify-center shadow-lg`}>
                                    <span className="text-white text-[10px] font-black italic">{plat.icon}</span>
                                  </div>
                                  {plat.label}
                                </button>
                              ))}
                            </div>
                            <div className="p-2 border-t border-zinc-100 dark:border-white/5">
                              <button
                                onClick={() => handleCopyLink(clash._id)}
                                className="w-full px-4 py-3 text-left text-[11px] font-black text-emerald-500 hover:bg-emerald-500/5 rounded-xl flex items-center gap-4 uppercase tracking-widest transition-all"
                              >
                                <div className="w-6 h-6 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                                  {copiedId === clash._id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </div>
                                {copiedId === clash._id ? 'Copied' : 'Extract Link'}
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
                    className="h-10 flex items-center gap-3 px-6 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-all shadow-xl shadow-zinc-950/20"
                  >
                    Watch Replay
                    <Play className="h-3.5 w-3.5 fill-current" />
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
