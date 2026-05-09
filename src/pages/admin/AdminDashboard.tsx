import React, { useEffect, useState } from 'react';
import {
  Users,
  Music2,
  Radio,
  DollarSign,
  TrendingUp,
  Clock,
  ExternalLink,
  Heart,
  Headphones,
  Globe,
  PlayCircle,
  Loader2,
  AlertCircle,
  UserPlus,
  LayoutGrid,
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { adminService } from '../../services/adminService';
import { Skeleton } from '../../components/ui/skeleton';

// Types matching the API response
interface DashboardOverview {
  totalUsers: number;
  totalArtists: number;
  totalSongs: number;
  totalAlbums: number;
  totalPodcasts: number;
  totalGifts: number;
  totalComments: number;
  totalSubscriptions: number;
  activeLiveStreams: number;
}

interface TopArtist {
  _id: string;
  name: string;
  image?: string;
  genres: string[];
  followerCount: number;
}

interface RecentActivity {
  id: string;
  type: 'track_upload' | 'live_stream' | 'artist_signup' | 'playlist_created';
  artistName: string;
  title?: string | null;
  timestamp: string;
}

interface Revenue {
  total: number;
  monthly: number;
  totalTransactions: number;
}

interface DashboardData {
  overview: DashboardOverview;
  topArtists: TopArtist[];
  recentActivity: RecentActivity[];
  revenue: Revenue;
}

const card = 'bg-zinc-900 border border-white/[0.06] rounded-lg shadow-2xl relative overflow-hidden group';

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: 'easeOut' },
};

export default function MusicAdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await adminService.getDashboardData();
        const raw = response.data as any;
        const dashData: DashboardData = raw?.data || raw;
        if (!dashData || (!dashData.overview && !dashData.topArtists)) {
          throw new Error('Invalid dashboard data received');
        }
        setData(dashData);
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err?.response?.data?.message || err?.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const StatCard = ({
    icon: Icon,
    title,
    value,
    trend,
    color = 'emerald',
    index
  }: {
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>,
    title: string,
    value: string | number,
    trend?: string,
    color?: 'emerald' | 'blue' | 'amber' | 'rose',
    index: number
  }) => {
    const colorMap = {
      emerald: { bg: 'bg-emerald-500/10', icon: 'text-emerald-500', pulse: 'bg-emerald-500' },
      blue:    { bg: 'bg-blue-500/10',    icon: 'text-blue-500',    pulse: 'bg-blue-500' },
      amber:   { bg: 'bg-amber-500/10',   icon: 'text-amber-500',   pulse: 'bg-amber-500' },
      rose:    { bg: 'bg-rose-500/10',    icon: 'text-rose-500',    pulse: 'bg-rose-500' },
    };
    const c = colorMap[color];
    return (
      <motion.div 
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.07 }}
        className={`${card} p-6 hover:border-emerald-500/20 transition-all shadow-xl`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className={`w-10 h-10 rounded flex items-center justify-center ${c.bg} border border-white/5`}>
            <Icon className={`h-5 w-5 ${c.icon}`} />
          </div>
          <div className={`w-1.5 h-1.5 rounded-full ${c.pulse} animate-pulse`} />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1.5 italic">{title}</p>
        <p className="text-2xl font-black text-white tracking-tighter uppercase italic">{value}</p>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto pb-24 space-y-8">
        <Skeleton className="h-48 w-full rounded-lg bg-zinc-900 border border-white/5" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-lg bg-zinc-900 border border-white/5" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Skeleton className="h-96 rounded-lg bg-zinc-900 border border-white/5" />
          <Skeleton className="h-96 rounded-lg bg-zinc-900 border border-white/5" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <div className={`${card} p-12 text-center`}>
          <AlertCircle className="h-10 w-10 text-rose-500 mx-auto mb-4" />
          <p className="text-[11px] font-black uppercase tracking-widest text-white mb-6 italic">{error || 'Failed to load dashboard data'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded hover:bg-emerald-400 transition-all italic"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const overview = data.overview || {} as DashboardOverview;
  const topArtists = Array.isArray(data.topArtists) ? data.topArtists : [];
  const recentActivity = Array.isArray(data.recentActivity) ? data.recentActivity : [];

  return (
    <div className="max-w-6xl mx-auto pb-24 space-y-8">
      
      {/* ── Welcome Banner ── */}
      <motion.div {...fadeUp} className={`${card} p-8 group`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/10 transition-colors" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
             <div className="w-16 h-16 bg-emerald-500 rounded flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
                <LayoutGrid className="h-8 w-8 text-black" />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-1.5 italic">Operational Intelligence</p>
                <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
                  Command Center
                </h1>
                <p className="text-xs text-zinc-500 mt-1 uppercase font-bold tracking-widest max-w-sm">
                  Global platform oversight and executive control. Monitoring live ecosystem health.
                </p>
             </div>
          </div>
          <div className="flex flex-col items-end">
             <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest animate-pulse flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Live Sync Active
             </span>
             <p className="text-[11px] text-zinc-600 font-bold mt-1 uppercase tracking-widest italic">v2.4.0 Studio Edition</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          title="Total Artists"
          value={(overview.totalArtists ?? 0).toLocaleString()}
          color="emerald"
          index={0}
        />
        <StatCard
          icon={Headphones}
          title="Total Listeners"
          value={(overview.totalUsers ?? 0).toLocaleString()}
          color="blue"
          index={1}
        />
        <StatCard
          icon={Music2}
          title="Total Tracks"
          value={(overview.totalSongs ?? 0).toLocaleString()}
          color="emerald"
          index={2}
        />
        <StatCard
          icon={Radio}
          title="Live Streams"
          value={overview.activeLiveStreams ?? 0}
          trend="Active"
          color="rose"
          index={3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Top Artists Section */}
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className={`${card} overflow-hidden`}>
          <div className="flex items-center justify-between px-8 py-6 border-b border-white/[0.06] bg-zinc-800/30">
            <div className="flex items-center gap-3">
               <div className="w-6 h-6 bg-emerald-500/10 rounded flex items-center justify-center">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
               </div>
               <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic">Leaderboard</h2>
            </div>
            <button className="text-[10px] font-black text-emerald-500 hover:text-emerald-400 uppercase tracking-widest transition-all flex items-center gap-1.5 italic">
              Full Registry
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {topArtists.length === 0 ? (
              <div className="py-24 text-center">
                <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">No data detected</p>
              </div>
            ) : (
              topArtists.map((artist, index) => (
                <div
                  key={artist._id}
                  className="flex items-center justify-between px-8 py-5 hover:bg-white/[0.02] transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-[11px] font-black text-zinc-800 w-4 italic">{index + 1}</span>
                    <div className="relative">
                       <img
                         src={artist.image || '/api/placeholder/50/50'}
                         alt={artist.name}
                         className="w-12 h-12 rounded object-cover border border-white/10 group-hover:border-emerald-500/30 transition-all"
                         onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.name)}&background=10b981&color=fff`; }}
                       />
                       <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-zinc-950 border border-white/10 rounded flex items-center justify-center">
                          <Heart className="w-2 h-2 text-rose-500 fill-rose-500" />
                       </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-tight truncate italic">{artist.name}</h3>
                      <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-2 mt-1">
                        <Users className="h-2.5 w-2.5 text-emerald-500" />
                        {(artist.followerCount ?? 0).toLocaleString()} <span className="text-zinc-600">Followers</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="hidden sm:block text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-zinc-950 border border-white/5 text-zinc-600 italic">
                      {(artist.genres || [])[0] || 'Artist'}
                    </span>
                    <PlayCircle className="h-5 w-5 text-zinc-700 group-hover:text-emerald-500 transition-all" />
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Recent Activity Section */}
        <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className={`${card} overflow-hidden`}>
          <div className="flex items-center justify-between px-8 py-6 border-b border-white/[0.06] bg-zinc-800/30">
            <div className="flex items-center gap-3">
               <div className="w-6 h-6 bg-blue-500/10 rounded flex items-center justify-center">
                  <Globe className="h-3 w-3 text-blue-500" />
               </div>
               <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic">Event Stream</h2>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="divide-y divide-white/[0.04]">
            {recentActivity.length === 0 ? (
              <div className="py-24 text-center">
                <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest italic">Stream silent</p>
              </div>
            ) : (
              recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 px-8 py-5 hover:bg-white/[0.02] transition-colors group"
                >
                  <div className={`w-12 h-12 rounded flex items-center justify-center flex-shrink-0 border border-white/5 ${
                    activity.type === 'track_upload' ? 'bg-blue-500/10 text-blue-500' :
                    activity.type === 'live_stream' ? 'bg-emerald-500/10 text-emerald-500' :
                    activity.type === 'artist_signup' ? 'bg-rose-500/10 text-rose-500' :
                    'bg-zinc-800 text-zinc-600'
                  }`}>
                    {activity.type === 'track_upload' ? <Music2 className="h-5 w-5" /> :
                      activity.type === 'live_stream' ? <Radio className="h-5 w-5" /> :
                        activity.type === 'artist_signup' ? <UserPlus className="h-5 w-5" /> :
                          <Globe className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black text-white uppercase tracking-tight truncate italic">
                      {activity.artistName}{' '}
                      <span className="text-zinc-500 font-bold lowercase tracking-normal italic">
                        {activity.type === 'track_upload' ? 'uploaded' :
                          activity.type === 'live_stream' ? 'started live' :
                            activity.type === 'artist_signup' ? 'joined' :
                              activity.type === 'playlist_created' ? 'created' : 'performed'}
                      </span>{' '}
                      {activity.title && <span>"{activity.title}"</span>}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                       <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest flex items-center gap-1.5 italic">
                         <Clock className="h-3 w-3 text-zinc-700" />
                         {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                       </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}