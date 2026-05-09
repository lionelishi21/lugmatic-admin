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
  Check
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
        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 animate-pulse">
          LIVE WAR
        </span>
      );
    case 'ended':
      return (
        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-500/10 text-zinc-400 border border-white/5">
          CONCLUDED
        </span>
      );
    case 'accepted':
      return (
        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
          UPCOMING
        </span>
      );
    default:
      return (
        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
          {status}
        </span>
      );
  }
};

const card = 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] rounded-lg';

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
    <div className="max-w-5xl mx-auto pb-16 space-y-6">

      {/* Header */}
      <div className={`${card} p-6 flex items-center justify-between`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-600/20">
            <Swords className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight uppercase">Live Clash</h1>
            <p className="text-sm text-zinc-500 mt-0.5">Manage and review your Lyrical War history</p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm font-bold uppercase tracking-tight">{error}</p>
        </div>
      )}

      {/* Content */}
      <div className="space-y-4">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className={`${card} p-6 space-y-6 animate-pulse`}>
              <div className="flex justify-between items-center">
                <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded" />
                <div className="h-4 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
              </div>
              <div className="flex items-center justify-around py-4">
                <div className="h-20 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
                <div className="h-8 w-8 bg-zinc-200 dark:bg-zinc-800 rounded" />
                <div className="h-20 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
              </div>
            </div>
          ))
        ) : clashes.length === 0 ? (
          <div className={`${card} py-24 text-center`}>
            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-zinc-200 dark:border-white/5">
              <Swords className="h-8 w-8 text-zinc-400" />
            </div>
            <p className="font-bold text-zinc-900 dark:text-white uppercase tracking-tight">No Clashes Yet</p>
            <p className="text-sm text-zinc-500 mt-1 max-w-xs mx-auto">
              You haven't participated in any Lyrical Wars yet. Go live to challenge other artists!
            </p>
          </div>
        ) : (
          clashes.map((clash) => (
            <motion.div
              key={clash._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${card} overflow-hidden hover:border-purple-500/30 transition-all group`}
            >
              {/* Card body */}
              <div className="p-6">
                {/* Top row: date + status */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                    <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                    {format(new Date(clash.createdAt), 'MMM dd, yyyy')}
                  </div>
                  {statusBadge(clash.status)}
                </div>

                {/* Scoreboard */}
                <div className="flex items-center justify-between gap-4">
                  {/* Challenger */}
                  <div className="flex flex-col items-center text-center flex-1 space-y-3">
                    <div className="relative">
                      <div className="absolute inset-0 bg-purple-600/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                      <img
                        src={clash.challenger.image || '/default-artist.jpg'}
                        alt={clash.challenger.name}
                        className="w-20 h-20 rounded-full object-cover border-2 border-zinc-200 dark:border-white/10 relative z-10"
                      />
                      {clash.winner?._id === clash.challenger._id && (
                        <div className="absolute -top-1 -right-1 bg-amber-500 p-1.5 rounded-full shadow-lg z-20 border border-white/20">
                          <Trophy className="h-3.5 w-3.5 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-900 dark:text-white truncate w-full uppercase tracking-tight">{clash.challenger.name}</p>
                      <p className="text-3xl font-black text-zinc-900 dark:text-white tabular-nums mt-1 italic tracking-tighter">{clash.challengerScore}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px] font-black text-zinc-300 dark:text-zinc-700 italic uppercase">VS</span>
                    <div className="h-8 w-px bg-zinc-100 dark:bg-white/[0.04]" />
                  </div>

                  {/* Opponent */}
                  <div className="flex flex-col items-center text-center flex-1 space-y-3">
                    <div className="relative">
                      <div className="absolute inset-0 bg-purple-600/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                      <img
                        src={clash.opponent.image || '/default-artist.jpg'}
                        alt={clash.opponent.name}
                        className="w-20 h-20 rounded-full object-cover border-2 border-zinc-200 dark:border-white/10 relative z-10"
                      />
                      {clash.winner?._id === clash.opponent._id && (
                        <div className="absolute -top-1 -right-1 bg-amber-500 p-1.5 rounded-full shadow-lg z-20 border border-white/20">
                          <Trophy className="h-3.5 w-3.5 text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-zinc-900 dark:text-white truncate w-full uppercase tracking-tight">{clash.opponent.name}</p>
                      <p className="text-3xl font-black text-zinc-900 dark:text-white tabular-nums mt-1 italic tracking-tighter">{clash.opponentScore}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-100 dark:border-white/[0.06] bg-zinc-50/30 dark:bg-white/[0.01]">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    {clash.status === 'ended' ? (
                      <>
                        <TrendingUp className="h-3.5 w-3.5 text-purple-500" />
                        <span>Game concluded</span>
                      </>
                    ) : (
                      <>
                        <Clock className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Active session</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Share Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setShowShareMenu(showShareMenu === clash._id ? null : clash._id)}
                      className="p-2 text-zinc-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded transition-all"
                      title="Share Battle"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                    
                    <AnimatePresence>
                      {showShareMenu === clash._id && (
                        <>
                          <div className="fixed inset-0 z-30" onClick={() => setShowShareMenu(null)} />
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="absolute bottom-full right-0 mb-2 w-48 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded-lg shadow-2xl z-40 overflow-hidden"
                          >
                            <div className="px-4 py-2 border-b border-zinc-100 dark:border-white/5 bg-zinc-50 dark:bg-zinc-900/50">
                              <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Share to Social</p>
                            </div>
                            <button
                              onClick={() => handleSocialShare(clash, 'twitter')}
                              className="w-full px-4 py-2 text-left text-[11px] font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5 flex items-center gap-3 uppercase tracking-wider"
                            >
                              <div className="w-5 h-5 bg-black rounded flex items-center justify-center"><span className="text-white text-[10px]">X</span></div>
                              Twitter
                            </button>
                            <button
                              onClick={() => handleSocialShare(clash, 'facebook')}
                              className="w-full px-4 py-2 text-left text-[11px] font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5 flex items-center gap-3 uppercase tracking-wider"
                            >
                              <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center"><span className="text-white text-[10px]">f</span></div>
                              Facebook
                            </button>
                            <button
                              onClick={() => handleSocialShare(clash, 'whatsapp')}
                              className="w-full px-4 py-2 text-left text-[11px] font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-white/5 flex items-center gap-3 uppercase tracking-wider"
                            >
                              <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center"><span className="text-white text-[10px]">w</span></div>
                              WhatsApp
                            </button>
                            <button
                              onClick={() => handleCopyLink(clash._id)}
                              className="w-full px-4 py-3 border-t border-zinc-100 dark:border-white/5 text-left text-[11px] font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 flex items-center gap-3 uppercase tracking-wider"
                            >
                              {copiedId === clash._id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                              {copiedId === clash._id ? 'Copied!' : 'Copy Link'}
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>

                  <a
                    href={`https://lugmaticmusic.com/clash/${clash._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold uppercase tracking-widest rounded transition-all shadow-lg shadow-purple-600/20"
                  >
                    Watch Back
                    <ExternalLink className="h-3 w-3" />
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
