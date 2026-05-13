import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, TrendingUp, Calendar, Clock, Play, 
  ChevronRight, ListMusic, AlertCircle, Share2, 
  Zap, Trophy, BarChart3, Star, RefreshCw, Loader2
} from 'lucide-react';
import apiService from '../../services/api';

const Billboard: React.FC = () => {
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBillboard = async (selectedPeriod: 'week' | 'month') => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.get<any[]>(`/song/billboard?period=${selectedPeriod}`);
      if (response.data.success) {
        setSongs(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch rankings');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to connect to chart services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillboard(period);
  }, [period]);

  return (
    <div className="max-w-7xl mx-auto pb-24 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold tracking-tight text-white leading-none uppercase">Billboard</h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Live Charts</span>
            </div>
          </div>
          <p className="text-zinc-500 font-medium">Top performing tracks across the global community.</p>
        </div>

        <div className="flex bg-zinc-950 border border-white/5 rounded-[2rem] p-1.5 gap-1">
          {[
            { id: 'week', label: 'Weekly', icon: Calendar },
            { id: 'month', label: 'Monthly', icon: Clock }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setPeriod(t.id as any)}
              className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                period === t.id ? 'bg-white text-black shadow-xl' : 'text-zinc-500 hover:text-white'
              }`}
            >
              <t.icon size={14} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rankings List */}
      <div className="premium-card !p-0 overflow-hidden border-white/5 shadow-2xl relative min-h-[600px] rounded-[3rem]">
        <div className="px-10 py-6 border-b border-white/5 flex items-center justify-between bg-zinc-950/20">
          <div className="flex items-center gap-4 text-xs font-bold text-white uppercase tracking-widest">
            <BarChart3 size={18} className="text-emerald-500" />
            Top Performances
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            Updated every 24 hours
          </div>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-40 flex flex-col items-center gap-6">
              <Loader2 size={40} className="text-emerald-500 animate-spin" />
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Loading Rankings</p>
            </motion.div>
          ) : error ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-40 text-center px-10">
              <AlertCircle size={48} className="text-rose-500 mx-auto mb-6" />
              <h3 className="text-white font-bold text-xl uppercase mb-3">Connection Error</h3>
              <p className="text-zinc-500 text-sm font-medium max-w-sm mx-auto mb-10">{error}</p>
              <button onClick={() => fetchBillboard(period)} className="h-14 px-10 bg-white text-black rounded-2xl text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-xl">Try Again</button>
            </motion.div>
          ) : songs.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-40 text-center">
              <ListMusic size={48} className="text-zinc-900 mx-auto mb-6" />
              <p className="text-zinc-600 font-bold uppercase tracking-widest text-[10px]">No data available for this period</p>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="divide-y divide-white/5">
              {songs.map((song, index) => {
                const playCount = song.billboardStats?.plays || song.periodPlayCount || 0;
                return (
                  <motion.div
                    key={song._id}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between px-10 py-6 hover:bg-white/[0.02] transition-all group"
                  >
                    <div className="flex items-center gap-8">
                      <div className="w-10 text-center">
                        <span className={`text-4xl font-bold tracking-tighter italic ${
                          index === 0 ? 'text-emerald-500' :
                          index === 1 ? 'text-zinc-400' :
                          index === 2 ? 'text-zinc-600' : 'text-zinc-900'
                        }`}>
                          {(index + 1).toString().padStart(2, '0')}
                        </span>
                      </div>

                      <div className="relative w-16 h-16 rounded-2xl bg-zinc-950 overflow-hidden border border-white/5 group-hover:border-emerald-500/30 transition-all shrink-0">
                        <img
                          src={song.coverArtUrl || song.coverArt}
                          alt={song.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          onError={(e: any) => e.target.src = '/placeholder-song.png'}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                          <Play size={24} className="text-white fill-current" />
                        </div>
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors truncate max-w-[200px]">
                          {song.name}
                        </h3>
                        <div className="flex items-center gap-3 mt-1.5">
                          <p className="text-xs font-bold text-zinc-500 uppercase tracking-tight">
                            {song.artist?.artistName || song.artist?.name || 'Artist'}
                          </p>
                          <div className="w-1 h-1 rounded-full bg-zinc-800" />
                          <span className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest">
                            {song.genre?.name || 'Vibe'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-12">
                      <div className="text-right hidden md:block">
                        <div className="flex items-center justify-end gap-2 text-white font-bold text-xl tabular-nums tracking-tighter">
                          <Zap size={16} className="text-emerald-500" />
                          {playCount.toLocaleString()}
                        </div>
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-1">
                          Weekly Streams
                        </p>
                      </div>
                      <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-zinc-900 text-zinc-600 hover:text-white hover:bg-zinc-800 transition-all border border-white/5">
                        <ChevronRight size={24} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Promotion/Insight Banner */}
      <div className="premium-card relative overflow-hidden group border-white/5 shadow-2xl p-10 rounded-[3rem] bg-zinc-950/40">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full -mr-40 -mt-40 blur-[80px]" />
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10">
          <div className="w-16 h-16 rounded-[2rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <TrendingUp size={28} className="text-emerald-500" />
          </div>
          <div className="flex-1">
            <h4 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">Reach the Top</h4>
            <p className="text-zinc-500 font-medium text-lg leading-relaxed max-w-2xl">
              Tracks on the Billboard chart are processed in real-time based on listener engagement. Boost your visibility by sharing your profile and creating regular content.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto shrink-0">
            <button className="h-14 px-8 bg-zinc-900 text-zinc-400 border border-white/5 rounded-2xl text-xs font-bold uppercase tracking-widest hover:text-white transition-all flex items-center justify-center gap-3">
              <Share2 size={18} /> Share Chart
            </button>
            <button className="h-14 px-10 bg-emerald-500 text-black rounded-2xl text-xs font-bold uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3">
              <Zap size={18} /> Boost Reach
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billboard;
