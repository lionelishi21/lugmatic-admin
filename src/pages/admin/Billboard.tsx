import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, TrendingUp, Calendar, Clock, Play, 
  ChevronRight, ListMusic, AlertCircle, Share2, 
  Zap, Trophy, BarChart3, Star, RefreshCw
} from 'lucide-react';
import apiService from '../../services/api';
import Preloader from '../../components/ui/Preloader';

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
        throw new Error(response.data.message || 'Failed to fetch billboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Data synchronization interrupted.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillboard(period);
  }, [period]);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
            <Trophy className="text-emerald-500" size={32} />
            Billboard
          </h1>
          <p className="text-zinc-500">Global performance tracking and trending asset index.</p>
        </div>

        <div className="flex bg-[#0a0a0a] border border-white/5 rounded-3xl p-1 gap-1">
          {[
            { id: 'week', label: 'Weekly', icon: Calendar },
            { id: 'month', label: 'Monthly', icon: Clock }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setPeriod(t.id as any)}
              className={`flex items-center gap-2 px-6 py-2 rounded-2xl text-xs font-semibold transition-all ${
                period === t.id ? 'bg-white/10 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <t.icon size={14} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Charts */}
      <div className="premium-card !p-0 overflow-hidden relative min-h-[500px]">
        <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-[#0a0a0a]">
          <div className="flex items-center gap-3 text-xs font-bold text-zinc-500 uppercase tracking-widest">
            <BarChart3 size={16} className="text-emerald-500" />
            Live Rankings
          </div>
          <div className="flex items-center gap-2 text-[10px] font-medium text-zinc-600 italic">
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            Updates every 24 hours
          </div>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="py-32 flex flex-col items-center gap-4"
            >
              <RefreshCw className="h-8 w-8 text-emerald-500 animate-spin" />
              <p className="text-sm font-medium text-zinc-500">Synchronizing chart data...</p>
            </motion.div>
          ) : error ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="py-32 text-center"
            >
              <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
              <h3 className="text-white font-bold text-xl mb-2">Sync Error</h3>
              <p className="text-zinc-500 text-sm max-w-xs mx-auto mb-8">{error}</p>
              <button onClick={() => fetchBillboard(period)} className="btn-primary !px-8">Retry Connection</button>
            </motion.div>
          ) : songs.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="py-32 text-center"
            >
              <ListMusic className="h-12 w-12 text-zinc-800 mx-auto mb-4" />
              <p className="text-zinc-500 font-medium">Awaiting initial data stream...</p>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="divide-y divide-white/5"
            >
              {songs.map((song, index) => {
                const playCount = song.billboardStats?.plays || song.periodPlayCount || 0;
                const isTop3 = index < 3;
                return (
                  <motion.div
                    key={song._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between px-6 py-5 hover:bg-white/[0.02] transition-all group"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-8 text-center">
                        <span className={`text-2xl font-bold italic tracking-tighter ${
                          index === 0 ? 'text-emerald-500' :
                          index === 1 ? 'text-zinc-300' :
                          index === 2 ? 'text-zinc-500' : 'text-zinc-800'
                        }`}>
                          {index + 1}
                        </span>
                      </div>

                      <div className="relative w-14 h-14 rounded-xl bg-zinc-900 overflow-hidden border border-white/5 group-hover:border-emerald-500/20 transition-all">
                        <img
                          src={song.coverArtUrl || song.coverArt}
                          alt={song.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                          onError={(e: any) => e.target.src = '/placeholder-song.png'}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                          <Play size={20} className="text-white fill-white" />
                        </div>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors truncate max-w-[200px]">
                          {song.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs font-medium text-zinc-500">
                            {song.artist?.artistName || song.artist?.name || 'Unknown'}
                          </p>
                          <span className="w-1 h-1 rounded-full bg-zinc-800" />
                          <span className="text-[10px] font-bold text-emerald-500/80 uppercase tracking-widest">
                            {song.genre?.name || 'Vibe'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-12">
                      <div className="text-right hidden md:block">
                        <div className="flex items-center justify-end gap-2 text-white font-bold text-lg tabular-nums">
                          <Zap size={14} className="text-emerald-500" />
                          {playCount.toLocaleString()}
                        </div>
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-0.5">
                          Stream Velocity
                        </p>
                      </div>
                      <button className="p-2.5 rounded-xl bg-white/5 text-zinc-500 hover:text-white transition-all group-hover:bg-white/10">
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Insight Card */}
      <div className="premium-card relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-emerald-500/10 transition-colors" />
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <TrendingUp size={24} className="text-emerald-500" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-white mb-1">Rank Optimization</h4>
            <p className="text-zinc-500 text-sm max-w-xl leading-relaxed">
              Billboard charts are processed in real-time. Boost your visibility by optimizing metadata and ensuring consistent marketing engagement loops are active.
            </p>
          </div>
          <div className="flex gap-4 lg:ml-auto w-full lg:w-auto">
            <button className="flex-1 btn-secondary flex items-center justify-center gap-2 !py-3">
              <Share2 size={16} /> Share Chart
            </button>
            <button className="flex-1 btn-primary !py-3 !px-8 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              Boost Signal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billboard;
