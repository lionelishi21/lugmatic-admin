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
  PlayCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Typescript Types
interface PlatformStats {
  totalArtists: number;
  totalTracks: number;
  activeLiveStreams: number;
  totalRevenue: number;
  totalListeners: number;
}

interface Artist {
  id: string;
  name: string;
  total_listeners: number;
  profile_image?: string;
  genres: string[];
}

interface RecentActivity {
  id: string;
  type: 'track_upload' | 'live_stream' | 'artist_signup' | 'playlist_created';
  artistName: string;
  title?: string;
  timestamp: string;
}

// Custom hook for data fetching
function useFetch<T>(initialData: T, fetchFunction: () => T) {
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // In a real app, this would be an async API call
        const result = fetchFunction();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchFunction]);

  return { data, loading, error };
}

// (removed unused useFetchArtist helper)

export default function MusicAdminDashboard() {
  // Generate mock data functions
  const fetchStats = () => {
    return {
      totalArtists: 1245,
      totalTracks: 45678,
      activeLiveStreams: 23,
      totalRevenue: 345678,
      totalListeners: 562345
    };
  };

  const fetchTopArtists = () => {
    return [
      {
        id: '1',
        name: 'Aria Waves',
        total_listeners: 345678,
        profile_image: '/api/placeholder/50/50',
        genres: ['Electronic', 'Ambient']
      },
      {
        id: '2',
        name: 'Jazz Horizons',
        total_listeners: 234567,
        profile_image: '/api/placeholder/50/50',
        genres: ['Jazz', 'Fusion']
      },
      {
        id: '3',
        name: 'Rock Pulse',
        total_listeners: 156789,
        profile_image: '/api/placeholder/50/50',
        genres: ['Rock', 'Alternative']
      }
    ];
  };

  const fetchRecentActivity = (): RecentActivity[] => {
    return [
      {
        id: '1',
        type: 'track_upload',
        artistName: 'Aria Waves',
        title: 'Ethereal Echoes',
        timestamp: new Date().toISOString()
      },
      {
        id: '2',
        type: 'live_stream',
        artistName: 'Jazz Horizons',
        title: 'Late Night Jazz Session',
        timestamp: new Date().toISOString()
      },
      {
        id: '3',
        type: 'playlist_created',
        artistName: 'Rock Pulse',
        title: 'Weekend Rock Mix',
        timestamp: new Date().toISOString()
      }
    ];
  };

  // Use the custom hook to fetch data
  const { data: stats } = useFetch<PlatformStats>({
    totalArtists: 0,
    totalTracks: 0,
    activeLiveStreams: 0,
    totalRevenue: 0,
    totalListeners: 0
  }, fetchStats);

  const { data: topArtists } = useFetch<Artist[]>([], fetchTopArtists);
  const { data: recentActivity } = useFetch<RecentActivity[]>([], fetchRecentActivity);

  // Example of using the artist-specific hook (not used in the UI yet)
  // const { artist: featuredArtist, loading: loadingFeatured } = useFetchArtist('featured');

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
          value={stats.totalArtists.toLocaleString()} 
          trend="+5.2%"
          color="green"
        />
        <StatCard 
          icon={Headphones} 
          title="Total Listeners" 
          value={stats.totalListeners.toLocaleString()} 
          trend="+8.7%"
          color="blue"
        />
        <StatCard 
          icon={Music2} 
          title="Total Tracks" 
          value={stats.totalTracks.toLocaleString()}
          color="emerald"
        />
        <StatCard 
          icon={Radio} 
          title="Live Streams" 
          value={stats.activeLiveStreams} 
          trend="+12.3%"
          color="rose"
        />
        <StatCard 
          icon={DollarSign} 
          title="Total Revenue" 
          value={`$${stats.totalRevenue.toLocaleString()}`} 
          trend="+9.1%"
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
            {topArtists.map((artist, index) => (
              <div 
                key={artist.id} 
                className="flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-300 w-5 text-center">{index + 1}</span>
                  <img
                    src={artist.profile_image || '/api/placeholder/50/50'}
                    alt={artist.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100"
                  />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{artist.name}</h3>
                    <p className="text-xs text-gray-500">
                      {artist.total_listeners.toLocaleString()} listeners
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {artist.genres.map((genre) => (
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
            ))}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <h2 className="text-base font-semibold text-gray-900">Recent Activity</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {recentActivity.map((activity) => (
              <div 
                key={activity.id} 
                className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-gray-50/50 transition-colors"
              >
                <div className={`p-2 rounded-lg flex-shrink-0 ${
                  activity.type === 'track_upload' ? 'bg-blue-50 ring-1 ring-blue-100' :
                  activity.type === 'live_stream' ? 'bg-green-50 ring-1 ring-green-100' : 
                  activity.type === 'playlist_created' ? 'bg-amber-50 ring-1 ring-amber-100' : 'bg-gray-50 ring-1 ring-gray-100'
                }`}>
                  {activity.type === 'track_upload' ? <Music2 className="h-4 w-4 text-blue-600" /> :
                   activity.type === 'live_stream' ? <Radio className="h-4 w-4 text-green-600" /> :
                   activity.type === 'playlist_created' ? <Heart className="h-4 w-4 text-amber-600" /> :
                   <Globe className="h-4 w-4 text-gray-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">
                    <span className="font-medium">{activity.artistName}</span>{' '}
                    {activity.type === 'track_upload' ? 'uploaded' :
                      activity.type === 'live_stream' ? 'started live stream' :
                      activity.type === 'playlist_created' ? 'created playlist' : 'performed action'
                    }{' '}
                    <span className="text-gray-600">"{activity.title}"</span>
                  </p>
                  <p className="text-xs text-gray-400 flex items-center mt-0.5">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}