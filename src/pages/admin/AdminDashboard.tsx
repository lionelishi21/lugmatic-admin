import React, { useEffect, useState } from 'react';
import {
  Users,
  Music2,
  Radio,
  DollarSign,
  TrendingUp,
  Clock,
  Headphones,
  Globe,
  PlayCircle,
  AlertCircle,
  UserPlus,
  LayoutGrid,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { adminService } from '../../services/adminService';
import { Skeleton } from '../../components/ui/skeleton';

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

export default function AdminDashboard() {
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
    color = 'emerald',
    index
  }: {
    icon: any,
    title: string,
    value: string | number,
    color?: 'emerald' | 'blue' | 'amber' | 'rose',
    index: number
  }) => {
    const colorMap = {
      emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-500' },
      blue:    { bg: 'bg-blue-500/10',    text: 'text-blue-500' },
      amber:   { bg: 'bg-amber-500/10',   text: 'text-amber-500' },
      rose:    { bg: 'bg-rose-500/10',    text: 'text-rose-500' },
    };
    const c = colorMap[color];
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="premium-card premium-card-hover"
      >
        <div className="flex items-center justify-between mb-6">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${c.bg}`}>
            <Icon className={`h-6 w-6 ${c.text}`} />
          </div>
        </div>
        <div>
          <p className="text-zinc-500 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-48 w-full rounded-2xl bg-[#0a0a0a] border border-white/5" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-40 rounded-2xl bg-[#0a0a0a] border border-white/5" />)}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="premium-card p-12 text-center">
        <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
        <p className="text-white font-medium mb-6">{error || 'Failed to load dashboard'}</p>
        <button onClick={() => window.location.reload()} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  const overview = data.overview || {} as DashboardOverview;
  const topArtists = Array.isArray(data.topArtists) ? data.topArtists : [];
  const recentActivity = Array.isArray(data.recentActivity) ? data.recentActivity : [];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Dashboard</h1>
          <p className="text-zinc-500">Platform overview and real-time performance metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/5 border border-emerald-500/20 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Live System Sync</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          title="Total Artists"
          value={(overview.totalArtists ?? 0).toLocaleString()}
          color="emerald"
          index={0}
        />
        <StatCard
          icon={Headphones}
          title="Listeners"
          value={(overview.totalUsers ?? 0).toLocaleString()}
          color="blue"
          index={1}
        />
        <StatCard
          icon={Music2}
          title="Total Tracks"
          value={(overview.totalSongs ?? 0).toLocaleString()}
          color="amber"
          index={2}
        />
        <StatCard
          icon={Radio}
          title="Live Streams"
          value={overview.activeLiveStreams ?? 0}
          color="rose"
          index={3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Leaderboard */}
        <div className="premium-card flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold">Top Performing Artists</h2>
            <button className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1">
              View All <ChevronRight size={16} />
            </button>
          </div>
          
          <div className="space-y-6 flex-1">
            {topArtists.length === 0 ? (
              <div className="h-full flex items-center justify-center text-zinc-600 italic">No data available</div>
            ) : (
              topArtists.map((artist, index) => (
                <div key={artist._id} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <span className="text-zinc-700 font-bold w-4">{index + 1}</span>
                    <img
                      src={artist.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.name)}&background=10b981&color=fff`}
                      alt={artist.name}
                      className="w-11 h-11 rounded-xl object-cover border border-white/5 group-hover:border-emerald-500/30 transition-all"
                    />
                    <div>
                      <h4 className="font-semibold text-white group-hover:text-emerald-400 transition-colors">{artist.name}</h4>
                      <p className="text-xs text-zinc-500">{(artist.followerCount ?? 0).toLocaleString()} followers</p>
                    </div>
                  </div>
                  <TrendingUp className="text-zinc-800 group-hover:text-emerald-500 transition-colors" size={18} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="premium-card flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold">Recent Activity</h2>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          
          <div className="space-y-6 flex-1">
            {recentActivity.length === 0 ? (
              <div className="h-full flex items-center justify-center text-zinc-600 italic">No recent activity</div>
            ) : (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/5 ${
                    activity.type === 'track_upload' ? 'bg-blue-500/10 text-blue-500' :
                    activity.type === 'live_stream' ? 'bg-emerald-500/10 text-emerald-500' :
                    'bg-zinc-800 text-zinc-400'
                  }`}>
                    {activity.type === 'track_upload' ? <Music2 size={18} /> : <Radio size={18} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">
                      <span className="font-semibold">{activity.artistName}</span>
                      <span className="text-zinc-500">
                        {activity.type === 'track_upload' ? ' uploaded ' : ' started '}
                      </span>
                      {activity.title && <span className="font-medium text-emerald-400">"{activity.title}"</span>}
                    </p>
                    <p className="text-[11px] text-zinc-600 flex items-center gap-1.5 mt-1">
                      <Clock size={12} />
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}