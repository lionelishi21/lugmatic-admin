import React, { useEffect } from 'react';
import {
  Music2, Headphones, DollarSign, TrendingUp, Clock, Users,
  Edit2, AlertCircle, ChevronRight, BarChart2, Radio,
  ArrowUpRight, Zap, Play, Upload as UploadIcon, Shield,
  Layers, Activity, Star, Target, Cpu, CheckCircle2,
  Swords, Award, Podcast, Gift, Film, Settings,
  ArrowRight,
  TrendingDown,
  Activity as ActivityIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchArtistById, fetchArtistStats, fetchArtistSongs } from '../../store/slices/artistSlice';
import { fetchArtistEarnings } from '../../store/slices/financeSlice';
import { userService } from '../../services/userService';
import ContributionList from '../../components/artist/ContributionList';
import { Skeleton } from '../../components/ui/skeleton';

export default function ArtistDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { stats, songs, loading: artistLoading } = useSelector((state: RootState) => state.artist);
  const { earnings, loading: financeLoading } = useSelector((state: RootState) => state.finance);

  const [contributions, setContributions] = React.useState<any[]>([]);
  const [loadingContributions, setLoadingContributions] = React.useState(true);

  useEffect(() => {
    if (user?.artistId) {
      const artistId = String(user.artistId);
      dispatch(fetchArtistById(artistId));
      dispatch(fetchArtistStats(artistId));
      dispatch(fetchArtistSongs(artistId));
      dispatch(fetchArtistEarnings());
      fetchContributions();
    }
  }, [dispatch, user?.artistId]);

  const fetchContributions = async () => {
    try {
      setLoadingContributions(true);
      const res = await userService.getContributorDashboard();
      const fetchedSongs = res.data?.data?.songs || res.data?.songs || [];
      setContributions(fetchedSongs);
    } catch (err: any) {
      if (err.response?.status !== 404) {
        console.error('Failed to fetch contributions:', err);
      }
    } finally {
      setLoadingContributions(false);
    }
  };

  const isLoading = artistLoading || financeLoading;

  const statCards = [
    { label: 'Total Songs', value: stats?.totalTracks ?? 0, icon: Music2, color: 'indigo', trend: 'Catalog' },
    { label: 'Monthly Listeners', value: (stats?.monthlyListeners ?? 0).toLocaleString(), icon: Headphones, color: 'emerald', trend: '+12.5%' },
    { label: 'Total Earnings', value: `$${(earnings?.totalEarnings ?? 0).toLocaleString()}`, icon: DollarSign, color: 'amber', trend: 'Revenue' },
    { label: 'Followers', value: (stats?.socialMediaFollowers ?? 0).toLocaleString(), icon: Users, color: 'rose', trend: 'Growth' },
  ];

  const colorMap: Record<string, any> = {
    emerald: { bg: 'bg-emerald-500/5', icon: 'text-emerald-500', border: 'border-emerald-500/10' },
    indigo:  { bg: 'bg-indigo-500/5',  icon: 'text-indigo-500',  border: 'border-indigo-500/10' },
    amber:   { bg: 'bg-amber-500/5',   icon: 'text-amber-500',   border: 'border-amber-500/10' },
    rose:    { bg: 'bg-rose-500/5',    icon: 'text-rose-500',    border: 'border-rose-500/10' },
  };

  return (
    <div className="space-y-10 pb-24">
      {/* Premium Welcome Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="premium-card !p-12 relative overflow-hidden group shadow-2xl border-white/5"
      >
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/[0.03] blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-12 z-10">
          <div className="flex items-center gap-8">
             <div className="w-20 h-20 bg-zinc-950 rounded-3xl flex items-center justify-center flex-shrink-0 border border-white/5 shadow-2xl transition-all duration-700 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent" />
                <img src={user?.profilePicture || '/default-avatar.png'} className="w-full h-full object-cover opacity-80" alt="" />
             </div>
             <div>
                <h2 className="text-4xl font-bold text-white tracking-tight mb-2">
                  Welcome back, {user?.name?.split(' ')[0] ?? 'Artist'}
                </h2>
                <p className="text-zinc-500 font-medium max-w-md leading-relaxed">
                   Here's an overview of your music performance and earnings for this month.
                </p>
             </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/artist/upload')}
              className="h-14 px-8 bg-white text-black rounded-2xl text-sm font-semibold hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-3 border border-white/10"
            >
              <UploadIcon size={18} />
              Upload Song
            </button>
            <button
              onClick={() => navigate('/artist/live')}
              className="h-14 px-8 bg-emerald-500 text-black rounded-2xl text-sm font-semibold hover:bg-emerald-400 hover:scale-105 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-3"
            >
              <Radio size={18} />
              Go Live
            </button>
          </div>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card_, i) => {
          const c = colorMap[card_.color];
          const Icon = card_.icon;
          return (
            <motion.div
              key={card_.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="premium-card group hover:border-emerald-500/20 transition-all cursor-default relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${c.bg} border border-white/5 transition-all group-hover:scale-110 shadow-inner`}>
                  <Icon size={20} className={c.icon} />
                </div>
                <div className="text-[10px] font-bold px-2 py-1 rounded-lg bg-black/20 border border-white/5 text-zinc-500 tracking-wide">
                  {card_.trend}
                </div>
              </div>
              <p className="text-zinc-500 text-xs font-semibold mb-1">{card_.label}</p>
              {isLoading ? (
                <Skeleton className="h-8 w-24 bg-white/5 rounded-lg" />
              ) : (
                <p className="text-3xl font-bold text-white tracking-tight tabular-nums leading-none group-hover:text-emerald-400 transition-colors">
                  {card_.value}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Songs */}
        <div className="premium-card !p-0 overflow-hidden flex flex-col border-white/5 shadow-xl">
          <div className="p-8 border-b border-white/5 flex items-center justify-between bg-zinc-950/20">
            <div>
              <h3 className="text-lg font-bold text-white">Your Recent Songs</h3>
              <p className="text-xs text-zinc-500 mt-1">Manage and track your latest releases</p>
            </div>
            <button
              onClick={() => navigate('/artist/songs')}
              className="text-sm font-semibold text-emerald-500 hover:text-emerald-400 transition-all flex items-center gap-1"
            >
              View All <ChevronRight size={16} />
            </button>
          </div>
          
          <div className="p-4 space-y-2 flex-1">
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4">
                  <Skeleton className="w-16 h-16 rounded-2xl bg-white/5" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48 bg-white/5" />
                    <Skeleton className="h-3 w-24 bg-white/5" />
                  </div>
                </div>
              ))
            ) : songs && songs.length > 0 ? (
              songs.slice(0, 5).map((track: any) => (
                <div key={track._id} className="flex items-center justify-between p-4 hover:bg-white/[0.02] rounded-2xl transition-all group cursor-pointer border border-transparent hover:border-white/5">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative flex-shrink-0 group-hover:scale-105 transition-all duration-500">
                      <img
                        src={track.coverArtUrl || track.coverArt || '/default-track-cover.jpg'}
                        alt={track.name}
                        className="w-16 h-16 rounded-2xl object-cover border border-white/5 bg-zinc-950 shadow-lg"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/default-track-cover.jpg'; }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center rounded-2xl">
                        <Play size={20} className="text-white fill-current" />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-white truncate group-hover:text-emerald-400 transition-colors">
                        {track.name || track.title}
                      </h4>
                      <div className="flex items-center gap-4 mt-1.5">
                        <div className="flex items-center gap-1.5">
                          <Activity size={12} className="text-emerald-500/70" />
                          <span className="text-xs text-zinc-500 font-medium">{(track.playCount ?? 0).toLocaleString()} plays</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-zinc-800" />
                        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">{track.status}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => navigate(`/artist/songs/${track._id}/analytics`)}
                    className="w-10 h-10 flex items-center justify-center bg-white/5 text-zinc-500 hover:text-white rounded-xl transition-all border border-white/5"
                  >
                    <ArrowUpRight size={18} />
                  </button>
                </div>
              ))
            ) : (
              <div className="py-20 text-center">
                <Music2 size={40} className="text-zinc-800 mx-auto mb-4" />
                <p className="text-sm text-zinc-500">No songs uploaded yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="premium-card !p-0 overflow-hidden flex flex-col border-white/5 shadow-xl">
          <div className="p-8 border-b border-white/5 flex items-center justify-between bg-zinc-950/20">
            <div>
              <h3 className="text-lg font-bold text-white">Earnings Activity</h3>
              <p className="text-xs text-zinc-500 mt-1">Latest revenue and community support</p>
            </div>
            <button
              onClick={() => navigate('/artist/earnings')}
              className="text-sm font-semibold text-emerald-500 hover:text-emerald-400 transition-all flex items-center gap-1"
            >
              View Report <ChevronRight size={16} />
            </button>
          </div>

          <div className="p-4 space-y-2 flex-1">
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4">
                  <Skeleton className="w-14 h-14 rounded-2xl bg-white/5" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-56 bg-white/5" />
                    <Skeleton className="h-3 w-32 bg-white/5" />
                  </div>
                </div>
              ))
            ) : earnings?.history && earnings.history.length > 0 ? (
              earnings.history.slice(0, 5).map((activity: any) => (
                <div key={activity._id} className="flex items-center gap-4 p-4 hover:bg-white/[0.02] rounded-2xl transition-all group border border-transparent hover:border-white/5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/5 shadow-inner ${
                    activity.type === 'gift_received'
                      ? 'bg-emerald-500/5 text-emerald-500'
                      : 'bg-indigo-500/5 text-indigo-500'
                  }`}>
                    {activity.type === 'gift_received' ? <Gift size={20} /> : <DollarSign size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate leading-snug">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                       <Clock size={12} className="text-zinc-700" />
                       <span className="text-xs text-zinc-500 font-medium">{formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold text-white tracking-tight">
                       +${(activity.amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center">
                <ActivityIcon size={40} className="text-zinc-800 mx-auto mb-4" />
                <p className="text-sm text-zinc-500">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Collaboration Section */}
      <div className="premium-card !p-0 overflow-hidden border-white/5 shadow-xl">
          <div className="p-8 border-b border-white/5 flex items-center justify-between bg-zinc-950/20">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                   <Layers size={18} className="text-indigo-500" />
                </div>
                <div>
                   <h3 className="text-lg font-bold text-white">Collaboration Splits</h3>
                   <p className="text-xs text-zinc-500 mt-1">Your shared revenue and collaborator tracks</p>
                </div>
             </div>
          </div>
          <div className="p-8">
            <ContributionList contributions={contributions} loading={loadingContributions} />
          </div>
      </div>
    </div>
  );
}
