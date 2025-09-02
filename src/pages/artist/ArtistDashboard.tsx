import React from 'react';
import Layout from '../../components/Layout';
import { Music2, Headphones, DollarSign, TrendingUp, Clock, ExternalLink, Mic2, Album, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
// import useFetchArtist from '../../hooks/artist/useFetchArtist';

interface ArtistStats {
  totalTracks: number;
  monthlyListeners: number;
  totalEarnings: number;
  socialMediaFollowers: number;
}

interface Track {
  id: string;
  title: string;
  plays: number;
  cover_url: string;
}

interface RecentActivity {
  id: string;
  type: 'track_upload' | 'live_stream' | 'playlist_add';
  title: string;
  timestamp: string;
}

export default function ArtistDashboard() {
  // const { artists: featuredArtists, loading: loadingFeatured } = useFetchArtist('featured');
 
  const stats: ArtistStats = {
    totalTracks: 100,
    monthlyListeners: 1000,
    totalEarnings: 10000,
    socialMediaFollowers: 10000,
  };

  const latestTracks: Track[] = [
    { id: '1', title: 'Track 1', plays: 1000, cover_url: '/track1-cover.jpg' },
    { id: '2', title: 'Track 2', plays: 2000, cover_url: '/track2-cover.jpg' },
  ];

  const recentActivity: RecentActivity[] = [
    { id: '1', type: 'track_upload', title: 'Track 1', timestamp: '2022-01-01' },
    { id: '2', type: 'live_stream', title: 'Live Stream 1', timestamp: '2022-02-01' },
  ];

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
    <div className="bg-white rounded-lg p-6 shadow-md">
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
          <span className="text-green-500 text-sm">
            <TrendingUp className="h-4 w-4 inline mr-1" />
            {trend}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Music2}
            title="Total Tracks"
            value={stats.totalTracks}
            trend="+2 this month"
          />
          <StatCard
            icon={Headphones}
            title="Monthly Listeners"
            value={stats.monthlyListeners.toLocaleString()}
          />
          <StatCard
            icon={DollarSign}
            title="Total Earnings"
            value={`$${stats.totalEarnings.toLocaleString()}`}
          />
          <StatCard
            icon={Users}
            title="Social Followers"
            value={stats.socialMediaFollowers.toLocaleString()}
            trend="+15%"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Latest Releases */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Latest Releases</h2>
            <div className="space-y-4">
              {latestTracks.map((track) => (
                <div key={track.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={track.cover_url || '/default-track-cover.jpg'}
                      alt={track.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div>
                      <h3 className="font-medium text-gray-900">{track.title}</h3>
                      <p className="text-sm text-gray-500">
                        {track.plays?.toLocaleString() || 0} plays
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="text-purple-600 hover:text-purple-700">
                      <ExternalLink className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    activity.type === 'track_upload' ? 'bg-blue-100' :
                    activity.type === 'live_stream' ? 'bg-green-100' : 'bg-purple-100'
                  }`}>
                    {activity.type === 'track_upload' ? <Music2 className="h-5 w-5 text-blue-600" /> :
                     activity.type === 'live_stream' ? <Mic2 className="h-5 w-5 text-green-600" /> :
                     <Album className="h-5 w-5 text-purple-600" />}
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">
                      You {activity.type === 'track_upload' ? 'uploaded' : 
                          activity.type === 'live_stream' ? 'hosted a live stream' : 
                          'added to playlist'} {activity.title}
                    </p>
                    <p className="text-xs text-gray-500">
                      <Clock className="h-3 w-3 inline mr-1" />
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Earnings Overview */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Earnings Overview</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">This Month</p>
              <p className="text-2xl font-semibold">$2,450</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Last Month</p>
              <p className="text-2xl font-semibold">$3,120</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}