import React, { useEffect } from 'react';
import { Music2, Headphones, DollarSign, TrendingUp, Clock, ExternalLink, Users, Edit2, AlertCircle } from 'lucide-react';
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
      if (res.data.success) {
        setContributions(res.data.data.songs);
      }
    } catch (err) {
      console.error('Failed to fetch contributions:', err);
    } finally {
      setLoadingContributions(false);
    }
  };

  const isLoading = artistLoading || financeLoading;

  const StatCard = ({ 
    icon: Icon, 
    title, 
    value, 
    trend,
    loading
  }: { 
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>, 
    title: string, 
    value: string | number, 
    trend?: string,
    loading?: boolean
  }) => (
    <div className="bg-white rounded-lg p-6 shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-purple-100 p-3 rounded-lg">
            <Icon className="h-6 w-6 text-purple-600" />
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-500">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-2xl font-semibold text-gray-900">{value}</p>
            )}
          </div>
        </div>
        {trend && !loading && (
          <span className="text-green-500 text-sm">
            <TrendingUp className="h-4 w-4 inline mr-1" />
            {trend}
          </span>
        )}
      </div>
    </div>
  );

  return (
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={Music2}
            title="Total Tracks"
            value={stats?.totalTracks ?? 0}
            loading={isLoading}
          />
          <StatCard
            icon={Headphones}
            title="Monthly Listeners"
            value={(stats?.monthlyListeners ?? 0).toLocaleString()}
            loading={isLoading}
          />
          <StatCard
            icon={DollarSign}
            title="Total Earnings"
            value={`$${(earnings?.totalEarnings ?? 0).toLocaleString()}`}
            loading={isLoading}
          />
          <StatCard
            icon={Users}
            title="Social Followers"
            value={(stats?.socialMediaFollowers ?? 0).toLocaleString()}
            loading={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Latest Releases */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Latest Releases</h2>
            <div className="space-y-4">
              {isLoading ? (
                [1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="w-12 h-12 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))
              ) : songs && songs.length > 0 ? (
                songs.slice(0, 5).map((track: any) => (
                  <div key={track._id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={track.coverArtUrl || track.coverArt || '/default-track-cover.jpg'}
                        alt={track.name || track.title}
                        className="w-12 h-12 rounded-lg object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/default-track-cover.jpg';
                        }}
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">{track.name || track.title}</h3>
                        <p className="text-sm text-gray-500">
                          {(track.playCount ?? track.plays ?? 0).toLocaleString()} plays
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex flex-col items-end gap-1">
                        {track.uploadSource === 'admin' ? (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                            Admin Upload
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                            Self Upload
                          </span>
                        )}

                        {track.status === 'approved' ? (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                            Approved
                          </span>
                        ) : track.status === 'rejected' ? (
                          <div className="flex flex-col items-end gap-1">
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                              <AlertCircle className="h-2 w-2" />
                              Action Required
                            </span>
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                            Pending
                          </span>
                        )}
                        
                        <div className="flex items-center gap-2">
                          {track.status === 'rejected' && (
                            <button 
                              onClick={() => navigate(`/artist/song-edit/${track._id}`)}
                              className="text-red-600 hover:text-red-700 p-1 bg-red-50 rounded-md transition-colors"
                              title="Edit to fix issues"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                          )}
                          <button className="text-purple-600 hover:text-purple-700 p-1">
                            <ExternalLink className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-gray-500">
                  No tracks uploaded yet.
                </div>
              )}
            </div>
          </div>

          {/* Your Contributions Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Your Contributions
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full uppercase tracking-wider">
                Split Sheets
              </span>
            </div>
            <ContributionList contributions={contributions} loading={loadingContributions} />
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Activity</h2>
            <div className="space-y-4">
              {isLoading ? (
                [1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))
              ) : earnings?.history && earnings.history.length > 0 ? (
                earnings.history.slice(0, 5).map((activity: any) => (
                  <div key={activity._id} className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      activity.type === 'gift_received' ? 'bg-green-100' : 'bg-purple-100'
                    }`}>
                      {activity.type === 'gift_received' ? <DollarSign className="h-5 w-5 text-green-600" /> :
                       <Music2 className="h-5 w-5 text-purple-600" />}
                    </div>
                    <div>
                      <p className="text-sm text-gray-900">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-gray-500">
                  No recent activity found.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Earnings Overview */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Earnings Overview</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Total Earnings</p>
              {isLoading ? (
                <Skeleton className="h-8 w-24 mt-1" />
              ) : (
                <p className="text-2xl font-semibold">${(earnings?.totalEarnings ?? 0).toLocaleString()}</p>
              )}
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">This Month</p>
              {isLoading ? (
                <Skeleton className="h-8 w-24 mt-1" />
              ) : (
                <p className="text-2xl font-semibold">${(earnings?.monthlyEarnings ?? 0).toLocaleString()}</p>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}