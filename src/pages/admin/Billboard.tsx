import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, TrendingUp, Calendar, Clock, Play, ChevronRight, ListMusic, AlertCircle } from 'lucide-react';
import apiService from '../../services/api';
import Preloader from '../../components/ui/Preloader';

const card = 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] rounded-lg';

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
        <div className="max-w-5xl mx-auto pb-16 space-y-6">
            {/* Header section */}
            <div className={`${card} p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Award className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
                            Lugmatic Billboard
                        </h1>
                        <p className="text-sm text-zinc-500 mt-0.5">
                            Tracking the hottest tracks across the platform
                        </p>
                    </div>
                </div>

                <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded p-1 gap-1">
                    <button
                        onClick={() => setPeriod('week')}
                        className={`flex items-center gap-2 px-6 py-2 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${
                            period === 'week' 
                            ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' 
                            : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                        }`}
                    >
                        <Calendar className="h-3.5 w-3.5" />
                        Weekly
                    </button>
                    <button
                        onClick={() => setPeriod('month')}
                        className={`flex items-center gap-2 px-6 py-2 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${
                            period === 'month' 
                            ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' 
                            : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                        }`}
                    >
                        <Clock className="h-3.5 w-3.5" />
                        Monthly
                    </button>
                </div>
            </div>

            {/* Charts List Container */}
            <div className={`${card} overflow-hidden`}>
                <div className="px-6 py-4 border-b border-zinc-100 dark:border-white/[0.06] flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/20">
                    <h2 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                        Current {period === 'week' ? 'Weekly' : 'Monthly'} Rankings
                    </h2>
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                </div>

                <div className="relative min-h-[400px]">
                    <Preloader isVisible={loading} text={`Tuning into the ${period}...`} />
                    
                    {error && (
                        <div className="p-20 text-center">
                            <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
                                <AlertCircle className="h-8 w-8 text-rose-500" />
                            </div>
                            <h3 className="text-zinc-900 dark:text-white font-bold text-lg mb-2">Something went wrong</h3>
                            <p className="text-zinc-500 text-sm mb-6 max-w-xs mx-auto">{error}</p>
                            <button 
                                onClick={() => fetchBillboard(period)} 
                                className="px-8 py-2.5 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest rounded hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {!loading && !error && (songs?.length || 0) === 0 && (
                        <div className="p-20 text-center">
                            <div className="w-14 h-14 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <ListMusic className="h-6 w-6 text-zinc-400" />
                            </div>
                            <h3 className="font-bold text-zinc-900 dark:text-white uppercase tracking-tight">No charts available</h3>
                            <p className="text-sm text-zinc-500 mt-1">Awaiting the next wave of hits...</p>
                        </div>
                    )}

                    {!loading && (songs?.length || 0) > 0 && (
                        <div className="divide-y divide-zinc-100 dark:divide-white/[0.04]">
                            {songs.map((song, index) => {
                                const playCount = song.billboardStats?.plays || song.periodPlayCount || 0;
                                return (
                                    <motion.div
                                        key={song._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.04 }}
                                        className="flex items-center justify-between px-6 py-4 hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors group"
                                    >
                                        <div className="flex items-center gap-5">
                                            {/* Rank */}
                                            <div className="w-8 text-center flex-shrink-0">
                                                <span className={`text-xl font-black italic tracking-tighter ${
                                                    index === 0 ? 'text-emerald-500' : 
                                                    index === 1 ? 'text-zinc-400' : 
                                                    index === 2 ? 'text-amber-700' : 'text-zinc-200 dark:text-zinc-800'
                                                }`}>
                                                    {index + 1}
                                                </span>
                                            </div>

                                            {/* Artwork */}
                                            <div className="relative w-14 h-14 flex-shrink-0 rounded bg-zinc-100 dark:bg-zinc-800 overflow-hidden shadow-sm border border-zinc-200 dark:border-white/10">
                                                <img 
                                                    src={song.coverArtUrl || song.coverArt} 
                                                    alt={song.name} 
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    onError={(e: any) => e.target.src = '/placeholder-song.png'}
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                                    <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                                                        <Play className="h-4 w-4 text-white fill-white ml-0.5" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Info */}
                                            <div className="min-w-0">
                                                <h3 className="text-sm font-bold text-zinc-900 dark:text-white truncate uppercase tracking-tight group-hover:text-emerald-500 transition-colors">
                                                    {song.name}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest truncate max-w-[120px]">
                                                        {song.artist?.artistName || song.artist?.name || 'Unknown Artist'}
                                                    </p>
                                                    <div className="h-0.5 w-0.5 rounded-full bg-zinc-700" />
                                                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter">
                                                        {song.genre?.name || 'Vibe'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-8">
                                            {/* Stats */}
                                            <div className="text-right hidden sm:block">
                                                <div className="flex items-center justify-end gap-1.5 text-zinc-900 dark:text-white font-bold tabular-nums">
                                                    <TrendingUp className="h-3 w-3 text-emerald-500" />
                                                    {playCount.toLocaleString()}
                                                </div>
                                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
                                                    Plays this {period}
                                                </p>
                                            </div>

                                            <button className="p-2 text-zinc-400 hover:text-emerald-500 transition-all">
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
            <div className={`${card} p-10 overflow-hidden relative group`}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-emerald-500/10 transition-colors duration-1000" />
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
                        <TrendingUp className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-zinc-900 dark:text-white mb-1 uppercase tracking-tight">Stay Trending</h4>
                        <p className="text-zinc-500 text-sm max-w-xl leading-relaxed">
                            The billboard is updated in real-time based on actual listeners across the globe. Keep your tracks sharp and promote your music to climb the ranks!
                        </p>
                    </div>
                    <button className="md:ml-auto px-8 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[10px] font-bold uppercase tracking-widest rounded hover:opacity-90 transition-all whitespace-nowrap shadow-xl">
                        Boost Reach
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Billboard;
