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
  Upload as UploadIcon,
  Shield,
  Layers,
  Activity
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

// ── Shared primitives ─────────────────────────────────────────────
const card = 'bg-zinc-900 border border-white/[0.06] rounded-lg shadow-2xl relative overflow-hidden group';
const labelClass = 'block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1.5 italic';

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
      // Ensure we check for data safely
      const songs = res.data?.data?.songs || res.data?.songs || [];
      setContributions(songs);
    } catch (err: any) {
      // Suppress 404 error logs for contributor dashboard as it's common for new artists
      if (err.response?.status !== 404) {
        console.error('Failed to fetch contributions:', err);
      }
    } finally {
      setLoadingContributions(false);
    }
  };

  const isLoading = artistLoading || financeLoading;

  const statCards = [
    {
      icon: Music2,
      label: 'Tracks',
      value: stats?.totalTracks ?? 0,
      iconCls: 'text-indigo-400',
      iconBg: 'bg-indigo-500/10',
      trend: 'Total',
    },
    {
      icon: Headphones,
      label: 'Monthly Listeners',
      value: (stats?.monthlyListeners ?? 0).toLocaleString(),
      iconCls: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10',
      trend: '+12.5%',
    },
    {
      icon: DollarSign,
      label: 'Total Earnings',
      value: `$${(earnings?.totalEarnings ?? 0).toLocaleString()}`,
      iconCls: 'text-amber-400',
      iconBg: 'bg-amber-500/10',
      trend: 'Revenue',
    },
    {
      icon: Users,
      label: 'Followers',
      value: (stats?.socialMediaFollowers ?? 0).toLocaleString(),
      iconCls: 'text-rose-400',
      iconBg: 'bg-rose-500/10',
      trend: 'Growth',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto pb-16 space-y-8 animate-in fade-in duration-700">

      {/* ── Branded Welcome HUD ── */}
      <motion.div {...fadeUp} className={`${card} p-10 relative overflow-hidden group shadow-2xl hover:shadow-emerald-500/5 transition-all duration-700`}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/[0.03] blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/[0.01] rounded-tr-full pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-10 z-10">
          <div className="flex items-center gap-8">
             <div className="w-20 h-20 bg-emerald-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xl shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-500">
                <Shield className="h-10 w-10 text-white" />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-2 italic">Studio Matrix v1.4</p>
                <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight uppercase italic leading-none">
                  Welcome, {user?.name ?? 'Artist'}
                </h1>
                <p className="text-sm text-zinc-500 mt-3 max-w-sm font-medium leading-relaxed">
                  Operational status: <span className="text-emerald-500 font-black italic">Active</span>. Real-time telemetry monitoring enabled for tactical distribution.
                </p>
             </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/artist/upload')}
              className="h-14 px-8 bg-white text-zinc-900 rounded-xl text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-2xl shadow-zinc-950/20 flex items-center justify-center gap-4 group/btn"
            >
              <UploadIcon className="h-4.5 w-4.5 group-hover:-translate-y-1 transition-transform" />
              Upload Track
            </button>
            <button
              onClick={() => navigate('/artist/live')}
              className="h-14 px-8 bg-emerald-500 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:scale-105 transition-all shadow-2xl shadow-emerald-500/30 flex items-center justify-center gap-4 group/btn"
            >
              <Radio className="h-4.5 w-4.5 animate-pulse" />
              Go Live
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Telemetry Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card_, i) => (
          <motion.div
            key={card_.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className={`${card} p-6 hover:border-emerald-500/20 transition-all group cursor-default shadow-sm hover:shadow-2xl hover:shadow-emerald-500/5`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card_.iconBg} border border-white/[0.04] shadow-inner`}>
                <card_.icon className={`h-6 w-6 ${card_.iconCls}`} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md bg-zinc-950 text-zinc-500 border border-white/[0.04] italic">
                {card_.trend}
              </span>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-500 mb-2 italic">{card_.label}</p>
            {isLoading ? (
              <Skeleton className="h-8 w-24 mt-1 bg-zinc-800" />
            ) : (
              <p className="text-3xl font-black text-zinc-900 dark:text-white italic tracking-tighter tabular-nums group-hover:text-emerald-500 transition-colors">
                {card_.value}
              </p>
            )}
          </motion.div>
        ))}
      </div>

      {/* ── Main Operations Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Source Discography */}
        <motion.div {...stagger(4)} className={`${card} overflow-hidden flex flex-col`}>
          <div className="flex items-center justify-between px-8 py-6 border-b border-white/[0.06] bg-zinc-950/40">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                 <Music2 className="h-4 w-4 text-emerald-500" />
              </div>
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 italic">Recent Tracks</h2>
            </div>
            <button
              onClick={() => navigate('/artist/songs')}
              className="text-[10px] font-black text-emerald-500 hover:text-emerald-600 uppercase tracking-widest transition-all flex items-center gap-2 group"
            >
              View All Tracks
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          
          <div className="divide-y divide-white/[0.04] bg-zinc-950/10">
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-5 px-8 py-6">
                  <Skeleton className="w-14 h-14 rounded-xl bg-zinc-800" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-4 w-48 bg-zinc-800" />
                    <Skeleton className="h-3 w-24 bg-zinc-800" />
                  </div>
                </div>
              ))
            ) : songs && songs.length > 0 ? (
              songs.slice(0, 5).map((track: any) => (
                <div key={track._id} className="flex items-center justify-between px-8 py-6 hover:bg-emerald-500/[0.02] transition-colors group cursor-pointer">
                  <div className="flex items-center gap-5 min-w-0">
                    <div className="relative flex-shrink-0 group-hover:scale-105 transition-all duration-500 shadow-2xl">
                      <img
                        src={track.coverArtUrl || track.coverArt || '/default-track-cover.jpg'}
                        alt={track.name || track.title}
                        className="w-14 h-14 rounded-xl object-cover border border-white/[0.06] shadow-inner bg-zinc-950"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/default-track-cover.jpg'; }}
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl backdrop-blur-[2px]">
                        <Play className="h-6 w-6 text-white fill-current" />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight truncate italic group-hover:text-emerald-500 transition-colors">
                        {track.name || track.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-1.5">
                        <p className="text-[9px] text-emerald-500 font-black uppercase tracking-widest flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded">
                          <Activity className="h-3 w-3" />
                          {(track.playCount ?? track.plays ?? 0).toLocaleString()}
                        </p>
                        <span className="text-[9px] text-zinc-600 font-black uppercase tracking-widest italic">Plays</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-5">
                    <div className="hidden sm:flex flex-col items-end gap-1">
                       <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border italic ${
                         track.status === 'approved' 
                           ? 'bg-emerald-500/5 text-emerald-500 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                           : 'bg-amber-500/5 text-amber-500 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                       }`}>
                         {track.status || 'Pending'}
                       </span>
                    </div>
                    <button
                      onClick={() => navigate(`/artist/songs/${track._id}/analytics`)}
                      className="w-10 h-10 flex items-center justify-center bg-zinc-950 text-zinc-500 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all border border-white/[0.04] hover:border-emerald-500/20 shadow-xl"
                    >
                      <ArrowUpRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-24 text-center bg-zinc-950/20">
                <div className="w-20 h-20 bg-zinc-950 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/5 shadow-2xl group cursor-default">
                  <Music2 className="h-10 w-10 text-zinc-700 group-hover:text-emerald-500 transition-colors" />
                </div>
                <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest italic">No Tracks Found</h4>
                <p className="text-[10px] text-zinc-500 mt-2 uppercase tracking-widest font-black opacity-60">Upload your music to get started.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Operational Logbook */}
        <motion.div {...stagger(5)} className={`${card} overflow-hidden flex flex-col`}>
          <div className="flex items-center justify-between px-8 py-6 border-b border-white/[0.06] bg-zinc-950/40">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                 <Activity className="h-4 w-4 text-indigo-500" />
              </div>
              <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 italic">Recent Activity</h2>
            </div>
            <button
              onClick={() => navigate('/artist/earnings')}
              className="text-[10px] font-black text-emerald-500 hover:text-emerald-600 uppercase tracking-widest transition-all flex items-center gap-2 group"
            >
              Earnings History
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="divide-y divide-white/[0.04] bg-zinc-950/10">
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-5 px-8 py-6">
                  <Skeleton className="w-14 h-14 rounded-xl bg-zinc-800" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-4 w-56 bg-zinc-800" />
                    <Skeleton className="h-3 w-32 bg-zinc-800" />
                  </div>
                </div>
              ))
            ) : earnings?.history && earnings.history.length > 0 ? (
              earnings.history.slice(0, 5).map((activity: any) => (
                <div key={activity._id} className="flex items-center gap-5 px-8 py-6 hover:bg-white/[0.02] transition-colors group cursor-pointer relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.01] rounded-bl-full pointer-events-none" />
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/[0.04] shadow-inner transition-transform group-hover:scale-105 ${
                    activity.type === 'gift_received'
                      ? 'bg-emerald-500/5 text-emerald-500'
                      : 'bg-indigo-500/5 text-indigo-500'
                  }`}>
                    {activity.type === 'gift_received'
                      ? <DollarSign className="h-6 w-6" />
                      : <Music2 className="h-6 w-6" />
                    }
                  </div>
                  <div className="flex-1 min-w-0 relative z-10">
                    <p className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight truncate italic group-hover:text-emerald-500 transition-colors">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-4 mt-1.5">
                       <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest flex items-center gap-1.5 italic">
                         <Clock className="h-3.5 w-3.5" />
                         {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                       </p>
                       <div className="w-1 h-1 rounded-full bg-zinc-800 shadow-[0_0_8px_rgba(255,255,255,0.1)]" />
                       <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 animate-pulse italic">Processed</span>
                    </div>
                  </div>
                  <div className="text-right relative z-10">
                    <p className="text-lg font-black text-zinc-900 dark:text-white italic tracking-tighter tabular-nums group-hover:text-emerald-500 transition-colors">
                       ${(activity.amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-24 text-center bg-zinc-950/20">
                <div className="w-20 h-20 bg-zinc-950 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/5 shadow-2xl group cursor-default">
                  <Zap className="h-10 w-10 text-zinc-700 group-hover:text-emerald-500 transition-colors" />
                </div>
                <h4 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest italic">No Activity Yet</h4>
                <p className="text-[10px] text-zinc-500 mt-2 uppercase tracking-widest font-black opacity-60">Your earnings and activity will appear here.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Secondary HUD Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Network Collaborations */}
        <motion.div {...stagger(6)} className={`${card} overflow-hidden flex flex-col`}>
          <div className="px-8 py-6 border-b border-white/[0.06] bg-zinc-950/40">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <Layers className="h-4 w-4 text-purple-500" />
                   </div>
                   <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 italic">Collaborations</h2>
                </div>
                <span className="text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-md bg-purple-500/10 text-purple-500 border border-purple-500/20">
                  Splits
                </span>
             </div>
          </div>
          <div className="p-8">
            <ContributionList contributions={contributions} loading={loadingContributions} />
          </div>
        </motion.div>

        {/* Fiscal HUD */}
        <motion.div {...stagger(7)} className={`${card} overflow-hidden flex flex-col`}>
          <div className="px-8 py-6 border-b border-white/[0.06] bg-zinc-950/40">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-emerald-500" />
                   </div>
                   <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 italic">Earnings Overview</h2>
                </div>
                <button
                  onClick={() => navigate('/artist/earnings')}
                  className="text-[10px] font-black text-emerald-500 hover:text-emerald-600 uppercase tracking-widest transition-all"
                >
                  View Earnings
                </button>
             </div>
          </div>
          <div className="p-8 grid grid-cols-2 gap-6">
            {[
              { label: 'Total Revenue', value: `$${(earnings?.totalEarnings ?? 0).toLocaleString()}`, dot: 'bg-emerald-500' },
              { label: 'Monthly Earnings', value: `$${(earnings?.monthlyEarnings ?? 0).toLocaleString()}`, dot: 'bg-indigo-500' },
            ].map(({ label, value, dot }) => (
              <div key={label} className="p-8 bg-zinc-950/50 rounded-2xl border border-white/[0.04] group hover:border-emerald-500/20 transition-all relative overflow-hidden shadow-inner">
                <div className="absolute top-0 right-0 w-16 h-16 bg-white/[0.01] rounded-bl-full pointer-events-none" />
                <div className={`w-2 h-2 rounded-full ${dot} mb-5 shadow-lg group-hover:scale-125 transition-transform`} />
                <p className="text-[9px] font-black uppercase tracking-[0.15em] text-zinc-500 mb-2 italic">{label}</p>
                {isLoading ? (
                  <Skeleton className="h-10 w-28 mt-1 bg-zinc-800" />
                ) : (
                  <p className="text-3xl font-black text-zinc-900 dark:text-white italic tracking-tighter tabular-nums group-hover:text-emerald-500 transition-colors">{value}</p>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
