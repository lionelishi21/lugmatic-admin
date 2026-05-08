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
  Zap
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
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      iconBg: 'bg-indigo-500',
    },
    {
      icon: Headphones,
      label: 'Monthly Listeners',
      value: (stats?.monthlyListeners ?? 0).toLocaleString(),
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      iconBg: 'bg-emerald-500',
    },
    {
      icon: DollarSign,
      label: 'Total Earnings',
      value: `$${(earnings?.totalEarnings ?? 0).toLocaleString()}`,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      iconBg: 'bg-amber-500',
    },
    {
      icon: Users,
      label: 'Social Followers',
      value: (stats?.socialMediaFollowers ?? 0).toLocaleString(),
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      iconBg: 'bg-rose-500',
    },
  ];

  return (
    <div className="space-y-7 max-w-7xl mx-auto">

      {/* ── Welcome Banner ── */}
      <motion.div
        {...fadeUp}
        className="relative overflow-hidden rounded-2xl p-8 shadow-xl"
        style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #111827 50%, #064e3b 100%)' }}
      >
        {/* Decorative glows — explicitly behind content */}
        <div className="pointer-events-none absolute -right-16 -top-16 w-72 h-72 rounded-full bg-emerald-500/15 blur-3xl" style={{ zIndex: 0 }} />
        <div className="pointer-events-none absolute -bottom-8 left-1/3 w-56 h-56 rounded-full bg-emerald-400/10 blur-3xl" style={{ zIndex: 0 }} />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6" style={{ zIndex: 1 }}>
          <div>
            <p className="text-xs font-bold tracking-[0.2em] uppercase mb-2" style={{ color: '#6ee7b7' /* emerald-300 — brighter */ }}>
              Welcome back
            </p>
            <h1
              className="text-3xl md:text-4xl font-black tracking-tight leading-none"
              style={{ fontFamily: "'Bebas Neue', sans-serif", color: '#ffffff', textShadow: '0 1px 20px rgba(0,0,0,0.5)' }}
            >
              {user?.name ?? 'Artist'} Studio
            </h1>
            <p className="text-sm mt-2.5 font-normal" style={{ color: '#d1fae5' /* emerald-100 — very light, high contrast on dark */ }}>
              Your music, your audience, your revenue — all in one place.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/artist/upload')}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5"
            >
              <Music2 className="h-4 w-4" />
              Upload Track
            </button>
            <button
              onClick={() => navigate('/artist/live')}
              className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white font-semibold text-sm rounded-xl border border-white/10 transition-all hover:-translate-y-0.5"
            >
              <Radio className="h-4 w-4 text-emerald-400" />
              Go Live
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div key={card.label} {...stagger(i)}>
            <div className="stat-card group">
              <div className="flex items-start justify-between mb-5">
                <div className={`w-11 h-11 rounded-xl ${card.iconBg} flex items-center justify-center shadow-sm`}>
                  <card.icon className="h-5 w-5 text-white" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="stat-card-label">{card.label}</p>
              {isLoading ? (
                <div className="skeleton h-8 w-24 mt-1.5" />
              ) : (
                <p className="stat-card-value mt-1">{card.value}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Latest Releases */}
        <motion.div {...stagger(4)} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
            <div>
              <h2 className="section-title">Latest Releases</h2>
              <p className="text-[11px] text-gray-500 mt-0.5">Your most recent tracks</p>
            </div>
            <button
              onClick={() => navigate('/artist/songs')}
              className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-wider transition-colors group"
            >
              View All
              <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <div className="skeleton w-11 h-11 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-3.5 w-36" />
                    <div className="skeleton h-2.5 w-20" />
                  </div>
                </div>
              ))
            ) : songs && songs.length > 0 ? (
              songs.slice(0, 5).map((track: any) => (
                <div key={track._id} className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50/70 transition-colors group">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={track.coverArtUrl || track.coverArt || '/default-track-cover.jpg'}
                      alt={track.name || track.title}
                      className="w-11 h-11 rounded-xl object-cover shadow-sm flex-shrink-0"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/default-track-cover.jpg'; }}
                    />
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{track.name || track.title}</h3>
                      <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1">
                        <BarChart2 className="h-3 w-3" />
                        {(track.playCount ?? track.plays ?? 0).toLocaleString()} plays
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 pl-3">
                    <div className="flex flex-col items-end gap-1">
                      {track.uploadSource === 'admin' ? (
                        <span className="badge badge-blue">Admin</span>
                      ) : (
                        <span className="badge badge-gray">Self</span>
                      )}
                      {track.status === 'approved' ? (
                        <span className="badge badge-green">Approved</span>
                      ) : track.status === 'rejected' ? (
                        <span className="badge badge-red flex items-center gap-1">
                          <AlertCircle className="h-2 w-2" />
                          Action Needed
                        </span>
                      ) : (
                        <span className="badge badge-amber">Pending</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {track.status === 'rejected' && (
                        <button
                          onClick={() => navigate(`/artist/song-edit/${track._id}`)}
                          className="icon-btn icon-btn-red"
                          title="Edit to fix issues"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/artist/songs/${track._id}/analytics`)}
                        className="icon-btn icon-btn-purple"
                        title="View Analytics"
                      >
                        <BarChart2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-14 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Music2 className="h-5 w-5 text-gray-400" />
                </div>
                <p className="empty-state-title">No tracks yet</p>
                <p className="empty-state-body">Upload your first track to get started.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Activity Feed */}
        <motion.div {...stagger(5)} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
            <div>
              <h2 className="section-title">Recent Activity</h2>
              <p className="text-[11px] text-gray-500 mt-0.5">Latest earnings events</p>
            </div>
            <button
              onClick={() => navigate('/artist/earnings')}
              className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-wider transition-colors group"
            >
              All Earnings
              <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <div className="skeleton w-10 h-10 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-3.5 w-44" />
                    <div className="skeleton h-2.5 w-24" />
                  </div>
                </div>
              ))
            ) : earnings?.history && earnings.history.length > 0 ? (
              earnings.history.slice(0, 5).map((activity: any) => (
                <div key={activity._id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50/70 transition-colors">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    activity.type === 'gift_received' ? 'bg-emerald-50' : 'bg-indigo-50'
                  }`}>
                    {activity.type === 'gift_received'
                      ? <DollarSign className="h-4.5 w-4.5 text-emerald-600" />
                      : <Music2 className="h-4.5 w-4.5 text-indigo-600" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{activity.description}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-14 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Zap className="h-5 w-5 text-gray-400" />
                </div>
                <p className="empty-state-title">No recent activity</p>
                <p className="empty-state-body">Start streaming or gifting to see events here.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Contributions + Earnings Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Contributions */}
        <motion.div {...stagger(6)} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <h2 className="section-title">Your Contributions</h2>
                <p className="text-[11px] text-gray-500 mt-0.5">Split sheet collaborations</p>
              </div>
            </div>
            <span className="badge badge-purple">Split Sheets</span>
          </div>
          <div className="px-6 py-4">
            <ContributionList contributions={contributions} loading={loadingContributions} />
          </div>
        </motion.div>

        {/* Earnings Overview */}
        <motion.div {...stagger(7)} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <h2 className="section-title">Earnings Overview</h2>
                <p className="text-[11px] text-gray-500 mt-0.5">Revenue at a glance</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/artist/earnings')}
              className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 uppercase tracking-wider flex items-center gap-1 group"
            >
              Details <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4">
            {[
              { label: 'Total Earnings', value: `$${(earnings?.totalEarnings ?? 0).toLocaleString()}`, color: 'bg-emerald-500' },
              { label: 'This Month', value: `$${(earnings?.monthlyEarnings ?? 0).toLocaleString()}`, color: 'bg-indigo-500' },
            ].map(({ label, value, color }) => (
              <div key={label} className="p-5 bg-gray-50 rounded-xl border border-gray-100">
                <div className={`w-2 h-2 rounded-full ${color} mb-3`} />
                <p className="stat-card-label">{label}</p>
                {isLoading ? (
                  <div className="skeleton h-7 w-20 mt-1.5" />
                ) : (
                  <p className="text-2xl font-black text-gray-950 tracking-tight mt-1">{value}</p>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}