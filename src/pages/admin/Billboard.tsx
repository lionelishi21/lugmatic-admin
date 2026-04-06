import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, TrendingUp, Calendar, Clock, Play, ChevronRight, ListMusic } from 'lucide-react';
import axios from 'axios';
import Preloader from '../../components/ui/Preloader';

interface BillboardSong {
    _id: string;
    name: string;
    artist: {
        _id: string;
        artistName?: string;
        name?: string;
        image?: string;
    };
    coverArt: string;
    periodPlayCount: number;
    genre?: { name: string };
    audioFileUrl?: string;
    coverArtUrl?: string;
}

const Billboard: React.FC = () => {
    const [period, setPeriod] = useState<'week' | 'month'>('week');
    const [songs, setSongs] = useState<BillboardSong[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBillboard = async (selectedPeriod: 'week' | 'month') => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/songs/billboard?period=${selectedPeriod}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
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
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Header section */}
            <div className="mb-10 text-center">
                <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-emerald-500/10 text-emerald-600">
                    <Award className="h-10 w-10" />
                </div>
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
                    Lugmatic Billboard
                </h1>
                <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                    The pulse of the platform. Tracking the absolute hottest tracks across the massive right now.
                </p>
            </div>

            {/* Period Switcher */}
            <div className="flex justify-center mb-10">
                <div className="inline-flex p-1 bg-white border border-gray-200 rounded-2xl shadow-sm">
                    <button
                        onClick={() => setPeriod('week')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                            period === 'week' 
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' 
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        <Calendar className="h-4 w-4" />
                        Weekly Charts
                    </button>
                    <button
                        onClick={() => setPeriod('month')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                            period === 'month' 
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' 
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        <Clock className="h-4 w-4" />
                        Monthly Top
                    </button>
                </div>
            </div>

            {/* Charts List */}
            <div className="relative">
                <Preloader isVisible={loading} text={`Tuning into the ${period}...`} />
                
                {error && (
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
                        <p className="text-red-700 font-medium mb-4">{error}</p>
                        <button 
                            onClick={() => fetchBillboard(period)} 
                            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {!loading && !error && songs.length === 0 && (
                    <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center shadow-sm">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ListMusic className="h-8 w-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">No charts available yet</h3>
                        <p className="text-gray-500 mt-1">Start playing music to generate the billboard!</p>
                    </div>
                )}

                {!loading && songs.length > 0 && (
                    <div className="space-y-4">
                        {songs.map((song, index) => (
                            <motion.div
                                key={song._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="group bg-white hover:bg-gray-50/50 border border-gray-100 rounded-2xl p-4 flex items-center gap-4 transition-all duration-300 shadow-sm hover:shadow-md"
                            >
                                {/* Rank */}
                                <div className="w-12 flex-shrink-0 flex items-center justify-center">
                                    {index === 0 ? (
                                        <div className="w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center shadow-lg shadow-amber-400/30">
                                            <span className="text-white font-bold text-lg">1</span>
                                        </div>
                                    ) : index === 1 ? (
                                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center shadow-lg shadow-gray-300/30">
                                            <span className="text-white font-bold text-lg">2</span>
                                        </div>
                                    ) : index === 2 ? (
                                        <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center shadow-lg shadow-amber-600/30">
                                            <span className="text-white font-bold text-lg">3</span>
                                        </div>
                                    ) : (
                                        <span className="text-xl font-bold text-gray-300">{index + 1}</span>
                                    )}
                                </div>

                                {/* Artwork */}
                                <div className="relative w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden shadow-inner group-hover:scale-105 transition-transform duration-300">
                                    <img 
                                        src={song.coverArtUrl || song.coverArt} 
                                        alt={song.name} 
                                        className="w-full h-full object-cover"
                                        onError={(e: any) => e.target.src = '/placeholder-song.png'}
                                    />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <Play className="h-6 w-6 text-white fill-white" />
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-bold text-gray-900 truncate group-hover:text-emerald-600 transition-colors">
                                        {song.name}
                                    </h3>
                                    <p className="text-sm font-medium text-gray-500 truncate mt-0.5">
                                        {song.artist?.artistName || song.artist?.name || 'Unknown Artist'}
                                    </p>
                                </div>

                                {/* Stats */}
                                <div className="hidden md:flex flex-col items-end px-8">
                                    <div className="flex items-center gap-1.5 text-emerald-600">
                                        <TrendingUp className="h-4 w-4" />
                                        <span className="text-lg font-bold">
                                            {song.periodPlayCount.toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                                        Plays this {period}
                                    </p>
                                </div>

                                {/* Metadata Bar */}
                                <div className="hidden lg:flex items-center gap-4 border-l border-gray-100 pl-8">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Genre</span>
                                        <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                                            {song.genre?.name || 'Dancehall'}
                                        </span>
                                    </div>
                                </div>

                                {/* Action */}
                                <div className="ml-2">
                                    <button className="p-2 text-gray-300 hover:text-emerald-500 transition-colors">
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer Tip */}
            <div className="mt-12 p-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl text-white overflow-hidden relative">
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                    <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-xl">
                        <TrendingUp className="h-10 w-10 text-emerald-400" />
                    </div>
                    <div>
                        <h4 className="text-lg font-bold mb-1">Stay Trending</h4>
                        <p className="text-gray-400 text-sm max-w-xl">
                            The billboard is updated in real-time based on actual listeners across the globe. Keep your tracks sharp and promote your music to climb the ranks!
                        </p>
                    </div>
                    <button className="md:ml-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-500/25">
                        Promote Tracks
                    </button>
                </div>
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full" />
            </div>
        </div>
    );
};

export default Billboard;
