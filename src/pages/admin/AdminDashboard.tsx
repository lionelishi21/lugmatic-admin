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
  UserPlus
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { adminService } from '../../services/adminService';

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
    color = 'green'
  }: {
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>,
    title: string,
    value: string | number,
    trend?: string,
    color?: 'green' | 'emerald' | 'blue' | 'amber' | 'rose'
  }) => {
    const colorMap = {
      green: { bg: 'bg-green-50', icon: 'text-green-600', ring: 'ring-green-100' },
      emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', ring: 'ring-emerald-100' },
      blue: { bg: 'bg-blue-50', icon: 'text-blue-600', ring: 'ring-blue-100' },
      amber: { bg: 'bg-amber-50', icon: 'text-amber-600', ring: 'ring-amber-100' },
      rose: { bg: 'bg-rose-50', icon: 'text-rose-600', ring: 'ring-rose-100' },
    };
    const c = colorMap[color];
    return (
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
        <div className="flex items-start justify-between">
          <div className={`${c.bg} p-2.5 rounded-lg ring-1 ${c.ring}`}>
            <Icon className={`h-5 w-5 ${c.icon}`} />
          </div>
          {trend && (
            <span className="text-green-600 text-xs font-semibold flex items-center bg-green-50 px-2 py-1 rounded-md">
              <TrendingUp className="h-3 w-3 mr-0.5" />
              {trend}
            </span>
          )}
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
          <p className="text-xs text-gray-500 mt-0.5 font-medium">{title}</p>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Overview of your music platform</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="h-8 w-8 text-green-600 animate-spin mx-auto" />
            <p className="text-sm text-gray-500 mt-3">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Overview of your music platform</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
            <p className="text-sm text-red-600 mt-3">{error || 'Failed to load dashboard data'}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const overview = data.overview || {} as DashboardOverview;
  const topArtists = data.topArtists || [];
  const recentActivity = data.recentActivity || [];
  const revenue = data.revenue || { total: 0, monthly: 0, totalTransactions: 0 };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of your music platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          icon={Users}
          title="Total Artists"
          value={(overview.totalArtists ?? 0).toLocaleString()}
          color="green"
        />
        <StatCard
          icon={Headphones}
          title="Total Listeners"
          value={(overview.totalUsers ?? 0).toLocaleString()}
          color="blue"
        />
        <StatCard
          icon={Music2}
          title="Total Tracks"
          value={(overview.totalSongs ?? 0).toLocaleString()}
          color="emerald"
        />
        <StatCard
          icon={Radio}
          title="Live Streams"
          value={overview.activeLiveStreams ?? 0}
          color="rose"
        />
        <StatCard
          icon={DollarSign}
          title="Total Revenue"
          value={`$${(revenue.total / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top Artists Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex justify-between items-center px-5 py-4 border-b border-gray-50">
            <h2 className="text-base font-semibold text-gray-900">Top Artists</h2>
            <button className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1">
              View All <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {topArtists.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-gray-400">
                No artists found
              </div>
            ) : (
              topArtists.map((artist, index) => (
                <div
                  key={artist._id}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-300 w-5 text-center">{index + 1}</span>
                    <img
                      src={artist.image || '/api/placeholder/50/50'}
                      alt={artist.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100"
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.name)}&background=22c55e&color=fff`; }}
                    />
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{artist.name}</h3>
                      <p className="text-xs text-gray-500">
                        {(artist.followerCount ?? 0).toLocaleString()} followers
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(artist.genres || []).slice(0, 2).map((genre) => (
                      <span
                        key={genre}
                        className="text-[10px] font-medium bg-green-50 text-green-700 px-2 py-0.5 rounded-full"
                      >
                        {genre}
                      </span>
                    ))}
                    <button className="text-gray-300 hover:text-green-500 transition-colors ml-1">
                      <PlayCircle className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h2 className="text-base font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {recentActivity.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-gray-400">
                No recent activity
              </div>
            ) : (
              recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-gray-50/50 transition-colors"
                >
                  <div className={`p-2 rounded-lg flex-shrink-0 ${activity.type === 'track_upload' ? 'bg-blue-50 ring-1 ring-blue-100' :
                    activity.type === 'live_stream' ? 'bg-green-50 ring-1 ring-green-100' :
                      activity.type === 'artist_signup' ? 'bg-purple-50 ring-1 ring-purple-100' :
                        activity.type === 'playlist_created' ? 'bg-amber-50 ring-1 ring-amber-100' : 'bg-gray-50 ring-1 ring-gray-100'
                    }`}>
                    {activity.type === 'track_upload' ? <Music2 className="h-4 w-4 text-blue-600" /> :
                      activity.type === 'live_stream' ? <Radio className="h-4 w-4 text-green-600" /> :
                        activity.type === 'artist_signup' ? <UserPlus className="h-4 w-4 text-purple-600" /> :
                          activity.type === 'playlist_created' ? <Heart className="h-4 w-4 text-amber-600" /> :
                            <Globe className="h-4 w-4 text-gray-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">
                      <span className="font-medium">{activity.artistName}</span>{' '}
                      {activity.type === 'track_upload' ? 'uploaded' :
                        activity.type === 'live_stream' ? 'started live stream' :
                          activity.type === 'artist_signup' ? 'joined as artist' :
                            activity.type === 'playlist_created' ? 'created playlist' : 'performed action'
                      }{' '}
                      {activity.title && <span className="text-gray-600">"{activity.title}"</span>}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center mt-0.5">
                      <Clock className="h-3 w-3 mr-1" />
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