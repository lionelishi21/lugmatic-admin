import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, TrendingUp, Calendar, Clock, Play, ChevronRight, ListMusic, AlertCircle, Share2, Zap } from 'lucide-react';
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
            console.error('Billboard error:', err);
            setError(err.response?.data?.message || err.message || 'An error occurred while fetching the billboard.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBillboard(period);
    }, [period]);

    return (
        <div className="max-w-5xl mx-auto pb-16 space-y-6 px-4 sm:px-0">
            {/* Header section */}
            <div className="bg-zinc-900 border border-white/[0.06] rounded-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" />

                <div className="flex items-center gap-4 relative z-10">
                    <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-sm flex items-center justify-center flex-shrink-0">
                        <Award className="h-7 w-7 text-emerald-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">
                            Lugmatic <span className="text-emerald-500">Billboard</span>
                        </h1>
                        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 mt-1">
                            Neural Tracking: Top Performing Assets
                        </p>
                    </div>
                </div>

                <div className="flex bg-black/40 border border-white/[0.06] rounded-sm p-1 gap-1 relative z-10">
                    <button
                        onClick={() => setPeriod('week')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all ${period === 'week'
                                ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                                : 'text-zinc-500 hover:text-white'
                            }`}
                    >
                        <Calendar className="h-3.5 w-3.5" />
                        Weekly
                    </button>
                    <button
                        onClick={() => setPeriod('month')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-all ${period === 'month'
                                ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                                : 'text-zinc-500 hover:text-white'
                            }`}
                    >
                        <Clock className="h-3.5 w-3.5" />
                        Monthly
                    </button>
                </div>
            </div>

            {/* Charts List Container */}
            <div className="bg-zinc-900 border border-white/[0.06] rounded-sm overflow-hidden relative">
                <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between bg-zinc-800/20">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <h2 className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-zinc-400">
                            Current {period === 'week' ? 'Weekly' : 'Monthly'} Rankings
                        </h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest hidden sm:block">Update Cycle: 0.8s</span>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </div>
                </div>

                <div className="relative min-h-[500px]">
                    <Preloader isVisible={loading} text={`Syncing Neural Data...`} />

                    {error && (
                        <div className="p-20 text-center">
                            <div className="w-16 h-16 bg-rose-500/10 rounded-sm flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
                                <AlertCircle className="h-8 w-8 text-rose-500" />
                            </div>
                            <h3 className="text-white font-black italic text-xl uppercase tracking-tighter mb-2">Sync Interrupted</h3>
                            <p className="text-zinc-500 text-xs mb-6 max-w-xs mx-auto font-mono">{error}</p>
                            <button
                                onClick={() => fetchBillboard(period)}
                                className="px-8 py-3 bg-zinc-800 border border-white/[0.06] text-white text-[10px] font-bold uppercase tracking-widest rounded-sm hover:border-emerald-500/50 transition-all"
                            >
                                Re-Establish Link
                            </button>
                        </div>
                    )}

                    {!loading && !error && (songs?.length || 0) === 0 && (
                        <div className="p-20 text-center">
                            <div className="w-14 h-14 bg-zinc-800 border border-white/[0.06] rounded-sm flex items-center justify-center mx-auto mb-4">
                                <ListMusic className="h-6 w-6 text-zinc-600" />
                            </div>
                            <h3 className="font-black italic text-xl text-white uppercase tracking-tighter">No Charts Found</h3>
                            <p className="text-xs text-zinc-500 mt-1 font-mono uppercase tracking-widest">Awaiting Initial Data Stream...</p>
                        </div>
                    )}

                    {!loading && (songs?.length || 0) > 0 && (
                        <div className="divide-y divide-white/[0.04]">
                            {songs.map((song, index) => {
                                const playCount = song.billboardStats?.plays || song.periodPlayCount || 0;
                                return (
                                    <motion.div
                                        key={song._id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                        className="flex items-center justify-between px-6 py-5 hover:bg-white/[0.02] transition-all group border-l-2 border-transparent hover:border-emerald-500/40"
                                    >
                                        <div className="flex items-center gap-6">
                                            {/* Rank */}
                                            <div className="w-10 text-center flex-shrink-0">
                                                <span className={`text-2xl font-black italic tracking-tighter ${index === 0 ? 'text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]' :
                                                        index === 1 ? 'text-zinc-300' :
                                                            index === 2 ? 'text-emerald-800' : 'text-zinc-800'
                                                    }`}>
                                                    {(index + 1).toString().padStart(2, '0')}
                                                </span>
                                            </div>

                                            {/* Artwork */}
                                            <div className="relative w-16 h-16 flex-shrink-0 rounded-sm bg-zinc-800 overflow-hidden shadow-xl border border-white/[0.06] group-hover:border-emerald-500/30 transition-all">
                                                <img
                                                    src={song.coverArtUrl || song.coverArt}
                                                    alt={song.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                    onError={(e: any) => e.target.src = '/placeholder-song.png'}
                                                />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                                    <Play className="h-6 w-6 text-white fill-white animate-pulse" />
                                                </div>
                                            </div>

                                            {/* Info */}
                                            <div className="min-w-0">
                                                <h3 className="text-base font-black italic text-white truncate uppercase tracking-tighter group-hover:text-emerald-500 transition-colors">
                                                    {song.name}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest truncate max-w-[150px]">
                                                        {song.artist?.artistName || song.artist?.name || 'Unknown Artist'}
                                                    </p>
                                                    <div className="h-1 w-1 rounded-full bg-zinc-800" />
                                                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter bg-emerald-500/10 px-1.5 py-0.5 border border-emerald-500/20">
                                                        {song.genre?.name || 'Vibe'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-10">
                                            {/* Stats */}
                                            <div className="text-right hidden md:block">
                                                <div className="flex items-center justify-end gap-1.5 text-white font-black italic text-lg tracking-tight tabular-nums group-hover:text-emerald-500 transition-colors">
                                                    <Zap className="h-3.5 w-3.5 text-emerald-500" />
                                                    {playCount.toLocaleString()}
                                                </div>
                                                <p className="text-[9px] font-mono font-bold text-zinc-600 uppercase tracking-widest mt-0.5">
                                                    Stream Velocity / {period}
                                                </p>
                                            </div>

                                            <button className="w-10 h-10 border border-white/[0.06] rounded-sm flex items-center justify-center text-zinc-600 hover:text-emerald-500 hover:border-emerald-500/30 transition-all bg-black/20">
                                                <ChevronRight className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Tip Card */}
            <div className="bg-zinc-900 border border-white/[0.06] rounded-sm p-10 overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full -mr-40 -mt-40 blur-3xl group-hover:bg-emerald-500/10 transition-colors duration-1000" />
                <div className="absolute bottom-0 left-0 w-1 h-0 group-hover:h-full bg-emerald-500 transition-all duration-700" />

                <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8">
                    <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-sm flex items-center justify-center flex-shrink-0 shadow-2xl">
                        <TrendingUp className="h-8 w-8 text-emerald-500" />
                    </div>
                    <div className="text-center lg:text-left">
                        <h4 className="text-xl font-black italic text-white mb-2 uppercase tracking-tighter">Neural Rank Optimization</h4>
                        <p className="text-zinc-500 text-xs max-w-xl leading-relaxed font-mono uppercase tracking-wider">
                            The Billboard algorithm processes global engagement data in real-time. To maintain rank velocity, ensure your metadata is sharp and your marketing loops are active.
                        </p>
                    </div>
                    <div className="flex gap-4 lg:ml-auto w-full lg:w-auto">
                        <button className="flex-1 lg:flex-none px-8 py-4 border border-white/[0.06] text-white text-[10px] font-bold uppercase tracking-widest rounded-sm hover:border-emerald-500/50 transition-all flex items-center justify-center gap-2">
                            <Share2 className="w-3.5 h-3.5" /> Share Rank
                        </button>
                        <button className="flex-1 lg:flex-none px-8 py-4 bg-emerald-500 text-black text-[10px] font-bold uppercase tracking-widest rounded-sm hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                            Boost Signal
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Billboard;
