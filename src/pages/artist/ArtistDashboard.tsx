import React, { useEffect } from 'react';
import {
  Music2,
  Headphones,
  DollarSign,
  TrendingUp,
  Clock,
  Users,
  Edit2,
  AlertCircle,
  ChevronRight,
  BarChart2,
  Radio,
  ArrowUpRight,
  Zap,
  Play,
  Upload as UploadIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchArtistById, fetchArtistStats, fetchArtistSongs } from '../../store/slices/artistSlice';
import { fetchArtistEarnings } from '../../store/slices/financeSlice';
import { userService } from '../../services/userService';
import ContributionList from '../../components/artist/ContributionList';
import { Skeleton } from '../../components/ui/skeleton';

const card = 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.06] rounded-lg';

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: 'easeOut' },
};

const stagger = (i: number) => ({ ...fadeUp, transition: { ...fadeUp.transition, delay: i * 0.07 } });

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
      if (res.data.success) setContributions(res.data.data.songs);
    } catch (err) {
      console.error('Failed to fetch contributions:', err);
    } finally {
      setLoadingContributions(false);
    }
  };

  const isLoading = artistLoading || financeLoading;

  const statCards = [
    {
      icon: Music2,
      label: 'Total Tracks',
      value: stats?.totalTracks ?? 0,
      iconCls: 'text-indigo-600 dark:text-indigo-400',
      iconBg: 'bg-indigo-50 dark:bg-indigo-500/10',
      trend: 'Release',
    },
    {
      icon: Headphones,
      label: 'Monthly Listeners',
      value: (stats?.monthlyListeners ?? 0).toLocaleString(),
      iconCls: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-50 dark:bg-emerald-500/10',
      trend: '+12.5%',
    },
    {
      icon: DollarSign,
      label: 'Total Earnings',
      value: `$${(earnings?.totalEarnings ?? 0).toLocaleString()}`,
      iconCls: 'text-amber-600 dark:text-amber-400',
      iconBg: 'bg-amber-50 dark:bg-amber-500/10',
      trend: 'Revenue',
    },
    {
      icon: Users,
      label: 'Social Followers',
      value: (stats?.socialMediaFollowers ?? 0).toLocaleString(),
      iconCls: 'text-rose-600 dark:text-rose-400',
      iconBg: 'bg-rose-50 dark:bg-rose-500/10',
      trend: 'Growth',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto pb-16 space-y-6">

      {/* ── Welcome Banner ── */}
      <motion.div {...fadeUp} className={`${card} p-8 relative overflow-hidden group`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/10 transition-colors" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
             <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
                <Music2 className="h-8 w-8 text-white" />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1.5 italic">Studio Central</p>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight uppercase italic">
                  {user?.name ?? 'Artist'} Dashboard
                </h1>
                <p className="text-sm text-zinc-500 mt-0.5 max-w-sm">
                  Control your sonic legacy and track your exponential growth in real-time.
                </p>
             </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/artist/upload')}
              className="h-12 px-6 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-zinc-900/10 flex items-center justify-center gap-3"
            >
              <UploadIcon className="h-4 w-4" />
              Upload Track
            </button>
            <button
              onClick={() => navigate('/artist/live')}
              className="h-12 px-6 bg-emerald-500 text-white rounded text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3"
            >
              <Radio className="h-4 w-4" />
              Go Live Now
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card_, i) => (
          <motion.div
            key={card_.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className={`${card} p-5 hover:border-zinc-300 dark:hover:border-white/10 transition-all group`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card_.iconBg} border border-zinc-100 dark:border-white/5`}>
                <card_.icon className={`h-5 w-5 ${card_.iconCls}`} />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-zinc-50 dark:bg-zinc-800 text-zinc-500">
                {card_.trend}
              </span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">{card_.label}</p>
            {isLoading ? (
              <Skeleton className="h-7 w-24 mt-1" />
            ) : (
              <p className="text-2xl font-black text-zinc-900 dark:text-white italic tracking-tighter tabular-nums">{card_.value}</p>
            )}
          </motion.div>
        ))}
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Latest Releases */}
        <motion.div {...stagger(4)} className={`${card} overflow-hidden flex flex-col`}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-white/[0.06] bg-zinc-50/50 dark:bg-zinc-800/20">
            <div className="flex items-center gap-3">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Discography</h2>
              <div className="w-1 h-1 rounded-full bg-zinc-700" />
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Recent Drops</p>
            </div>
            <button
              onClick={() => navigate('/artist/songs')}
              className="text-[10px] font-black text-emerald-500 hover:text-emerald-600 uppercase tracking-widest transition-all flex items-center gap-1.5"
            >
              Vault
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          
          <div className="divide-y divide-zinc-100 dark:divide-white/[0.04]">
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))
            ) : songs && songs.length > 0 ? (
              songs.slice(0, 5).map((track: any) => (
                <div key={track._id} className="flex items-center justify-between px-6 py-4 hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors group">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <img
                        src={track.coverArtUrl || track.coverArt || '/default-track-cover.jpg'}
                        alt={track.name || track.title}
                        className="w-12 h-12 rounded-lg object-cover border border-zinc-200 dark:border-white/10"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/default-track-cover.jpg'; }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                        <Play className="h-5 w-5 text-white fill-current" />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-tight truncate">{track.name || track.title}</h3>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-2 mt-1">
                        <BarChart2 className="h-3 w-3 text-emerald-500" />
                        {(track.playCount ?? track.plays ?? 0).toLocaleString()} <span className="text-zinc-600">Plays</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex flex-col items-end gap-1">
                       <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                         track.status === 'approved' 
                           ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                           : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                       }`}>
                         {track.status || 'Pending'}
                       </span>
                    </div>
                    <button
                      onClick={() => navigate(`/artist/songs/${track._id}/analytics`)}
                      className="p-2 text-zinc-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded transition-all"
                    >
                      <ArrowUpRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center">
                <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-zinc-200 dark:border-white/5">
                  <Music2 className="h-8 w-8 text-zinc-400" />
                </div>
                <p className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-tight">No tracks yet</p>
                <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest">Upload your first track to begin.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Activity Feed */}
        <motion.div {...stagger(5)} className={`${card} overflow-hidden flex flex-col`}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-white/[0.06] bg-zinc-50/50 dark:bg-zinc-800/20">
            <div className="flex items-center gap-3">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Logbook</h2>
              <div className="w-1 h-1 rounded-full bg-zinc-700" />
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Latest Events</p>
            </div>
            <button
              onClick={() => navigate('/artist/earnings')}
              className="text-[10px] font-black text-emerald-500 hover:text-emerald-600 uppercase tracking-widest transition-all flex items-center gap-1.5"
            >
              Ledger
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-white/[0.04]">
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <Skeleton className="w-12 h-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-44" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))
            ) : earnings?.history && earnings.history.length > 0 ? (
              earnings.history.slice(0, 5).map((activity: any) => (
                <div key={activity._id} className="flex items-center gap-4 px-6 py-4 hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 border border-zinc-200 dark:border-white/5 ${
                    activity.type === 'gift_received'
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : 'bg-indigo-500/10 text-indigo-500'
                  }`}>
                    {activity.type === 'gift_received'
                      ? <DollarSign className="h-5 w-5" />
                      : <Music2 className="h-5 w-5" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-tight truncate">{activity.description}</p>
                    <div className="flex items-center gap-3 mt-1">
                       <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                         <Clock className="h-3 w-3" />
                         {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                       </p>
                       <div className="w-1 h-1 rounded-full bg-zinc-700" />
                       <span className="text-[9px] font-black uppercase tracking-tighter text-emerald-500">Live</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center">
                <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-zinc-200 dark:border-white/5">
                  <Zap className="h-8 w-8 text-zinc-400" />
                </div>
                <p className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-tight">No activity</p>
                <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest">Events will appear once you start earning.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Contributions + Earnings Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Contributions */}
        <motion.div {...stagger(6)} className={`${card} overflow-hidden`}>
          <div className="px-6 py-5 border-b border-zinc-100 dark:border-white/[0.06] bg-zinc-50/50 dark:bg-zinc-800/20">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <Users className="h-4 w-4 text-purple-500" />
                   <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Collaborations</h2>
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-purple-500/10 text-purple-500 border border-purple-500/20">
                  Splits
                </span>
             </div>
          </div>
          <div className="p-6">
            <ContributionList contributions={contributions} loading={loadingContributions} />
          </div>
        </motion.div>

        {/* Earnings Overview */}
        <motion.div {...stagger(7)} className={`${card} overflow-hidden`}>
          <div className="px-6 py-5 border-b border-zinc-100 dark:border-white/[0.06] bg-zinc-50/50 dark:bg-zinc-800/20">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <TrendingUp className="h-4 w-4 text-emerald-500" />
                   <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Fiscal Performance</h2>
                </div>
                <button
                  onClick={() => navigate('/artist/earnings')}
                  className="text-[10px] font-black text-emerald-500 hover:text-emerald-600 uppercase tracking-widest transition-all"
                >
                  Statement
                </button>
             </div>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4">
            {[
              { label: 'Cumulative Revenue', value: `$${(earnings?.totalEarnings ?? 0).toLocaleString()}`, dot: 'bg-emerald-500' },
              { label: 'Active Period', value: `$${(earnings?.monthlyEarnings ?? 0).toLocaleString()}`, dot: 'bg-indigo-500' },
            ].map(({ label, value, dot }) => (
              <div key={label} className="p-6 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl border border-zinc-100 dark:border-white/[0.04] group hover:border-zinc-300 dark:hover:border-white/10 transition-all">
                <div className={`w-1.5 h-1.5 rounded-full ${dot} mb-4 shadow-sm`} />
                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">{label}</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-24 mt-1" />
                ) : (
                  <p className="text-2xl font-black text-zinc-900 dark:text-white italic tracking-tighter tabular-nums">{value}</p>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
