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

// Custom hook for fetching artists
function useFetchArtist(artistId?: string) {
  const [artist, setArtist]    = useState<Artist | null>(null);
  const [loading, setLoading]  = useState<boolean>(false);
  const [error, setError]      = useState<string | null>(null);

  useEffect(() => {
    if (!artistId) return;

    const fetchArtist = async () => {
      setLoading(true);
      try {
        // Mock API call - in a real app, this would be a fetch to your API
        // const response = await fetch(`/api/artists/${artistId}`);
        // const data = await response.json();
        
        // Mock data for demonstration
        const mockArtist: Artist = {
          id: artistId,
          name: 'Artist ' + artistId,
          total_listeners: 100000,
          profile_image: '/api/placeholder/50/50',
          genres: ['Pop', 'Rock']
        };
        
        setArtist(mockArtist);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch artist');
      } finally {
        setLoading(false);
      }
    };

    fetchArtist();
  }, [artistId]);

  return { artist, loading, error };
}

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
  const { artists: featuredArtists, loading: loadingFeatured } = useFetchArtist('featured');

  const StatCard = ({ 
    icon: Icon, 
    title, 
    value, 
    trend 
  }: { 
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>, 
    title: string, 
    value: string | number, 
    trend?: string 
  }) => (
    <div className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-purple-100 p-3 rounded-lg">
            <Icon className="h-6 w-6 text-purple-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
          </div>
        </div>
        {trend && (
          <span className="text-green-500 text-sm flex items-center">
            <TrendingUp className="h-4 w-4 mr-1" />
            {trend}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Music Platform Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatCard 
          icon={Users} 
          title="Total Artists" 
          value={stats.totalArtists} 
          trend="+5.2%" 
        />
        <StatCard 
          icon={Headphones} 
          title="Total Listeners" 
          value={stats.totalListeners.toLocaleString()} 
          trend="+8.7%" 
        />
        <StatCard 
          icon={Music2} 
          title="Total Tracks" 
          value={stats.totalTracks} 
        />
        <StatCard 
          icon={Radio} 
          title="Live Streams" 
          value={stats.activeLiveStreams} 
          trend="+12.3%" 
        />
        <StatCard 
          icon={DollarSign} 
          title="Total Revenue" 
          value={`$${stats.totalRevenue.toLocaleString()}`} 
          trend="+9.1%" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Artists Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Top Artists</h2>
            <button className="text-purple-600 hover:text-purple-700 flex items-center">
              View All <ExternalLink className="ml-2 h-4 w-4" />
            </button>
          </div>
          <div className="space-y-4">
            {topArtists.map((artist) => (
              <div 
                key={artist.id} 
                className="flex items-center justify-between hover:bg-gray-100 p-2 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={artist.profile_image || '/api/placeholder/50/50'}
                    alt={artist.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">{artist.name}</h3>
                    <p className="text-sm text-gray-500">
                      {artist.total_listeners.toLocaleString()} listeners
                    </p>
                    <div className="flex space-x-2 mt-1">
                      {artist.genres.map((genre) => (
                        <span 
                          key={genre} 
                          className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <button className="text-purple-600 hover:text-purple-700">
                  <PlayCircle className="h-6 w-6" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div 
                key={activity.id} 
                className="flex items-center space-x-4 hover:bg-gray-100 p-2 rounded-lg transition-colors"
              >
                <div className={`p-2 rounded-lg ${
                  activity.type === 'track_upload' ? 'bg-blue-100' :
                  activity.type === 'live_stream' ? 'bg-green-100' : 
                  activity.type === 'playlist_created' ? 'bg-purple-100' : 'bg-gray-100'
                }`}>
                  {activity.type === 'track_upload' ? <Music2 className="h-5 w-5 text-blue-600" /> :
                   activity.type === 'live_stream' ? <Radio className="h-5 w-5 text-green-600" /> :
                   activity.type === 'playlist_created' ? <Heart className="h-5 w-5 text-purple-600" /> :
                   <Globe className="h-5 w-5 text-gray-600" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    {activity.artistName} {
                      activity.type === 'track_upload' ? 'uploaded' :
                      activity.type === 'live_stream' ? 'started live stream' :
                      activity.type === 'playlist_created' ? 'created playlist' : 'performed action'
                    } "{activity.title}"
                  </p>
                  <p className="text-xs text-gray-500 flex items-center">
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